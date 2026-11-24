// The intro: the bolt is drawn, the name is stamped, then the curtain lifts.
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches,
    intro = document.getElementById('intro'),
    st = document.getElementById('stamp');
  window.__introDone = false;
  function finish() {
    if (window.__introDone) return;
    window.__introDone = true;
    intro.classList.add('done');
    document.body.classList.remove('locked');
    // the hero's words and cap enter as the curtain lifts (styled in css/style.css, .ready)
    var hero = document.getElementById('hero');
    if (hero) hero.classList.add('ready');
    setTimeout(function () {
      intro.style.display = 'none';
    }, 950);
    dispatchEvent(new Event('tb:intro'));
  }
  document.getElementById('skip').addEventListener('click', finish);
  setTimeout(finish, 7000);
  if (RM) {
    st.classList.add('on');
    setTimeout(finish, 500);
    return;
  }
  setTimeout(function () {
    intro.classList.add('draw');
  }, 150);
  setTimeout(function () {
    intro.classList.add('out');
    st.classList.add('on');
  }, 1500);
  setTimeout(finish, 2600);
})();
