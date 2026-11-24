// Thunderbolt: the animations of the page.
// Every part reads in full without JavaScript; this file only adds motion and the buy button.
(function () {
  'use strict';

  /* ---------- settings ---------- */
  // The payment page. Leave empty on a demo: the button then says the payment comes with the launch.
  // For the live site, put the Stripe payment link between the quotes.
  const PAYMENT_URL = '';

  /* ---------- helpers ---------- */
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mod = (n, m) => ((n % m) + m) % m;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const POINTER = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const boltSvg = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'boltsvg');
    svg.innerHTML = '<use href="#bolt"/>';
    return svg;
  };

  /* ---------- hero: the cap turns face to profile, tilts with the pointer and floats ---------- */
  const hero = $('#hero');
  const stage = $('#stage');
  const cap = $('#heroCap');
  const capTurn = $('.fl', cap);
  const imgFace = $('.f', cap);
  const imgSide = $('.b', cap);
  const capShadow = $('.sh', cap);
  const viewLabel = $('#viewLabel');
  const reveal = $('.reveal', hero);
  const VIEWS = [
    { label: 'Face · logo éclair brodé', colour: '#f39c1e', alt: imgFace.alt },
    { label: 'Profil · visière courbée', colour: '#f6c340', alt: 'La casquette Thunderbolt vue de profil' },
  ];

  let angle = 0; // degrees: 0 face, 180 profile, 360 face again...
  let target = 0;
  let view = 0;
  let lastTurn = performance.now();
  let introDone = !!window.__introDone;
  let tilt = { x: 0, y: 0 };
  let tiltTarget = { x: 0, y: 0 };

  function turnTo(deg) {
    target = deg;
    lastTurn = performance.now();
  }
  $('#next').addEventListener('click', () => turnTo(Math.round(target / 180) * 180 + 180));

  // drag sideways to turn it
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    if (drag || e.button > 0 || e.target.closest('button')) return;
    drag = { x: e.clientX, angle, id: e.pointerId };
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('drag');
  });
  stage.addEventListener('pointermove', (e) => {
    if (POINTER && !REDUCED) {
      const r = stage.getBoundingClientRect();
      tiltTarget = { x: (e.clientY - r.top) / r.height - 0.5, y: (e.clientX - r.left) / r.width - 0.5 };
    }
    if (drag && e.pointerId === drag.id) angle = drag.angle + (e.clientX - drag.x) * 0.55;
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    stage.classList.remove('drag');
    turnTo(Math.round(angle / 180) * 180);
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('pointerleave', () => (tiltTarget = { x: 0, y: 0 }));

  // the hero's colour follows the view, opening in a circle from the cap
  let revealFrame = 0;
  function colourTo(colour) {
    document.querySelector('meta[name=theme-color]').content = colour;
    if (REDUCED) return hero.style.setProperty('--c', colour);
    const radius = Math.hypot(innerWidth, innerHeight) + 160;
    const t0 = performance.now();
    reveal.style.background = colour;
    cancelAnimationFrame(revealFrame);
    const step = (t) => {
      const k = clamp((t - t0) / 760);
      reveal.style.setProperty('--r', easeOut(k) * radius + 'px');
      if (k < 1) revealFrame = requestAnimationFrame(step);
      else {
        hero.style.setProperty('--c', colour);
        reveal.style.setProperty('--r', '0px');
      }
    };
    revealFrame = requestAnimationFrame(step);
  }

  function setView(v) {
    if (v === view) return;
    view = v;
    viewLabel.textContent = VIEWS[v].label;
    imgFace.alt = v === 0 ? VIEWS[0].alt : '';
    imgSide.alt = v === 1 ? VIEWS[1].alt : '';
    colourTo(VIEWS[v].colour);
  }

  function drawCap(now) {
    if (!drag) angle = REDUCED ? target : lerp(angle, target, 0.09);
    // turns by itself every few seconds while the hero is on screen and nobody touches it
    const idle = now - lastTurn > 4200 && !drag && introDone && !REDUCED && !document.hidden;
    if (idle && scrollY < innerHeight * 0.5) turnTo(Math.round(target / 180) * 180 + 180);
    tilt.x = lerp(tilt.x, tiltTarget.x, 0.08);
    tilt.y = lerp(tilt.y, tiltTarget.y, 0.08);

    // both pictures show together only for a short moment of the turn, bridged by a light blur
    const k = mod(angle / 180, 2);
    const swing = Math.sin(k * Math.PI);
    const side = clamp(((1 - Math.cos(k * Math.PI)) / 2 - 0.38) / 0.24);
    const mix = side * side * (3 - 2 * side);
    const blur = Math.sin(side * Math.PI) * 2.5;
    const float = REDUCED ? 0 : Math.sin((now / 1000) * 1.3) * 6;
    capTurn.style.transform =
      `translateY(${float.toFixed(1)}px) rotateX(${(-tilt.x * 10).toFixed(2)}deg) ` +
      `rotateY(${(swing * -32 + tilt.y * 16).toFixed(2)}deg)`;
    capTurn.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
    imgFace.style.opacity = (1 - mix).toFixed(3);
    imgSide.style.opacity = mix.toFixed(3);
    capShadow.style.width = (62 * (1 - 0.2 * Math.abs(swing))).toFixed(1) + '%';
    setView(mod(Math.round(angle / 180), 2));
  }

  /* ---------- identity: a storm of bolts, led by the scroll ---------- */
  const identity = $('#identite');
  const identityTitle = $('.id-title');
  const boltLayer = $('.id-bolts');
  const storm = [];
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div');
    el.className = 'sb';
    el.appendChild(boltSvg());
    boltLayer.appendChild(el);
    storm.push({
      el,
      angle: i * 2.39996,
      ring: 0.3 + (((i * 37) % 11) / 11) * 0.32,
      size: 0.5 + (((i * 53) % 7) / 7) * 0.9,
      speed: 0.8 + (((i * 29) % 5) / 5) * 0.9,
      spin: (i * 71) % 360,
    });
  }
  function sizeStorm() {
    const k = (Math.min(innerWidth, innerHeight) / 900) * (innerWidth < 820 ? 1.1 : 1);
    storm.forEach((b) => {
      b.w = 90 * b.size * k;
      b.el.style.setProperty('--bw', b.w + 'px');
    });
  }
  function drawStorm(now) {
    const r = identity.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const progress = clamp(-r.top / Math.max(1, r.height - innerHeight)); // 0 to 1 while the section is pinned
    identityTitle.classList.toggle('in', REDUCED || progress > 0.12);
    const W = innerWidth,
      H = innerHeight,
      M = Math.min(W, H),
      phone = W < 820,
      t = now / 1000;
    storm.forEach((b, i) => {
      const k = REDUCED ? 1 : easeOut(clamp(progress * 2.2 - i * 0.03));
      const a = b.angle + (REDUCED ? 0 : progress * b.speed * 5 + t * 0.15 * b.speed);
      const radius = lerp(
        Math.max(W, H) * 0.85,
        b.ring * M * (phone ? 1.05 : 1.25) + (phone ? 0 : M * 0.06),
        k,
      );
      const x = W / 2 + Math.cos(a) * radius * (phone ? 0.9 : 1.25) - b.w / 2;
      const y = H / 2 + Math.sin(a) * radius * 0.78 - b.w / 2;
      b.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(b.spin + progress * 240 * b.speed).toFixed(1)}deg)`;
      b.el.style.opacity = k.toFixed(3);
    });
  }

  /* ---------- order: the gallery and the buy button ---------- */
  const galleryImages = $$('#galleryMain img');
  const thumbs = $$('.thumbs button');
  thumbs.forEach((thumb, i) =>
    thumb.addEventListener('click', () => {
      galleryImages.forEach((img, j) => img.classList.toggle('on', i === j));
      thumbs.forEach((t, j) => {
        t.classList.toggle('on', i === j);
        t.setAttribute('aria-pressed', String(i === j));
      });
    }),
  );

  const buy = $('#buy');
  if (PAYMENT_URL) {
    buy.href = PAYMENT_URL;
    buy.target = '_blank';
    buy.rel = 'noopener';
  } else {
    buy.addEventListener('click', (e) => {
      e.preventDefault();
      $('#buyNote').textContent = 'Version démo : le paiement sera activé à la mise en ligne du site.';
    });
  }

  /* ---------- nav: the current part, dark over dark parts, a ground once the hero has gone ---------- */
  const navLinks = $$('.pill a');
  const navMarker = $('.pill .hl');
  const navTargets = navLinks.map((a) => $(a.getAttribute('href')));
  const darkParts = [identity, $('#order'), $('.foot')];
  let navOn = '';
  function setNav(id) {
    if (id === navOn) return;
    navOn = id;
    navLinks.forEach((a) => {
      const on = a.dataset.s === id;
      a.classList.toggle('on', on);
      if (on) {
        navMarker.style.width = a.offsetWidth + 'px';
        navMarker.style.transform = `translateX(${a.offsetLeft}px)`;
      }
    });
  }
  function drawNav() {
    let current = navLinks[0].dataset.s;
    navTargets.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= innerHeight * 0.45) current = navLinks[i].dataset.s;
    });
    setNav(current);
    const overDark = darkParts.some((el) => {
      const r = el.getBoundingClientRect();
      return r.top < 40 && r.bottom > 40;
    });
    document.body.classList.toggle('navdark', overDark);
    document.body.classList.toggle('navbg', scrollY > innerHeight * 0.6);
  }
  const refreshNav = () => {
    const id = navOn;
    navOn = '';
    setNav(id || 'hero');
  };

  /* ---------- footer: the name rises letter by letter once it comes on screen ---------- */
  const word = $('.foot__word');
  const letters = word && $('span', word);
  if (letters) {
    const text = letters.textContent;
    letters.textContent = '';
    [...text].forEach((c, i) => {
      const l = document.createElement('span');
      l.className = 'l';
      l.textContent = c;
      l.style.transitionDelay = 120 + i * 45 + 'ms';
      letters.appendChild(l);
    });
    if (!REDUCED && 'IntersectionObserver' in window) {
      word.classList.add('wait');
      new IntersectionObserver(
        (entries, observer) => {
          if (entries.some((e) => e.isIntersecting)) {
            word.classList.add('in');
            observer.disconnect();
          }
        },
        { threshold: 0.35 },
      ).observe(word);
    }
  }

  /* ---------- start ---------- */
  addEventListener('tb:intro', () => {
    introDone = true;
    lastTurn = performance.now();
  });
  addEventListener('resize', () => {
    sizeStorm();
    refreshNav();
  });
  document.fonts.ready.then(refreshNav);
  sizeStorm();
  (function frame(now) {
    drawCap(now);
    drawStorm(now);
    drawNav();
    requestAnimationFrame(frame);
  })(performance.now());
})();
