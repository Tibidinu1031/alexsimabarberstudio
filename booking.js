(() => {
  'use strict';
  const core = window.BookingCore;
  const section = document.getElementById('programari');
  if (!core) return;

  // Every [data-open-status] element shows whether the studio is open right now.
  const statuses = [...document.querySelectorAll('[data-open-status]')];
  function paintStatus() {
    const status = core.openStatus();
    statuses.forEach(element => {
      element.classList.toggle('is-open', status.open);
      element.querySelector('[data-status-text]').textContent = status.label;
    });
  }
  if (statuses.length) { paintStatus(); setInterval(paintStatus, 60000); }
  if (!section) return;

  const $ = selector => section.querySelector(selector);
  const link = $('#mero-link');
  function update() {
    const input = $('input[name="appointment-service"]:checked');
    $('#summary-service').textContent = input.value;
    $('#summary-duration').textContent = input.dataset.duration;
    $('#summary-price').textContent = input.dataset.price;
    link.href = core.meroLink(input.dataset.mero);
  }
  section.addEventListener('change', event => { if (event.target.name === 'appointment-service') update(); });
  document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
    const toggle = document.querySelector('.menu-toggle');
    if (toggle?.getAttribute('aria-expanded') === 'true') toggle.click();
    if (button.dataset.book) {
      const radio = [...section.querySelectorAll('input[name="appointment-service"]')].find(input => input.value === button.dataset.book);
      if (radio) { radio.checked = true; update(); }
    }
    section.focus({preventScroll:true});
    section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
  }));
  update();
})();
