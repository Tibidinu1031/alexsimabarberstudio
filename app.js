(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');

  // Let the platform handle focus containment and Escape in native dialogs.
  const lightbox = $('#lightbox');
  const syncModalState = () => document.body.classList.toggle('modal-open', $$('dialog[open]').length > 0);
  const openDialog = dialog => { if (!dialog.open) dialog.showModal(); syncModalState(); };
  $$('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', syncModalState);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });

  const menuToggle = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Deschide meniul');
    mobileNav.classList.remove('is-open');
    mobileNav.inert = true;
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
    mobileNav.classList.toggle('is-open', open);
    mobileNav.inert = !open;
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  // A single open service keeps the image and the description in sync.
  const serviceImages = [
    {src:'assets/crew-cut.jpg', alt:'Tuns clasic scurt, cu tranziție curată, realizat la Alex Sima Barber Studio'},
    {src:'assets/textured-crop.jpg', alt:'Crop fade cu textură pe creștet, realizat la Alex Sima Barber Studio'},
    {src:'assets/full-beard.jpg', alt:'Fade scurt și barbă lungă conturată, la Alex Sima Barber Studio'},
    {src:'assets/texture-fade.jpg', alt:'Fade cu textură și barbă scurtă, finisat cu styling la Alex Sima Barber Studio'}
  ];
  $$('[data-service]').forEach(button => button.addEventListener('click', () => {
    const selected = Number(button.dataset.service);
    $$('.service-item').forEach((item, index) => {
      const isOpen = index === selected;
      item.classList.toggle('is-open', isOpen);
      $('.service-trigger', item).setAttribute('aria-expanded', String(isOpen));
      $('.service-panel', item).inert = !isOpen;
    });
    const photo = $('#service-photo');
    photo.src = serviceImages[selected].src;
    photo.alt = serviceImages[selected].alt;
    $('#service-image-number').textContent = `${pad(selected + 1)} / ${pad(serviceImages.length)}`;
  }));

  const photos = [
    {src:'assets/textured-crop.jpg',title:'Crop fade',category:'cuts',label:'FADE-URI',alt:'Crop fade cu textură pe creștet, din profil, realizat la Alex Sima Barber Studio',url:'https://mero.ro/p/alex-sima'},
    {src:'assets/low-fade.jpg',title:'Low fade',category:'cuts',label:'FADE-URI',alt:'Low fade cu păr texturat și ochelari, din profil, la Alex Sima Barber Studio',url:'https://mero.ro/p/alex-sima'},
    {src:'assets/fade-beard-profile.jpg',title:'Fade & barbă',category:'beard',label:'BARBĂ',alt:'Fade cu păr scurt texturat și barbă conturată, la Alex Sima Barber Studio',url:'https://mero.ro/p/alex-sima'},
    {src:'assets/mid-fade.jpg',title:'Mid fade',category:'cuts',label:'FADE-URI',alt:'Mid fade văzut din spate, cu tranziție curată, la Alex Sima Barber Studio',url:'https://mero.ro/p/alex-sima'},
    {src:'assets/alex-at-work.jpg',title:'Alex la lucru',category:'studio',label:'STUDIO',alt:'Alexandru Sima lucrează cu foarfeca la o tunsoare, în studio',url:'https://mero.ro/p/alex-sima'},
    {src:'assets/modern-mullet.jpg',title:'Mullet modern',category:'cuts',label:'FADE-URI',alt:'Mullet modern cu breton texturat și fade lateral, la Alex Sima Barber Studio',url:'https://mero.ro/p/alex-sima'},
    {src:'assets/full-beard.jpg',title:'Barbă lungă',category:'beard',label:'BARBĂ',alt:'Fade scurt și barbă lungă conturată, din profil, la Alex Sima Barber Studio',url:'https://mero.ro/p/alex-sima'},
    {src:'assets/crew-cut.jpg',title:'Crew cut',category:'cuts',label:'FADE-URI',alt:'Crew cut scurt cu fade, văzut din lateral, la Alex Sima Barber Studio',url:'https://mero.ro/p/alex-sima'},
    {src:'assets/curly-fade.jpg',title:'Bucle & taper',category:'cuts',label:'FADE-URI',alt:'Păr creț pe creștet cu taper fade la ceafă, la Alex Sima Barber Studio',url:'https://mero.ro/p/alex-sima'},
    {src:'assets/texture-fade.jpg',title:'Textură & fade',category:'beard',label:'BARBĂ',alt:'Fade cu textură și barbă scurtă, din profil, la Alex Sima Barber Studio',url:'https://mero.ro/p/alex-sima'},
    {src:'assets/studio-interior.jpg',title:'Studioul',category:'studio',label:'STUDIO',alt:'Interiorul studioului, cu scaun de frizerie negru, oglindă și chiuvetă',url:'https://mero.ro/p/alex-sima'}
  ];
  let filtered = [...photos];
  let current = 0;
  const gallery = $('.gallery');
  const stage = $('#gallery-stage');
  let cards = [];
  function buildGallery() {
    stage.replaceChildren();
    cards = filtered.map((photo, index) => {
      const card = document.createElement('button');
      card.className = 'gallery-card';
      card.type = 'button';
      card.setAttribute('aria-label', `${photo.title}, ${index + 1} din ${filtered.length}`);
      const img = document.createElement('img');
      img.src = photo.src; img.alt = photo.alt; img.width = 361; img.height = 640; img.loading = 'lazy'; img.draggable = false;
      const top = document.createElement('span'); top.className = 'card-top';
      top.innerHTML = `<span>ALEX SIMA / ${pad(index + 1)}</span><svg aria-hidden="true"><use href="#diagonal"/></svg>`;
      const bottom = document.createElement('span'); bottom.className = 'card-bottom';
      const title = document.createElement('span'); title.textContent = photo.title.toLocaleUpperCase('ro');
      const open = document.createElement('span'); open.className = 'card-open'; open.textContent = 'MĂREȘTE ↗';
      bottom.append(title, open); card.append(img, top, bottom);
      card.addEventListener('click', () => { if (suppressClick) return; if (current === index) openLightbox(); else goTo(index); });
      stage.append(card); return card;
    });
    paintGallery();
  }
  function paintGallery() {
    const spacing = Math.min(window.innerWidth * .21, 265);
    cards.forEach((card, index) => {
      let delta = index - current;
      if (delta > filtered.length / 2) delta -= filtered.length;
      if (delta < -filtered.length / 2) delta += filtered.length;
      const abs = Math.abs(delta);
      const active = abs === 0;
      card.style.transform = `translateX(calc(-50% + ${delta * spacing}px)) translateY(${abs * 17}px) translateZ(${-abs * 110}px) rotate(${delta * 5}deg) scale(${1 - Math.min(abs, 3) * .035})`;
      card.style.zIndex = String(10 - abs);
      card.style.opacity = abs > 2 ? '0' : String(1 - abs * .25);
      card.style.filter = active ? 'none' : `brightness(${1 - abs * .14})`;
      card.style.pointerEvents = abs > 2 ? 'none' : 'auto';
      card.tabIndex = active ? 0 : -1;
      card.setAttribute('aria-hidden', String(abs > 2));
      card.dataset.active = String(active);
      card.setAttribute('aria-label', `${filtered[index].title}. ${active ? 'Mărește fotografia' : 'Selectează fotografia'}. ${index + 1} din ${filtered.length}`);
      $('.card-open', card).hidden = !active;
    });
    $('#gallery-count').textContent = `${pad(current + 1)} / ${pad(filtered.length)}`;
    $('#gallery-title').textContent = filtered[current].title;
    $('#gallery-category').textContent = `${filtered[current].label} / ALEX SIMA`;
    const single = filtered.length === 1;
    [$('#gallery-prev'), $('#gallery-next'), $('#lightbox-prev'), $('#lightbox-next')].forEach(button => { button.disabled = single; button.style.opacity = single ? '.3' : ''; });
    if (lightbox.open) paintLightbox();
  }
  function goTo(index) { current = (index + filtered.length) % filtered.length; paintGallery(); }
  function step(direction) { goTo(current + direction); }
  function paintLightbox() {
    const photo = filtered[current];
    $('#lightbox-image').src = photo.src;
    $('#lightbox-image').alt = photo.alt;
    $('#lightbox-title').textContent = photo.title;
    $('#lightbox-count').textContent = `ALEX SIMA / ${pad(current + 1)} DIN ${pad(filtered.length)}`;
    $('#lightbox-source').href = photo.url;
  }
  function openLightbox() { paintLightbox(); openDialog(lightbox); }
  $('#gallery-prev').addEventListener('click', () => step(-1));
  $('#gallery-next').addEventListener('click', () => step(1));
  $('#lightbox-prev').addEventListener('click', () => step(-1));
  $('#lightbox-next').addEventListener('click', () => step(1));
  lightbox.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); } });
  gallery.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); }
    if (event.key === 'Enter' && event.target === gallery) openLightbox();
  });
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filtered = button.dataset.filter === 'all' ? [...photos] : photos.filter(photo => photo.category === button.dataset.filter);
    current = 0; buildGallery();
  }));
  let pointerStart = null;
  let suppressClick = false;
  stage.addEventListener('pointerdown', event => { pointerStart = {x:event.clientX, y:event.clientY}; suppressClick = false; });
  stage.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClick = true; step(dx < 0 ? 1 : -1);
      setTimeout(() => { suppressClick = false; }, 100);
    }
    pointerStart = null;
  });
  stage.addEventListener('pointercancel', () => { pointerStart = null; });
  window.addEventListener('resize', paintGallery, {passive:true});
  buildGallery();

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
      $$('.desktop-nav a').forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    }), {rootMargin:'-15% 0px -65% 0px',threshold:0});
    $$('main section[id]').forEach(section => navObserver.observe(section));
  }
  let scrollPending = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    $('.reading-progress').style.width = `${max > 0 ? window.scrollY / max * 100 : 0}%`;
    scrollPending = false;
  };
  window.addEventListener('scroll', () => { if (!scrollPending) { requestAnimationFrame(updateProgress); scrollPending = true; } }, {passive:true});
  updateProgress();
  $('#year').textContent = new Date().getFullYear();
})();
