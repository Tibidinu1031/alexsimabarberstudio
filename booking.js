(() => {
  'use strict';
  const core = window.BookingCore;
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

  // The MERO calendar lives in the page; choosing a service loads its booking step there.
  const section = document.getElementById('programare');
  const frame = document.getElementById('mero-frame');
  const select = document.getElementById('booking-service');
  const openLink = document.getElementById('mero-open');
  const label = document.getElementById('mero-label');
  const panel = frame && frame.closest('.booking-frame');
  if (!section || !frame || !select) return;
  // The calendar bar names the chosen service, and the calendar and menu flash gold when it changes.
  function flash(element) {
    if (!element) return;
    element.classList.remove('is-flashing');
    void element.offsetWidth;
    element.classList.add('is-flashing');
  }
  function load(serviceId) {
    const url = serviceId ? core.meroLink(serviceId) : core.mero.profile;
    select.value = serviceId || '';
    openLink.href = url;
    if (label) label.textContent = serviceId ? select.options[select.selectedIndex].text : 'Calendar MERO';
    if (frame.src !== url) frame.src = url;
    flash(panel);
    flash(select.closest('.booking-select'));
  }
  [panel, select.closest('.booking-select')].forEach(element => element && element.addEventListener('animationend', event => { if (event.animationName.startsWith('flash-')) element.classList.remove('is-flashing'); }));
  select.addEventListener('change', () => load(select.value));
  document.querySelectorAll('[data-mero]').forEach(button => button.addEventListener('click', () => {
    load(button.dataset.mero);
    section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
  }));
})();
