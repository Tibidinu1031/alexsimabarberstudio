const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../booking-core.js');

test('the studio clock follows Romania across local midnight and seasonal offsets',()=>{
  assert.deepEqual(core.studioClock(new Date('2026-11-01T22:30:00Z')),{date:'2026-11-02',time:'00:30',weekday:1});
  assert.deepEqual(core.studioClock(new Date('2026-07-01T21:30:00Z')),{date:'2026-07-02',time:'00:30',weekday:4});
});
test('MERO links open the booking step with Alex and the chosen service',()=>{
  const url = new URL(core.meroLink('67aaf7a8b6448d74b09938eb'));
  assert.equal(url.origin + url.pathname,'https://mero.ro/p/alex-sima');
  assert.equal(url.searchParams.get('page'),'appointment_summary');
  assert.equal(url.searchParams.get('workerIds'),'67a5c115d1bbcf647602b27c');
  assert.equal(url.searchParams.get('serviceIds'),'67aaf7a8b6448d74b09938eb');
  assert.equal(core.meroLink('not-an-id'),'https://mero.ro/p/alex-sima');
  assert.equal(core.meroLink(undefined),'https://mero.ro/p/alex-sima');
});
test('opening hours follow the MERO week, with Saturday shorter and Sunday closed',()=>{
  assert.deepEqual(core.hours[1],['10:00','19:00']);
  assert.deepEqual(core.hours[6],['10:30','17:30']);
  assert.equal(core.hours[0],null);
});
test('the open status names the closing time or the next opening',()=>{
  assert.deepEqual(core.openStatus(new Date('2026-11-03T10:00:00Z')),{open:true,label:'Deschis acum, închide la 19:00'});
  assert.deepEqual(core.openStatus(new Date('2026-11-03T07:00:00Z')),{open:false,label:'Închis acum, deschide azi la 10:00'});
  assert.deepEqual(core.openStatus(new Date('2026-11-03T17:00:00Z')),{open:false,label:'Închis acum, deschide mâine la 10:00'});
  assert.deepEqual(core.openStatus(new Date('2026-11-06T18:00:00Z')),{open:false,label:'Închis acum, deschide mâine la 10:30'});
  assert.deepEqual(core.openStatus(new Date('2026-11-07T16:00:00Z')),{open:false,label:'Închis acum, deschide luni la 10:00'});
  assert.deepEqual(core.openStatus(new Date('2026-11-08T10:00:00Z')),{open:false,label:'Închis acum, deschide mâine la 10:00'});
});
