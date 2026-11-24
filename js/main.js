// Thunderbolt: every animation of the page (hero, details, storm, order, footer).
(function () {
  /* ---------- settings ---------- */
  // The payment page. Leave empty on a demo: the button then says the payment comes with the launch.
  // For the live site, put the Stripe payment link between the quotes.
  const PAYMENT_URL = '';

  /* ---------- data ---------- */
  const S = [
    { t: 'Brodée', bg: '#f39c1e', tag: 'Face · logo éclair brodé' },
    { t: 'Sobre', bg: '#f6c340', tag: 'Profil · visière courbée' },
  ];
  // detail steps: a = turn (0 face, 180 profile), z = zoom, px/py = point brought to the centre (fractions of the 1000x900 box)
  const ST = [
    { a: 0, z: 1.14, px: 0.5, py: 0.42 },
    { a: 180, z: 1, px: 0.5, py: 0.5 },
    { a: 200, z: 1.06, px: 0.55, py: 0.54 },
    { a: 360, z: 1, px: 0.5, py: 0.5 },
  ];
  const BOXW = 1000;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(pointer: fine)').matches;
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mod = (n, m) => ((n % m) + m) % m;
  const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eout = (t) => 1 - Math.pow(1 - t, 3);
  const sine = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
  const boltEl = () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'boltsvg');
    s.innerHTML = '<use href="#bolt"/>';
    return s;
  };

  /* ---------- the travelling cap ---------- */
  const cap = $('#cap'),
    zm = $('#cap .zm'),
    fl = $('#cap .fl'),
    capSh = $('#cap .sh'),
    imgF = $('#cap .f'),
    imgB = $('#cap .b');
  function apply(s) {
    cap.style.opacity = s.o.toFixed(3);
    if (s.o < 0.004) return;
    cap.style.transform = `translate3d(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px,0) translate(-50%,-50%) scale(${(s.w / BOXW).toFixed(4)}) rotate(${s.rz.toFixed(2)}deg)`;
    zm.style.transform = `scale(${s.z.toFixed(4)}) translate(${((0.5 - s.px) * 100).toFixed(2)}%,${((0.5 - s.py) * 100).toFixed(2)}%)`;
    const k = (((s.ry / 180) % 2) + 2) % 2,
      turn = Math.sin(k * Math.PI),
      tp = (1 - Math.cos(k * Math.PI)) / 2,
      ts = clamp((tp - 0.38) / 0.24),
      sm = ts * ts * (3 - 2 * ts),
      face = 1 - sm,
      bl = Math.sin(ts * Math.PI) * 2.5;
    fl.style.transform = `perspective(2600px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${(turn * -32).toFixed(2)}deg) scale(${s.sx.toFixed(3)},${s.sy.toFixed(3)})`;
    imgF.style.opacity = face.toFixed(3);
    imgB.style.opacity = (1 - face).toFixed(3);
    fl.style.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : 'none';
    capSh.style.opacity = (s.shO * (1 - (s.z - 1) * 1.6)).toFixed(3);
    capSh.style.width = 70 * (1 - 0.22 * Math.abs(turn)) + '%';
  }

  /* ---------- layout ---------- */
  let vw = innerWidth,
    vh = innerHeight,
    phone = vw < 820;
  const hero = $('#hero'),
    inside = $('#inside'),
    inBar = $('#inBar'),
    inFront = $('#inFront'),
    orderEl = $('#order'),
    photo = $('#photo'),
    faqEl = $('#faq'),
    footEl = $('.foot');
  function heroW() {
    return phone ? Math.min(vw * 0.88, vh * 0.5) : Math.min(vw * 0.5, vh * 0.66, 680);
  }
  function measure() {
    vw = innerWidth;
    vh = innerHeight;
    phone = vw < 820;
    fitTitle();
    placeBits();
    sizeStorm();
    if (typeof navOn !== 'undefined') {
      const id = navOn;
      navOn = '';
      setNav(id);
    }
  }

  /* ---------- hero ---------- */
  let sel = 0,
    ang = 0,
    angT = 0,
    dragging = false,
    lastAuto = performance.now(),
    introDone = false,
    entT = Infinity,
    lockArc = false;
  let tiltX = 0,
    tiltY = 0,
    tX = 0,
    tY = 0;
  const titleEl = $('#title');
  function fitTitle() {
    const L = Math.max(...S.map((v) => v.t.length));
    const fs = Math.min(vw * 0.22, (vw * 0.9) / (L * 0.8), phone ? vh * 0.13 : vh * 0.22, 290);
    titleEl.style.setProperty('--fs', fs + 'px');
  }
  function setTitle(f, instant) {
    $$('#title .w').forEach((w) => {
      w.querySelectorAll('.l').forEach((l, i) => {
        l.style.transitionDelay = i * 18 + 'ms';
        l.classList.add('out');
      });
      setTimeout(() => w.remove(), instant ? 0 : 380);
    });
    const w = document.createElement('span');
    w.className = 'w';
    w.setAttribute('aria-hidden', 'true');
    [...S[f].t.toUpperCase()].forEach((ch, i) => {
      const l = document.createElement('span');
      l.className = 'l';
      l.textContent = ch;
      l.style.transitionDelay = (instant ? 0 : 200 + i * 40) + 'ms';
      w.appendChild(l);
    });
    titleEl.appendChild(w);
    if (!introDone && !instant) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => $$('#title .w .l:not(.out)').forEach((l) => l.classList.add('up'))),
    );
  }
  const reveal = $('.reveal');
  let revAnim = null;
  function colourTo(c, instant) {
    document.querySelector('meta[name=theme-color]').content = c;
    if (instant || RM) {
      hero.style.setProperty('--c', c);
      return;
    }
    reveal.style.background = c;
    const R = Math.hypot(vw, vh) + 160,
      t0 = performance.now();
    cancelAnimationFrame(revAnim);
    const step = (t) => {
      const k = clamp((t - t0) / 760);
      reveal.style.setProperty('--r', eout(k) * R + 'px');
      if (k < 1) revAnim = requestAnimationFrame(step);
      else {
        hero.style.setProperty('--c', c);
        reveal.style.setProperty('--r', '0px');
      }
    };
    revAnim = requestAnimationFrame(step);
  }
  const cnt = $('#cnt span');
  const BITPOS = [
    { x: 0.13, y: 0.42, s: 1, back: 1, r: -14 },
    { x: 0.87, y: 0.32, s: 0.62, back: 1, r: 18 },
    { x: 0.8, y: 0.76, s: 0.85, back: 0, r: 8 },
    // kept clear of the hero's name, price and button at the bottom left
    { x: 0.25, y: 0.58, s: 0.6, back: 1, r: -22 },
  ];
  const bitEls = BITPOS.map((p, i) => {
    const d = document.createElement('div');
    d.className = 'bit';
    d.style.animationDelay = -i * 1.3 + 's';
    d.appendChild(boltEl());
    d.style.rotate = p.r + 'deg';
    $(p.back ? '.bits.back' : '.bits.front').appendChild(d);
    return d;
  });
  function placeBits() {
    BITPOS.forEach((p, i) => {
      const d = bitEls[i],
        k = (phone ? 62 : 110) * p.s * Math.min(1.2, Math.max(0.7, vh / 900));
      d.style.setProperty('--bw', k + 'px');
      d.style.left = (phone ? (p.x < 0.5 ? 0.05 : 0.78) : p.x) * vw - (phone ? 0 : k / 2) + 'px';
      d.style.top = p.y * vh * (phone ? 0.92 : 1) - k / 2 + 'px';
    });
  }
  function select(f, instant) {
    if (f === sel && !instant) return;
    sel = f;
    setTitle(f, instant);
    colourTo(S[f].bg, instant);
    if (!instant)
      bitEls.forEach((d, i) => {
        d.classList.add('gone');
        setTimeout(() => d.classList.remove('gone'), 300 + i * 80);
      });
    cnt.style.transform = `translateY(${-f * 50}%)`;
    $('#tagline').textContent = S[f].tag;
  }

  let x0 = 0,
    a0 = 0,
    lastX = 0,
    lastT = 0,
    vel = 0,
    downT = 0,
    downX = 0,
    downY = 0;
  const DPX = 0.55; // degrees per px of drag
  hero.addEventListener('pointerdown', (e) => {
    if (dragging || lockArc || !introDone || e.button > 0 || e.target.closest('button,a')) return;
    dragging = true;
    hero.classList.add('drag');
    hero.setPointerCapture(e.pointerId);
    x0 = lastX = downX = e.clientX;
    downY = e.clientY;
    a0 = ang;
    lastT = downT = performance.now();
    vel = 0;
    lastAuto = performance.now();
  });
  hero.addEventListener('pointermove', (e) => {
    if (FINE) {
      tX = e.clientY / vh - 0.5;
      tY = e.clientX / vw - 0.5;
    }
    if (!dragging) return;
    const now = performance.now();
    ang = a0 + (e.clientX - x0) * DPX;
    const dt = Math.max(1, now - lastT);
    vel = lerp(vel, ((e.clientX - lastX) * DPX) / (dt / 1000), 0.35);
    lastX = e.clientX;
    lastT = now;
  });
  hero.addEventListener('pointerleave', () => {
    tX = tY = 0;
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    hero.classList.remove('drag');
    lastAuto = performance.now();
    const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (moved < 7 && performance.now() - downT < 400) {
      ang = a0;
      pokeT = performance.now();
      return;
    }
    angT = Math.round((ang + clamp(vel * 0.18, -540, 540)) / 180) * 180;
  };
  hero.addEventListener('pointerup', endDrag);
  hero.addEventListener('pointercancel', endDrag);
  $('#next').addEventListener('click', () => {
    if (lockArc) return;
    angT = Math.round(angT / 180) * 180 + 180;
    lastAuto = performance.now();
  });
  addEventListener('keydown', (e) => {
    if (lockArc || !introDone || scrollY > vh * 0.5) return;
    if (e.key === 'ArrowRight') {
      angT += 180;
      lastAuto = performance.now();
    }
    if (e.key === 'ArrowLeft') {
      angT -= 180;
      lastAuto = performance.now();
    }
  });
  let pokeT = 0;

  /* ---------- details ---------- */
  const stepsEl = $('.steps'),
    factsEl = $('.facts'),
    steps = $$('.step'),
    facts = $$('.fact'),
    ticks = $$('.ticks i'),
    dark = $('.dark'),
    stormTitle = $('.stormtitle'),
    halo = $('.halo');
  let step = -1,
    tw = { from: { ...ST[0] }, to: { ...ST[0] }, t0: 0, dur: 1 };
  function twVal(now) {
    const k = RM ? 1 : sine(clamp((now - tw.t0) / tw.dur));
    const o = {};
    for (const k2 in tw.to) o[k2] = lerp(tw.from[k2], tw.to[k2], k);
    return o;
  }
  function setStep(s, now) {
    if (s === step) return;
    const cur = step < 0 ? { ...ST[s] } : twVal(now);
    step = s;
    tw = {
      from: cur,
      to: { ...ST[s] },
      t0: now,
      dur: Math.max(700, (760 * Math.abs(ST[s].a - cur.a)) / 180),
    };
    steps.forEach((el, i) => el.classList.toggle('on', i === s));
    facts.forEach((el, i) => {
      el.classList.toggle('on', s === 3);
      el.style.transitionDelay = (s === 3 ? i * 80 : 0) + 'ms';
    });
  }
  const storm = [];
  for (let i = 0; i < 22; i++) {
    const d = document.createElement('div');
    d.className = 'sb';
    d.appendChild(boltEl());
    inFront.appendChild(d);
    storm.push({
      d,
      a: i * 2.39996,
      r: 0.3 + (((i * 37) % 11) / 11) * 0.32,
      s: 0.5 + (((i * 53) % 7) / 7) * 0.9,
      sp: 0.8 + (((i * 29) % 5) / 5) * 0.9,
      rot: (i * 71) % 360,
    });
  }
  function sizeStorm() {
    const k = (Math.min(vw, vh) / 900) * (phone ? 1.1 : 1);
    storm.forEach((o) => {
      o.w = o.h = 90 * o.s * k;
      o.d.style.setProperty('--bw', o.w + 'px');
    });
  }

  /* ---------- order photo ---------- */
  const dots = $$('.dots button');
  let view = 0,
    pv = 0,
    lastView = performance.now();
  function setView(v) {
    view = v;
    lastView = performance.now();
    photo.classList.toggle('alt', v === 1);
    dots.forEach((d, j) => d.classList.toggle('on', j === v));
  }
  dots.forEach((b, i) => b.addEventListener('click', () => setView(i)));

  /* ---------- buy button ---------- */
  const buy = $('#buy');
  if (PAYMENT_URL) {
    buy.href = PAYMENT_URL;
    buy.target = '_blank';
    buy.rel = 'noopener';
  } else
    buy.addEventListener('click', (e) => {
      e.preventDefault();
      $('#buyNote').textContent = 'Version démo : le paiement sera activé à la mise en ligne du site.';
    });

  /* ---------- nav + scrolling ---------- */
  const navLinks = $$('.pill a'),
    hl = $('.pill .hl');
  let navOn = '';
  function setNav(id) {
    if (id === navOn) return;
    navOn = id;
    navLinks.forEach((a) => {
      const on = a.dataset.s === id;
      a.classList.toggle('on', on);
      if (on) {
        hl.style.width = a.offsetWidth + 'px';
        hl.style.transform = `translateX(${a.offsetLeft}px)`;
      }
    });
  }
  function goTo(id) {
    let y = $('#' + id).offsetTop;
    if (id === 'order') y = Math.max(y, photoStop());
    if (id === 'inside') y += 2;
    scrollToY(y);
  }
  navLinks.forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(a.dataset.s);
    }),
  );
  $('#navBuy').addEventListener('click', (e) => {
    e.preventDefault();
    goTo('order');
  });
  $('.logo').addEventListener('click', (e) => {
    e.preventDefault();
    scrollToY(0);
  });
  const maxY = () => document.documentElement.scrollHeight - vh;
  function scrollToY(y) {
    scrollTo({ top: clamp(y, 0, maxY()), behavior: RM ? 'auto' : 'smooth' });
  }

  /* ---------- traveller geometry ---------- */
  const absTop = (el) => el.getBoundingClientRect().top + scrollY;
  function photoStop() {
    const r = photo.getBoundingClientRect();
    return absTop(photo) + r.height / 2 - vh * (phone ? 0.45 : 0.5);
  }
  function mix(a, b, t) {
    const o = {};
    for (const k in a) o[k] = lerp(a[k], b[k] ?? a[k], t);
    return o;
  }

  /* ---------- main loop ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const sy = scrollY,
      insTop = inside.offsetTop,
      insH = inside.offsetHeight,
      t = now / 1000;
    const p1r = clamp(sy / Math.max(1, insTop)),
      p1 = eio(p1r);
    lockArc = sy > 4;
    if (lockArc) {
      angT = Math.round(angT / 180) * 180;
      if (dragging) {
        dragging = false;
        hero.classList.remove('drag');
      }
    }
    if (!dragging) ang = lerp(ang, angT, 1 - Math.exp(-dt * (RM ? 60 : 5.5)));
    if (introDone && !RM && !dragging && !lockArc && now - lastAuto > 4200 && !document.hidden) {
      angT = Math.round(angT / 180) * 180 + 180;
      lastAuto = now;
    }
    const f = mod(Math.round(ang / 180), 2);
    if (f !== sel) select(f);
    tiltX = lerp(tiltX, tX, 1 - Math.exp(-dt * 6));
    tiltY = lerp(tiltY, tY, 1 - Math.exp(-dt * 6));
    // details progress
    const q = clamp((sy - insTop) / Math.max(1, insH - vh));
    setStep(q < 0.16 ? 0 : q < 0.32 ? 1 : q < 0.48 ? 2 : 3, now);
    const st = clamp((q - 0.64) / 0.36);
    ticks.forEach((tk, i) => tk.style.setProperty('--p', i < 4 ? clamp((q - i * 0.16) / 0.16) : st));
    const insEnd = insTop + insH - vh;
    const stop = Math.max(insEnd + vh * 0.5, photoStop());
    const p3r = clamp((sy - insEnd) / (stop - insEnd)),
      p3 = eio(p3r);
    const bump = Math.sin(Math.PI * st),
      stormA = RM ? 0 : Math.sin(st * Math.PI * 4) * 14 * bump;
    dark.style.opacity = clamp(st * 3);
    stepsEl.style.opacity = factsEl.style.opacity = 1 - clamp(st * 5);
    halo.style.opacity = 1 - clamp(st * 3);
    const ob = orderEl.getBoundingClientRect(),
      fb = footEl.getBoundingClientRect();
    document.body.classList.toggle(
      'navdark',
      (st > 0.12 && ob.top >= 40) || (ob.top < 40 && ob.bottom > 40) || fb.top < 40,
    );
    document.body.classList.toggle('navbg', sy > vh * 0.85);
    stormTitle.style.opacity = clamp(st * 3 - 0.4) * clamp((1 - st) * 6);
    // A: hero
    const ent = RM ? 1 : clamp((now - entT) / 1100),
      ee = 1 - Math.pow(1 - ent, 4);
    const W = heroW(),
      bob = RM ? 0 : Math.sin(t * 1.3) * 6;
    const A = {
      x: vw / 2 + tiltY * 18,
      y: vh * (phone ? 0.56 : 0.6) - sy + bob + (1 - ee) * vh * 0.7,
      w: W,
      rx: -tiltX * 10,
      ry: ang + tiltY * 16,
      rz: RM ? 0 : Math.sin(t * 0.7) * 1.6,
      z: 1,
      px: 0.5,
      py: 0.5,
      o: clamp(ent * 3),
      sx: 1,
      sy: 1,
      shO: 0.9,
    };
    const pk = clamp((now - pokeT) / 520);
    if (pk < 1 && sy < 4) {
      const w = Math.sin(pk * Math.PI * 2.4) * (1 - pk);
      A.sx = 1 + w * 0.08;
      A.sy = 1 - w * 0.1;
    }
    // B: details
    const base = 360 * Math.round(angT / 360),
      v = twVal(now),
      rb = inBar.getBoundingClientRect();
    const B = {
      x: rb.left + rb.width / 2,
      y: rb.top + rb.height / 2 - bump * vh * (phone ? 0.06 : 0.27),
      w: rb.width * (1 - 0.5 * bump),
      rx: RM ? 0 : Math.sin(t * 0.9) * 3,
      ry: base + v.a,
      rz: (RM ? 0 : Math.sin(t * 0.7) * 2) + stormA,
      z: v.z,
      px: v.px,
      py: v.py,
      o: 1,
      sx: 1,
      sy: 1,
      shO: 0.8 * (1 - bump),
    };
    // C: the order photo
    const live = p3r > 0.985;
    photo.classList.toggle('live', p3r > 0);
    if (!RM) {
      const pe = p3r > 0 ? eio(p3r) : 1;
      photo.style.opacity = (p3r > 0 ? 0.15 + 0.85 * pe : 1).toFixed(3);
      photo.style.transform = p3r > 0 && p3r < 1 ? 'scale(' + (0.94 + 0.06 * pe).toFixed(4) + ')' : '';
    }
    if (live && !RM && now - lastView > 4500) setView(view ? 0 : 1);
    pv = lerp(pv, view, 1 - Math.exp(-dt * 5));
    const rp = photo.getBoundingClientRect(),
      endBase = base + ST[3].a;
    const C = {
      x: rp.left + rp.width / 2,
      y: rp.top + rp.height / 2,
      w: rp.width * 0.926,
      rx: 0,
      ry: endBase + pv * 180,
      rz: 0,
      z: 1,
      px: 0.5,
      py: 0.5,
      o: 1,
      sx: 1,
      sy: 1,
      shO: 0.55,
    };
    let s = p1 > 0 ? mix(A, B, p1) : A;
    if (p3 > 0) s = mix(B, C, p3);
    if (sy < insTop * 0.02) s.o = A.o;
    apply(s);
    // storm
    const showStorm = st > 0 && p3r < 1;
    inFront.style.visibility = showStorm ? 'visible' : 'hidden';
    if (showStorm) {
      const cx = rb.left + rb.width / 2,
        cy = rb.top + rb.height / 2,
        M = Math.min(vw, vh),
        fade = clamp(1 - p3r * 2.5);
      storm.forEach((o, i) => {
        const k = eout(clamp(st * 2.6 - i * 0.035)),
          out = 1 - clamp((st - 0.86) / 0.14);
        const an = o.a + (RM ? 0 : st * o.sp * 5 + t * 0.15 * o.sp),
          rad = lerp(Math.max(vw, vh) * 0.85, o.r * M * (phone ? 1.05 : 1.25) + (phone ? 0 : M * 0.06), k);
        const x = cx + Math.cos(an) * rad * (phone ? 0.9 : 1.25) - o.w / 2,
          y = cy + Math.sin(an) * rad * 0.78 - o.h / 2;
        o.d.style.transform = `translate(${x}px,${y}px) rotate(${o.rot + st * 240 * o.sp}deg)`;
        o.d.style.opacity = Math.min(k, out) * fade;
      });
    }
    const mid = sy + vh * 0.45;
    setNav(
      mid < insTop ? 'hero' : mid < orderEl.offsetTop ? 'inside' : mid < faqEl.offsetTop ? 'order' : 'faq',
    );
    requestAnimationFrame(frame);
  }

  /* ---------- intro + boot ---------- */
  function onIntro() {
    if (introDone) return;
    introDone = true;
    entT = performance.now() + (RM ? 0 : 120);
    lastAuto = performance.now() + 800;
    setTitle(sel, false);
  }
  measure();
  select(0, true);
  addEventListener('resize', measure);
  document.fonts.ready.then(() => {
    const id = navOn;
    navOn = '';
    setNav(id || 'hero');
  });
  if (window.__introDone) onIntro();
  else addEventListener('tb:intro', onIntro);
  requestAnimationFrame(frame);
  window.__tb = {
    get state() {
      return { sel, ang, angT, introDone, step };
    },
  };
})();

// The footer: the name rises letter by letter once it comes on screen.
(function () {
  var w = document.querySelector('.foot__word'),
    s = w && w.querySelector('span');
  if (!w || !s) return;
  var t = s.textContent;
  s.textContent = '';
  t.split('').forEach(function (c, i) {
    var l = document.createElement('span');
    l.className = 'l';
    l.textContent = c;
    l.style.transitionDelay = 120 + i * 45 + 'ms';
    s.appendChild(l);
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  w.classList.add('wait');
  new IntersectionObserver(
    function (es, o) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          w.classList.add('in');
          o.disconnect();
        }
      });
    },
    { threshold: 0.35 },
  ).observe(w);
})();
