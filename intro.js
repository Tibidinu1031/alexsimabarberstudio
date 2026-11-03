(() => {
  'use strict';
  const root = document.documentElement;
  const intro = document.querySelector('.intro');
  if (!intro || !root.classList.contains('intro-on')) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const logo = intro.querySelector('.intro-logo');
  // Both poles use the same SVG symbol, so one stripe animation turns them together.
  const library = document.querySelector('.svg-library');
  const spin = document.getElementById('pole-spin');
  const started = performance.now();
  // CSS fills the poles most of the way; they only top out once the page has loaded. Striking the logo buys a little more time, never past the CSS failsafe.
  const fillTime = 2500;
  const minimumShow = reducedMotion ? 1400 : 3800;
  const lastExit = 8500;
  let loaded = document.readyState === 'complete';
  let filledAt = 0;
  let exitTimer = null;
  let leaving = false;
  let fastSpin = 0;

  const elapsed = () => performance.now() - started;
  function finishFill() {
    if (leaving || filledAt) return;
    filledAt = elapsed();
    intro.classList.add('is-filled');
    scheduleExit(Math.max(minimumShow - filledAt, 900));
  }
  function tryFill() { if (loaded && elapsed() >= fillTime) finishFill(); }
  function scheduleExit(delay) {
    clearTimeout(exitTimer);
    exitTimer = setTimeout(leave, Math.max(0, Math.min(delay, lastExit - elapsed())));
  }
  function leave() {
    if (leaving) return;
    leaving = true;
    clearTimeout(exitTimer);
    intro.classList.add('is-leaving');
    setTimeout(() => {
      intro.remove();
      root.classList.remove('intro-on');
      if (!reducedMotion) root.classList.add('intro-done');
    }, reducedMotion ? 0 : 1000);
  }
  function setSpin(fast) {
    fastSpin = Math.max(0, fastSpin + (fast ? 1 : -1));
    spin.setAttribute('dur', fastSpin ? '.32s' : '1.2s');
  }
  function strike() {
    if (leaving || reducedMotion) return;
    logo.classList.remove('is-struck');
    void logo.offsetWidth;
    logo.classList.add('is-struck');
    setSpin(true);
    setTimeout(() => setSpin(false), 1200);
    if (filledAt) scheduleExit(2200);
  }

  logo.addEventListener('animationend', event => { if (event.animationName === 'intro-strike') logo.classList.remove('is-struck'); });
  logo.addEventListener('click', event => { event.stopPropagation(); strike(); });
  intro.addEventListener('click', leave);
  if (!reducedMotion) {
    setTimeout(() => intro.classList.add('is-ready'), 2700);
    intro.querySelectorAll('.intro-pole').forEach(pole => {
      pole.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') setSpin(true); });
      pole.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') setSpin(false); });
    });
    intro.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      intro.style.setProperty('--px', (event.clientX / window.innerWidth * 2 - 1).toFixed(3));
      intro.style.setProperty('--py', (event.clientY / window.innerHeight * 2 - 1).toFixed(3));
      intro.style.setProperty('--mx', `${event.clientX}px`);
      intro.style.setProperty('--my', `${event.clientY}px`);
      const box = logo.getBoundingClientRect();
      intro.style.setProperty('--lx', `${((event.clientX - box.left) / box.width * 100).toFixed(1)}%`);
      intro.style.setProperty('--ly', `${((event.clientY - box.top) / box.height * 100).toFixed(1)}%`);
    }, {passive:true});
  }
  window.addEventListener('load', () => { loaded = true; tryFill(); }, {once:true});
  window.addEventListener('keydown', leave, {once:true});
  window.addEventListener('wheel', leave, {once:true, passive:true});
  window.addEventListener('touchmove', leave, {once:true, passive:true});
  if (reducedMotion) {
    library.pauseAnimations();
    finishFill();
  } else {
    setTimeout(tryFill, fillTime);
  }
  // A page that never finishes loading still lets the visitor in.
  setTimeout(() => { loaded = true; tryFill(); }, 6000);
})();
