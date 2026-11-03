(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu.
  const menuToggle = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  function setMenu(open) {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
    mobileNav.classList.toggle('is-open', open);
    mobileNav.inert = !open;
  }
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', mobileNav).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  // Gallery: a filterable mosaic, browsed in a lightbox with thumbnails.
  // Four columns of equal cells with the studio shot spanning two: the grid closes as a square.
  const photos = [
    {src:'assets/textured-crop.jpg',title:'Crop fade',category:'cuts',alt:'Crop fade cu textură pe creștet, din profil'},
    {src:'assets/low-fade.jpg',title:'Low fade',category:'cuts',alt:'Low fade cu păr texturat, din profil'},
    {src:'assets/full-beard.jpg',title:'Fade și barbă lungă',category:'beard',alt:'Fade scurt și barbă lungă conturată, din profil'},
    {src:'assets/mid-fade.jpg',title:'Mid fade',category:'cuts',alt:'Mid fade văzut din spate, cu tranziție curată'},
    {src:'assets/fade-beard-profile.jpg',title:'Fade și barbă',category:'beard',alt:'Fade cu păr scurt texturat și barbă conturată, din profil'},
    {src:'assets/alex-at-work.jpg',title:'Alexandru Sima la lucru',category:'studio',wide:true,alt:'Alexandru Sima lucrează cu foarfeca la o tunsoare, în studio'},
    {src:'assets/modern-mullet.jpg',title:'Mullet modern',category:'cuts',alt:'Mullet modern cu breton texturat și fade lateral'},
    {src:'assets/crew-cut.jpg',title:'Crew cut',category:'cuts',alt:'Crew cut scurt cu fade, din lateral'},
    {src:'assets/curly-fade.jpg',title:'Bucle și taper fade',category:'cuts',alt:'Păr creț pe creștet cu taper fade la ceafă'},
    {src:'assets/texture-fade.jpg',title:'Textură și fade',category:'beard',alt:'Fade cu textură și barbă scurtă, din profil'},
    {src:'assets/studio-interior.jpg',title:'Studioul',category:'studio',alt:'Interiorul studioului, cu scaun de frizerie, oglindă și chiuvetă'}
  ];
  const grid = $('#gallery-grid');
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightbox-image');
  const lightboxTitle = $('#lightbox-title');
  const thumbs = $('#lightbox-thumbs');
  let visible = [...photos];
  let current = 0;

  const items = photos.map(photo => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = photo.wide ? 'gallery-item is-wide' : 'gallery-item';
    item.setAttribute('aria-label', `${photo.title}, deschide fotografia`);
    const img = document.createElement('img');
    img.src = photo.src; img.alt = photo.alt; img.loading = 'lazy'; img.decoding = 'async';
    const caption = document.createElement('span');
    caption.textContent = photo.title;
    item.append(img, caption);
    item.addEventListener('click', () => openLightbox(visible.indexOf(photo)));
    grid.append(item);
    return item;
  });

  // Filtering animates: photos that leave fade out, the rest glide to their new cells, newcomers rise in one after another.
  const filterBar = $('.gallery-filters');
  const filterButtons = $$('[data-filter]', filterBar);
  const matches = filter => photos.filter(photo => filter === 'all' || photo.category === filter);
  const glide = 'cubic-bezier(.22,1,.36,1)';
  let filterRun = 0;
  function applyFilter(filter) {
    const next = matches(filter);
    const run = ++filterRun;
    visible = next;
    const show = () => items.forEach((item, index) => { item.hidden = !next.includes(photos[index]); });
    if (reducedMotion || !grid.animate) { show(); return; }
    items.forEach(item => item.getAnimations().forEach(animation => animation.cancel()));
    grid.getAnimations().forEach(animation => animation.cancel());
    const before = new Map(items.filter(item => !item.hidden).map(item => [item, item.getBoundingClientRect()]));
    const gridBefore = grid.offsetHeight;
    const leaving = items.filter((item, index) => !item.hidden && !next.includes(photos[index]));
    const fades = leaving.map(item => item.animate([{opacity:1, scale:1}, {opacity:0, scale:.9}], {duration:200, easing:'ease-in', fill:'forwards'}));
    Promise.all(fades.map(animation => animation.finished.catch(() => {}))).then(() => {
      if (run !== filterRun) return;
      show();
      fades.forEach(animation => animation.cancel());
      let entering = 0;
      items.filter(item => !item.hidden).forEach(item => {
        const from = before.get(item);
        const to = item.getBoundingClientRect();
        if (from) {
          const dx = from.left - to.left, dy = from.top - to.top;
          if (Math.abs(dx) > .5 || Math.abs(dy) > .5) item.animate([{translate:`${dx}px ${dy}px`}, {translate:'0 0'}], {duration:560, easing:glide});
        } else {
          item.animate([{opacity:0, scale:.84, translate:'0 18px'}, {opacity:1, scale:1, translate:'0 0'}], {duration:520, delay:entering++ * 55, easing:glide, fill:'backwards'});
        }
      });
      const gridAfter = grid.offsetHeight;
      if (gridAfter !== gridBefore) grid.animate([{height:`${gridBefore}px`}, {height:`${gridAfter}px`}], {duration:560, easing:glide});
    });
  }

  // A gold plate slides behind the active filter, and each filter shows how many photos it holds.
  const plate = document.createElement('span');
  plate.className = 'filter-plate';
  plate.setAttribute('aria-hidden', 'true');
  filterBar.prepend(plate);
  filterBar.classList.add('has-plate');
  filterButtons.forEach(button => {
    const count = document.createElement('small');
    count.textContent = matches(button.dataset.filter).length;
    button.append(count);
  });
  function movePlate() {
    const active = filterButtons.find(button => button.getAttribute('aria-pressed') === 'true');
    if (!active) return;
    plate.style.width = `${active.offsetWidth}px`;
    plate.style.height = `${active.offsetHeight}px`;
    plate.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
  }
  movePlate();
  requestAnimationFrame(() => filterBar.classList.add('plate-ready'));
  window.addEventListener('resize', movePlate, {passive:true});
  if (document.fonts) document.fonts.ready.then(movePlate);

  filterButtons.forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    filterButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    movePlate();
    applyFilter(button.dataset.filter);
  }));

  function paintLightbox(direction = 0) {
    const photo = visible[current];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt;
    lightboxTitle.textContent = photo.title;
    if (direction && !reducedMotion && lightboxImage.animate) {
      lightboxImage.animate([{opacity:0, translate:`${direction * 36}px 0`, scale:.97}, {opacity:1, translate:'0 0', scale:1}], {duration:380, easing:glide});
    }
    $$('button', thumbs).forEach((thumb, index) => {
      const active = index === current;
      thumb.setAttribute('aria-current', String(active));
      if (active) thumb.scrollIntoView({block:'nearest', inline:'center', behavior:reducedMotion ? 'auto' : 'smooth'});
    });
  }
  function openLightbox(index) {
    current = index;
    thumbs.replaceChildren(...visible.map((photo, thumbIndex) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.setAttribute('aria-label', photo.title);
      const img = document.createElement('img');
      img.src = photo.src; img.alt = ''; img.loading = 'lazy';
      thumb.append(img);
      thumb.addEventListener('click', () => { const direction = Math.sign(thumbIndex - current); current = thumbIndex; paintLightbox(direction); });
      return thumb;
    }));
    paintLightbox();
    if (!lightbox.open) lightbox.showModal();
    document.body.classList.add('modal-open');
  }
  function step(direction) { current = (current + direction + visible.length) % visible.length; paintLightbox(direction); }
  $('.lightbox-prev').addEventListener('click', () => step(-1));
  $('.lightbox-next').addEventListener('click', () => step(1));
  $('[data-close-lightbox]').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('close', () => document.body.classList.remove('modal-open'));
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); }
  });
  let swipeStart = null;
  lightboxImage.addEventListener('pointerdown', event => { swipeStart = event.clientX; });
  lightboxImage.addEventListener('pointerup', event => {
    if (swipeStart === null) return;
    const distance = event.clientX - swipeStart;
    if (Math.abs(distance) > 40) step(distance < 0 ? 1 : -1);
    swipeStart = null;
  });

  // Reveal on scroll and the active section in the header.
  if ('IntersectionObserver' in window) {
    if (!reducedMotion) {
      document.documentElement.classList.add('has-motion');
      const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
      }), {threshold:.08});
      $$('.reveal').forEach(element => revealObserver.observe(element));
    }
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.header-nav a:not(.btn)').forEach(link => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
    }), {rootMargin:'-40% 0px -55% 0px'});
    $$('main section[id]').forEach(section => navObserver.observe(section));
  }

  // The reading progress bar is a thin barber pole.
  const progress = $('.reading-progress');
  let scrollPending = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? window.scrollY / max * 100 : 0}%`;
    scrollPending = false;
  };
  window.addEventListener('scroll', () => { if (!scrollPending) { requestAnimationFrame(updateProgress); scrollPending = true; } }, {passive:true});
  updateProgress();
  $('#year').textContent = new Date().getFullYear();
})();
