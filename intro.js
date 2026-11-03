(() => {
  'use strict';
  const root = document.documentElement;
  const intro = document.querySelector('.intro');
  if (!intro || !root.classList.contains('intro-on')) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const logo = intro.querySelector('.intro-logo');
  // Both poles use the same SVG symbol, so one fill level and one stripe animation drive them together.
  const library = document.querySelector('.svg-library');
  const fillLevel = document.getElementById('pole-fill-level');
  const spin = document.getElementById('pole-spin');
  const glass = {top:40, height:236};
  const started = performance.now();
  // The poles creep towards full while the page loads and only top out once it has; striking the logo buys a little more time, never past the CSS failsafe.
  const minimumShow = reducedMotion ? 1400 : 3800;
  const lastExit = 8500;
  let loaded = document.readyState === 'complete';
  let filledAt = 0;
  let exitTimer = null;
  let leaving = false;

  const elapsed = () => performance.now() - started;
  function setFill(percent) {
    const height = glass.height * percent / 100;
    fillLevel.setAttribute('y', (glass.top + glass.height - height).toFixed(2));
    fillLevel.setAttribute('height', height.toFixed(2));
  }
  let fastSpin = 0;
  function setSpin(fast) {
    fastSpin = Math.max(0, fastSpin + (fast ? 1 : -1));
    spin.setAttribute('dur', fastSpin ? '.32s' : '1.2s');
  }
  function fillStep() {
    if (leaving) return;
    const progress = Math.min(elapsed() / 2200, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    if (loaded && progress === 1) {
      setFill(100);
      filledAt = elapsed();
      intro.classList.add('is-filled');
      scheduleExit(Math.max(minimumShow - filledAt, 900));
      return;
    }
    setFill(eased * 88);
    requestAnimationFrame(fillStep);
  }
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
    }, reducedMotion ? 0 : 1100);
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
  window.addEventListener('load', () => { loaded = true; }, {once:true});
  window.addEventListener('keydown', leave, {once:true});
  window.addEventListener('wheel', leave, {once:true, passive:true});
  window.addEventListener('touchmove', leave, {once:true, passive:true});
  if (reducedMotion) {
    library.pauseAnimations();
    setFill(100);
    intro.classList.add('is-filled');
    filledAt = elapsed();
    scheduleExit(minimumShow);
  } else {
    requestAnimationFrame(fillStep);
  }
  // A page that never finishes loading still lets the visitor in.
  setTimeout(() => { loaded = true; }, 6000);
})();
