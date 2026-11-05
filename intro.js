(() => {
  'use strict';
  const root = document.documentElement;
  const intro = document.querySelector('.intro');
  if (!intro || !root.classList.contains('intro-on')) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const logo = intro.querySelector('.intro-logo');
  const started = performance.now();
  // CSS fills the bar most of the way; it only tops out once the page has loaded. Striking the logo buys a little more time, never past the CSS failsafe.
  const fillTime = 2500;
  const minimumShow = reducedMotion ? 1400 : 3800;
  const lastExit = 8500;
  let loaded = document.readyState === 'complete';
  let filledAt = 0;
  let exitTimer = null;
  let leaving = false;

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
  function strike() {
    if (leaving || reducedMotion) return;
    logo.classList.remove('is-struck');
    void logo.offsetWidth;
    logo.classList.add('is-struck');
    if (filledAt) scheduleExit(2200);
  }

  logo.addEventListener('animationend', event => { if (event.animationName === 'intro-strike') logo.classList.remove('is-struck'); });
  logo.addEventListener('click', event => { event.stopPropagation(); strike(); });
  intro.addEventListener('click', leave);
  if (!reducedMotion) {
    setTimeout(() => intro.classList.add('is-ready'), 2700);
    intro.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      intro.style.setProperty('--px', (event.clientX / window.innerWidth * 2 - 1).toFixed(3));
      intro.style.setProperty('--py', (event.clientY / window.innerHeight * 2 - 1).toFixed(3));
    }, {passive:true});
  }
  window.addEventListener('load', () => { loaded = true; tryFill(); }, {once:true});
  window.addEventListener('keydown', leave, {once:true});
  window.addEventListener('wheel', leave, {once:true, passive:true});
  window.addEventListener('touchmove', leave, {once:true, passive:true});
  if (reducedMotion) {
    finishFill();
  } else {
    setTimeout(tryFill, fillTime);
  }
  // A page that never finishes loading still lets the visitor in.
  setTimeout(() => { loaded = true; tryFill(); }, 6000);
})();
