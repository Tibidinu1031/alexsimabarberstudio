/* Opening hours and MERO booking links. Times follow Romania's clock wherever the visitor is. */
(function (root) {
  'use strict';
  const mero = Object.freeze({profile:'https://mero.ro/p/alex-sima', worker:'67a5c115d1bbcf647602b27c'});
  // Opening hours by weekday, 0 being Sunday, as published on the studio's MERO profile.
  const hours = Object.freeze([null, ...Array(5).fill(Object.freeze(['10:00','19:00'])), Object.freeze(['10:30','17:30'])]);
  const dayNames = Object.freeze(['duminică','luni','marți','miercuri','joi','vineri','sâmbătă']);
  function studioClock(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone:'Europe/Bucharest', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23'
    }).formatToParts(now);
    const value = type => parts.find(part => part.type === type).value;
    const date = `${value('year')}-${value('month')}-${value('day')}`;
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    return {date, time:`${value('hour')}:${value('minute')}`, weekday};
  }
  // Opens MERO on step two of booking, with Alex and the chosen service already selected.
  function meroLink(serviceId) {
    if (!/^[0-9a-f]{24}$/.test(serviceId || '')) return mero.profile;
    const query = new URLSearchParams({page:'appointment_summary', workerIds:mero.worker, serviceIds:serviceId});
    return `${mero.profile}?${query}`;
  }
  function openStatus(now = new Date()) {
    const clock = studioClock(now);
    const today = hours[clock.weekday];
    if (today && clock.time >= today[0] && clock.time < today[1]) return {open:true, label:`Deschis acum, închide la ${today[1]}`};
    for (let step = 0; step < 7; step++) {
      const weekday = (clock.weekday + step) % 7;
      const day = hours[weekday];
      if (!day || (step === 0 && clock.time >= day[0])) continue;
      const when = step === 0 ? 'azi' : step === 1 ? 'mâine' : dayNames[weekday];
      return {open:false, label:`Închis acum, deschide ${when} la ${day[0]}`};
    }
    return {open:false, label:'Închis acum'};
  }
  const api = Object.freeze({mero, hours, studioClock, meroLink, openStatus});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BookingCore = api;
})(typeof window === 'undefined' ? globalThis : window);
