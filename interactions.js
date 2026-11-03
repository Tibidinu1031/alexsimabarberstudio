/* Section by section interactions. Pointer effects need a mouse or trackpad; reduced motion turns every effect off. */
(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const canObserve = 'IntersectionObserver' in window;

  // Runs a handler at most once per frame, with the latest event.
  function perFrame(handler) {
    let pending = false;
    let latest = null;
    return event => {
      latest = event;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; handler(latest); });
    };
  }
  function whenVisible(elements, callback, threshold = .35) {
    if (!canObserve) { elements.forEach(callback); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      callback(entry.target);
    }), {threshold});
    elements.forEach(element => observer.observe(element));
  }
  // The hero waits behind the opening screen; its effects start once the screen has gone.
  const introGone = new Promise(resolve => {
    if (!root.classList.contains('intro-on')) { resolve(); return; }
    window.addEventListener('intro:done', resolve, {once:true});
    setTimeout(resolve, 9500);
  });

  // Counters: the rating and the number of reviews count up the first time they come into view.
  // Screen readers get the final number at once; the animated copy is hidden from them.
  $$('[data-count]').forEach(element => {
    if (reducedMotion) return;
    const target = Number(element.dataset.count);
    const decimals = Number(element.dataset.decimals || 0);
    const final = target.toFixed(decimals);
    const width = element.getBoundingClientRect().width;
    const shown = document.createElement('span');
    shown.className = 'count-value';
    shown.setAttribute('aria-hidden', 'true');
    shown.style.minWidth = `${Math.ceil(width)}px`;
    shown.textContent = (0).toFixed(decimals);
    const spoken = document.createElement('span');
    spoken.className = 'sr-only';
    spoken.textContent = final;
    element.replaceChildren(shown, spoken);
    element.countUp = () => {
      const started = performance.now();
      const duration = 1700;
      const tick = now => {
        const progress = Math.min(1, (now - started) / duration);
        shown.textContent = (target * (1 - Math.pow(1 - progress, 3))).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(tick);
        else shown.style.minWidth = '';
      };
      requestAnimationFrame(tick);
    };
  });
  whenVisible($$('[data-count]').filter(element => element.countUp), element => {
    if (element.closest('.hero')) introGone.then(() => setTimeout(element.countUp, 350));
    else element.countUp();
  }, .6);

  // Staggered entrances: rows of the price list, cards and gallery photos arrive one after another.
  [['.price-board', '.price-item'], ['.features', '.feature'], ['.contact-cards', '.contact-card'], ['.gallery-grid', '.gallery-item']].forEach(([group, child]) => {
    $$(group).forEach(parent => $$(child, parent).forEach((element, index) => element.style.setProperty('--i', index)));
  });
  if (!reducedMotion && canObserve) {
    const gallery = $('#gallery-grid');
    if (gallery) whenVisible([gallery], element => element.classList.add('is-visible'), .12);
  }

  // Buttons answer a press with a soft ripple of light, on touch screens as well.
  if (!reducedMotion) {
    document.addEventListener('pointerdown', event => {
      const target = event.target.closest('.btn, .book-link, .gallery-filters button');
      if (!target || event.button > 0) return;
      const box = target.getBoundingClientRect();
      const size = Math.max(box.width, box.height) * 2.2;
      const ink = document.createElement('span');
      ink.className = 'ripple';
      ink.setAttribute('aria-hidden', 'true');
      ink.style.width = ink.style.height = `${size}px`;
      ink.style.left = `${event.clientX - box.left - size / 2}px`;
      ink.style.top = `${event.clientY - box.top - size / 2}px`;
      target.append(ink);
      ink.addEventListener('animationend', () => ink.remove(), {once:true});
    });
  }

  // Hero: the photo drifts slower than the page as it scrolls away, and the headline fades with it.
  const hero = $('.hero');
  const title = $('.hero h1');
  if (hero && !reducedMotion) {
    let heroHeight = hero.offsetHeight;
    const onScroll = perFrame(() => {
      const y = window.scrollY;
      if (y > heroHeight * 1.2) return;
      hero.style.setProperty('--hs', (y * .3).toFixed(1));
      hero.style.setProperty('--hp', Math.min(1, y / heroHeight).toFixed(3));
    });
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', () => { heroHeight = hero.offsetHeight; }, {passive:true});
    onScroll();

    // A gold glint runs across the name after the opening screen, and again whenever the cursor touches it.
    let shining = null;
    const shine = () => {
      if (!title.animate || (shining && shining.playState === 'running')) return;
      shining = title.animate([{backgroundPosition:'100% 0, 0 0'}, {backgroundPosition:'0% 0, 0 0'}], {duration:1500, easing:'cubic-bezier(.45,0,.2,1)'});
    };
    introGone.then(() => setTimeout(shine, 700));
    if (finePointer) title.addEventListener('pointerenter', shine);
  }
  // With a mouse the photo, frame and text sit at different depths and shift against each other, under a warm light that follows the cursor.
  if (hero && finePointer && !reducedMotion) {
    hero.addEventListener('pointermove', perFrame(event => {
      const box = hero.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      hero.style.setProperty('--hx', (x / box.width * 2 - 1).toFixed(3));
      hero.style.setProperty('--hy', (y / box.height * 2 - 1).toFixed(3));
      hero.style.setProperty('--lx', `${x.toFixed(0)}px`);
      hero.style.setProperty('--ly', `${y.toFixed(0)}px`);
      hero.classList.add('is-lit');
    }), {passive:true});
    hero.addEventListener('pointerleave', () => {
      hero.classList.remove('is-lit');
      hero.style.setProperty('--hx', 0);
      hero.style.setProperty('--hy', 0);
    });
  }

  if (!finePointer || reducedMotion) return;

  // Backdrop: a lamp brightens the lattice under the cursor, in every section.
  const sections = $$('.section');
  const measureTiles = () => sections.forEach(section => section.style.setProperty('--tile-x', `${(section.clientWidth - 120) / 2}px`));
  measureTiles();
  window.addEventListener('resize', measureTiles, {passive:true});
  sections.forEach(section => {
    section.addEventListener('pointermove', perFrame(event => {
      const box = section.getBoundingClientRect();
      section.style.setProperty('--lamp-x', `${(event.clientX - box.left - section.clientLeft).toFixed(0)}px`);
      section.style.setProperty('--lamp-y', `${(event.clientY - box.top - section.clientTop).toFixed(0)}px`);
      section.classList.add('is-lit');
    }), {passive:true});
    section.addEventListener('pointerleave', () => section.classList.remove('is-lit'));
  });

  // Tilt: the about photo and the gallery photos lean toward the cursor, with a glint where it points.
  function tilt(element, event, strength) {
    const box = element.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    const py = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
    element.style.setProperty('--ry', `${((px - .5) * strength * 2).toFixed(2)}deg`);
    element.style.setProperty('--rx', `${((.5 - py) * strength * 2).toFixed(2)}deg`);
    element.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
    element.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    element.classList.add('is-tilting');
  }
  function untilt(element) {
    if (!element) return;
    element.classList.remove('is-tilting');
    ['--rx', '--ry'].forEach(property => element.style.removeProperty(property));
  }
  const portrait = $('.about-image');
  if (portrait) {
    portrait.addEventListener('pointermove', perFrame(event => tilt(portrait, event, 7)), {passive:true});
    portrait.addEventListener('pointerleave', () => untilt(portrait));
  }
  const grid = $('#gallery-grid');
  if (grid) {
    let leaning = null;
    grid.addEventListener('pointermove', perFrame(event => {
      const item = event.target.closest && event.target.closest('.gallery-item');
      if (item !== leaning) { untilt(leaning); leaning = item; }
      if (item) tilt(item, event, 9);
    }), {passive:true});
    grid.addEventListener('pointerleave', () => { untilt(leaning); leaning = null; });
  }

  // Cards and the price list catch a soft light where the cursor is.
  $$('.feature, .contact-card, .booking-info, .price-board').forEach(card => {
    card.addEventListener('pointermove', perFrame(event => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${(event.clientX - box.left).toFixed(0)}px`);
      card.style.setProperty('--my', `${(event.clientY - box.top).toFixed(0)}px`);
    }), {passive:true});
  });
})();
