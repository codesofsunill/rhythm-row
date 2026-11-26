/**
 * RHYTHM ROW  -  Google Apps Script backend  (v5)
 * ---------------------------------------------------------------
 * Sheet ke 5 tabs: Teachers, Workshops, Classes, Promo, Registrations
 * Setup: README.md ka "Part A". Pehli baar `setup` function run karo.
 */

var ID_PREFIX   = 'RR';                 // config.js ke idPrefix jaisa
var BRAND       = 'Rhythm Row';
var OWNER_EMAIL = '';                   // naye booking ki mail yahan aayegi (khali = nahi)

var TABS = {
  Teachers:      ['id', 'name', 'photo', 'styles', 'instagram', 'bio'],
  Workshops:     ['id', 'teacher', 'tag', 'date', 'city', 'venue', 'mapLink', 'groupLink', 'bundleMin', 'bundleOff', 'active'],
  Classes:       ['id', 'workshop', 'name', 'time', 'price', 'seats'],
  Promo:         ['code', 'type', 'value', 'active'],
  Registrations: ['Ticket ID', 'Time', 'Status', 'Name', 'Phone', 'Email', 'Age', 'Level', 'Note', 'Workshop ID', 'Teacher', 'Date', 'Classes', 'Class IDs', 'Total', 'Discount', 'Promo', 'UTR']
};

/* ------------------------- one-time setup ------------------------- */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(TABS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    var head = TABS[name];
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
  var cls = ss.getSheetByName('Classes'); cls.getRange('D:D').setNumberFormat('@');          // time = text
  var wk = ss.getSheetByName('Workshops'); wk.getRange('D:D').setNumberFormat('yyyy-mm-dd');
  var reg = ss.getSheetByName('Registrations'); reg.getRange('E:E').setNumberFormat('@'); reg.getRange('R:R').setNumberFormat('@');
  reg.getRange('C2:C2000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Pending', 'Verified', 'Rejected'], true).build());
  var cf = reg.getRange('C2:C2000');
  reg.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Verified').setBackground('#bbf7d0').setRanges([cf]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Rejected').setBackground('#fecaca').setRanges([cf]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Pending').setBackground('#fef08a').setRanges([cf]).build()
  ]);
  ss.getSheetByName('Workshops').getRange('K2:K500').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['yes', 'no'], true).build());
  ss.getSheetByName('Promo').getRange('D2:D500').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['yes', 'no'], true).build());
  ss.getSheetByName('Promo').getRange('B2:B500').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['flat', 'percent'], true).build());

  // sample rows (sirf jab tab khali ho)
  if (ss.getSheetByName('Teachers').getLastRow() < 2) {
    ss.getSheetByName('Teachers').appendRow(['t1', 'Teacher Name', '', 'Bollywood, Hip Hop', '@handle', 'Short bio here.']);
    var d = new Date(); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    ss.getSheetByName('Workshops').appendRow(['w1', 't1', 'Dance Workshop', d, 'Your City', 'Venue name, area', '', 'https://chat.whatsapp.com/XXXX', 3, 150, 'yes']);
    cls.appendRow(['c1', 'w1', 'Song one', '1:00 PM', 950, 20]);
    cls.appendRow(['c2', 'w1', 'Song two', '4:00 PM', 950, 20]);
    cls.appendRow(['c3', 'w1', 'Song three', '6:00 PM', 950, 20]);
    ss.getSheetByName('Promo').appendRow(['WELCOME100', 'flat', 100, 'yes']);
  }
  // Verified karte hi attendee ko mail
  var has = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'onStatusEdit'; });
  if (!has) ScriptApp.newTrigger('onStatusEdit').forSpreadsheet(ss).onEdit().create();
  SpreadsheetApp.getUi && SpreadsheetApp.getActive().toast('Setup complete. Ab Deploy > New deployment karo.');
}

/* ------------------------- helpers ------------------------- */
function tz_() { return Session.getScriptTimeZone(); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function sheet_(n) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n); }
function str_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, tz_(), 'yyyy-MM-dd');
  return v == null ? '' : String(v).trim();
}
function time_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, tz_(), 'h:mm a');
  return v == null ? '' : String(v).trim();
}
function rows_(name) {
  var sh = sheet_(name); if (!sh || sh.getLastRow() < 2) return [];
  var vals = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues(), head = vals[0], res = [];
  for (var i = 1; i < vals.length; i++) {
    var o = { _row: i + 1 }; head.forEach(function (h, j) { o[String(h)] = vals[i][j]; });
    if (String(vals[i][0]).trim() !== '') res.push(o);
  }
  return res;
}
function sold_() {
  var s = {};
  rows_('Registrations').forEach(function (r) {
    if (str_(r['Status']) === 'Rejected') return;
    str_(r['Class IDs']).split(',').forEach(function (id) { id = id.trim(); if (id) s[id] = (s[id] || 0) + 1; });
  });
  return s;
}
function yes_(v) { return String(v).trim().toLowerCase() !== 'no'; }
function price_(picked, bundleMin, bundleOff, promo) {
  var sub = 0; picked.forEach(function (c) { sub += Number(c.price) || 0; });
  var bundle = (bundleMin && picked.length >= bundleMin) ? Math.min(sub, Number(bundleOff) || 0) : 0, after = sub - bundle, pd = 0;
  if (promo) pd = promo.type === 'percent' ? Math.round(after * promo.value / 100) : Math.min(after, promo.value);
  return { sub: sub, bundle: bundle, promo: pd, total: Math.max(0, after - pd) };
}
function findPromo_(code) {
  code = String(code || '').trim().toUpperCase(); if (!code) return null;
  var hit = rows_('Promo').filter(function (r) { return String(r.code).trim().toUpperCase() === code && yes_(r.active); })[0];
  return hit ? { code: code, type: String(hit.type).trim() === 'percent' ? 'percent' : 'flat', value: Number(hit.value) || 0 } : null;
}

/* ------------------------- GET ------------------------- */
function doGet(e) {
  try {
    var p = (e && e.parameter) || {}, a = p.action || 'data';
    if (a === 'data') return out_(dataPayload_());
    if (a === 'promo') {
      var pr = findPromo_(p.code);
      return out_(pr ? { ok: true, type: pr.type, value: pr.value } : { ok: false, error: 'That code isn’t valid.' });
    }
    if (a === 'ticket') return out_(ticket_(p.id, p.p));
    return out_({ ok: false, error: 'Unknown action' });
  } catch (err) { return out_({ ok: false, error: String(err) }); }
}
function dataPayload_() {
  var sold = sold_(), classes = rows_('Classes');
  var teachers = rows_('Teachers').map(function (t) {
    return { id: str_(t.id), name: str_(t.name), photo: str_(t.photo), styles: str_(t.styles).split(',').map(function (s) { return s.trim(); }).filter(Boolean), instagram: str_(t.instagram), bio: str_(t.bio) };
  });
  var workshops = rows_('Workshops').filter(function (w) { return yes_(w.active); }).map(function (w) {
    var id = str_(w.id);
    return {
      id: id, teacher: str_(w.teacher), tag: str_(w.tag) || 'Dance Workshop', date: str_(w.date), city: str_(w.city), venue: str_(w.venue), mapLink: str_(w.mapLink),
      bundle: Number(w.bundleMin) ? { min: Number(w.bundleMin), off: Number(w.bundleOff) || 0 } : null,
      classes: classes.filter(function (c) { return str_(c.workshop) === id; }).map(function (c) {
        var seats = str_(c.seats) === '' ? null : Number(c.seats);
        return { id: str_(c.id), name: str_(c.name), time: time_(c.time), price: Number(c.price) || 0, left: seats == null ? null : Math.max(0, seats - (sold[str_(c.id)] || 0)) };
      })
    };
  });
  return { ok: true, teachers: teachers, workshops: workshops };
}
function ticket_(id, p4) {
  id = String(id || '').trim().toUpperCase(); p4 = String(p4 || '').trim();
  var r = rows_('Registrations').filter(function (x) { return str_(x['Ticket ID']).toUpperCase() === id; })[0];
  if (!r || str_(r['Phone']).slice(-4) !== p4) return { ok: false, error: 'No ticket found. Check the ID and last 4 digits.' };
  var w = rows_('Workshops').filter(function (x) { return str_(x.id) === str_(r['Workshop ID']); })[0] || {};
  var names = str_(r['Classes']).split(' | '), cls = rows_('Classes'), ids = str_(r['Class IDs']).split(',');
  var list = ids.map(function (cid, i) {
    var c = cls.filter(function (x) { return str_(x.id) === cid.trim(); })[0] || {};
    return { name: str_(c.name) || names[i] || cid, time: time_(c.time), price: Number(c.price) || 0 };
  });
  var status = str_(r['Status']) || 'Pending';
  return {
    ok: true, ticket: {
      id: id, status: status, name: str_(r['Name']), teacher: str_(r['Teacher']), tag: str_(w.tag), date: str_(r['Date']), city: str_(w.city), venue: str_(w.venue),
      mapLink: str_(w.mapLink), groupLink: status === 'Verified' ? str_(w.groupLink) : '', classes: list,
      total: Number(r['Total']) || 0, discount: Number(r['Discount']) || 0, promo: str_(r['Promo'])
    }
  };
}

/* ------------------------- POST ------------------------- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var b = JSON.parse(e.postData.contents || '{}');
    if (b.action !== 'register') return out_({ ok: false, error: 'Unknown action' });
    if (b.hp) return out_({ ok: true, ticket: { id: ID_PREFIX + '-' + Math.random().toString(36).slice(2, 8).toUpperCase() } });  // honeypot

    var name = String(b.name || '').trim(), phone = String(b.phone || '').replace(/\D/g, '').slice(-10), email = String(b.email || '').trim();
    if (name.length < 2) return out_({ ok: false, error: 'Please enter your name.' });
    if (phone.length !== 10) return out_({ ok: false, error: 'Please enter a valid 10 digit phone number.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out_({ ok: false, error: 'Email address looks wrong.' });

    var w = rows_('Workshops').filter(function (x) { return str_(x.id) === String(b.workshopId) && yes_(x.active); })[0];
    if (!w) return out_({ ok: false, error: 'This workshop is no longer open.' });
    var ids = (b.classIds || []).map(String);
    var all = rows_('Classes').filter(function (c) { return str_(c.workshop) === str_(w.id); });
    var picked = all.filter(function (c) { return ids.indexOf(str_(c.id)) > -1; });
    if (!picked.length || picked.length !== ids.length) return out_({ ok: false, error: 'Please choose valid classes.' });

    var sold = sold_();
    for (var i = 0; i < picked.length; i++) {
      var seats = str_(picked[i].seats);
      if (seats !== '' && (sold[str_(picked[i].id)] || 0) >= Number(seats)) return out_({ ok: false, error: '“' + str_(picked[i].name) + '” just sold out. Please pick another class.' });
    }
    var promo = findPromo_(b.promo);
    if (b.promo && !promo) return out_({ ok: false, error: 'That promo code isn’t valid.' });
    var pr = price_(picked, Number(w.bundleMin) || 0, Number(w.bundleOff) || 0, promo);

    var utr = String(b.utr || '').replace(/\s/g, '');
    if (pr.total > 0) {
      if (!/^[A-Za-z0-9]{10,22}$/.test(utr)) return out_({ ok: false, error: 'Please enter a valid UTR / transaction ID.' });
      var dup = rows_('Registrations').some(function (r) { return str_(r['UTR']).toLowerCase() === utr.toLowerCase(); });
      if (dup) return out_({ ok: false, error: 'This UTR has already been used. If you think this is a mistake, WhatsApp us.' });
    } else utr = 'FREE';

    var existing = {}; rows_('Registrations').forEach(function (r) { existing[str_(r['Ticket ID'])] = 1; });
    var id; do { id = ID_PREFIX + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(); } while (existing[id]);

    var teacher = (rows_('Teachers').filter(function (t) { return str_(t.id) === str_(w.teacher); })[0] || {}).name || str_(w.teacher);
    var sh = sheet_('Registrations');
    sh.appendRow([id, new Date(), 'Pending', name, phone, email, b.age || '', b.level || '', String(b.note || '').slice(0, 300), str_(w.id), str_(teacher), str_(w.date),
      picked.map(function (c) { return str_(c.name) + ' (' + time_(c.time) + ')'; }).join(' | '), picked.map(function (c) { return str_(c.id); }).join(','),
      pr.total, pr.bundle + pr.promo, promo ? promo.code : '', utr]);
    SpreadsheetApp.flush();

    try {
      var body = 'Hi ' + name + ',\n\nThanks for booking with ' + BRAND + '.\nTicket: ' + id + '\nWorkshop: ' + teacher + ' on ' + str_(w.date) + '\nClasses: ' +
        picked.map(function (c) { return str_(c.name) + ' (' + time_(c.time) + ')'; }).join(', ') + '\nTotal: Rs ' + pr.total +
        '\n\nWe will verify your payment shortly. Check your ticket status on the website under "My Ticket" (ID + last 4 digits of your phone).';
      if (email) MailApp.sendEmail(email, BRAND + ' booking received: ' + id, body);
      if (OWNER_EMAIL) MailApp.sendEmail(OWNER_EMAIL, 'New booking ' + id + ' - Rs ' + pr.total, name + ' / ' + phone + '\n' + teacher + ' ' + str_(w.date) + '\nUTR: ' + utr);
    } catch (mailErr) { /* mail quota ya galat email: booking phir bhi save hai */ }

    return out_({ ok: true, ticket: { id: id } });
  } catch (err) {
    return out_({ ok: false, error: 'Server busy, please try again.' });
  } finally { try { lock.releaseLock(); } catch (x) {} }
}

/* ------------------------- Verified hote hi mail ------------------------- */
function onStatusEdit(e) {
  try {
    var sh = e.range.getSheet();
    if (sh.getName() !== 'Registrations' || e.range.getColumn() !== 3 || e.range.getRow() < 2) return;
    if (String(e.value) !== 'Verified') return;
    var r = sh.getRange(e.range.getRow(), 1, 1, TABS.Registrations.length).getValues()[0];
    var email = String(r[5] || '').trim(); if (!email) return;
    var w = rows_('Workshops').filter(function (x) { return str_(x.id) === String(r[9]); })[0] || {};
    var link = str_(w.groupLink);
    MailApp.sendEmail(email, BRAND + ' booking confirmed: ' + r[0],
      'Hi ' + r[3] + ',\n\nYour payment is verified and your spot is confirmed.\nTicket: ' + r[0] + '\nWorkshop: ' + r[10] + ' on ' + str_(w.date) +
      '\nVenue: ' + str_(w.venue) + (link ? '\n\nJoin the WhatsApp group: ' + link : '') + '\n\nSee you on the floor!');
  } catch (err) {}
}
