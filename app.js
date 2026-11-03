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
  const photos = [
    {src:'assets/textured-crop.jpg',title:'Crop fade',category:'cuts',size:'tall',alt:'Crop fade cu textură pe creștet, din profil'},
    {src:'assets/alex-at-work.jpg',title:'Alexandru Sima la lucru',category:'studio',size:'wide',alt:'Alexandru Sima lucrează cu foarfeca la o tunsoare, în studio'},
    {src:'assets/low-fade.jpg',title:'Low fade',category:'cuts',size:'tall',alt:'Low fade cu păr texturat, din profil'},
    {src:'assets/full-beard.jpg',title:'Fade și barbă lungă',category:'beard',size:'',alt:'Fade scurt și barbă lungă conturată, din profil'},
    {src:'assets/mid-fade.jpg',title:'Mid fade',category:'cuts',size:'tall',alt:'Mid fade văzut din spate, cu tranziție curată'},
    {src:'assets/fade-beard-profile.jpg',title:'Fade și barbă',category:'beard',size:'tall',alt:'Fade cu păr scurt texturat și barbă conturată, din profil'},
    {src:'assets/modern-mullet.jpg',title:'Mullet modern',category:'cuts',size:'',alt:'Mullet modern cu breton texturat și fade lateral'},
    {src:'assets/studio-interior.jpg',title:'Studioul',category:'studio',size:'tall',alt:'Interiorul studioului, cu scaun de frizerie, oglindă și chiuvetă'},
    {src:'assets/crew-cut.jpg',title:'Crew cut',category:'cuts',size:'',alt:'Crew cut scurt cu fade, din lateral'},
    {src:'assets/curly-fade.jpg',title:'Bucle și taper fade',category:'cuts',size:'tall',alt:'Păr creț pe creștet cu taper fade la ceafă'},
    {src:'assets/texture-fade.jpg',title:'Textură și fade',category:'beard',size:'',alt:'Fade cu textură și barbă scurtă, din profil'}
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
    item.className = `gallery-item reveal${photo.size ? ` is-${photo.size}` : ''}`;
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

  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const filter = button.dataset.filter;
    visible = photos.filter(photo => filter === 'all' || photo.category === filter);
    items.forEach((item, index) => { item.hidden = !visible.includes(photos[index]); });
  }));

  function paintLightbox() {
    const photo = visible[current];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt;
    lightboxTitle.textContent = photo.title;
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
      thumb.addEventListener('click', () => { current = thumbIndex; paintLightbox(); });
      return thumb;
    }));
    paintLightbox();
    if (!lightbox.open) lightbox.showModal();
    document.body.classList.add('modal-open');
  }
  function step(direction) { current = (current + direction + visible.length) % visible.length; paintLightbox(); }
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
