/* =====================================================================
   RHYTHM ROW  -  app.js
   Sab content window.CONFIG (config.js) se aata hai.
   scriptUrl bhara ho to workshops/teachers/seats/promo Google Sheet se.
   ===================================================================== */
(function () {
  'use strict';
  var C = window.CONFIG || {};
  C.contact = C.contact || {}; C.payment = C.payment || {}; C.images = C.images || {};
  C.theme = C.theme || {}; C.sections = C.sections || {};
  var SHEET = !!(C.scriptUrl && /^https?:/.test(C.scriptUrl));

  /* ---------------- helpers ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var rupee = function (n) { return '₹' + Math.round(n).toLocaleString('en-IN'); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var IC = {
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    share: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
    ig: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    yt: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
    wa: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-3.8-.9-3.2-1.3-5.2-4.5-5.4-4.7-.1-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.5l1 2.3c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2.2 1c.3.2.5.2.6.4.1.1.1.8-.1 1.5Z"/></svg>'
  };
  function applyBgs(root) {
    $$('[data-bg]', root).forEach(function (el) {
      var p = el.getAttribute('data-bg'); if (p) el.style.backgroundImage = 'url("' + p.replace(/"/g, '%22') + '")';
    });
  }
  function toast(msg, kind) {
    var t = document.createElement('div'); t.className = 'toast ' + (kind || ''); t.textContent = msg;
    $('toasts').appendChild(t); setTimeout(function () { t.remove(); }, 3600);
  }
  function waLink(text) {
    var n = String(C.contact.whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function brandHTML() {
    var b = String(C.brand || 'Studio').trim(), i = b.indexOf(' ');
    return i > 0 ? esc(b.slice(0, i)) + ' <b>' + esc(b.slice(i + 1)) + '</b>' : esc(b);
  }
  function logoHTML() {
    return C.images.logo ? '<img src="' + esc(C.images.logo) + '" alt="' + esc(C.brand) + '">' : brandHTML();
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function dateShort(s) { var d = parseDate(s); return d ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : ''; }
  function dateLong(s) { var d = parseDate(s); return d ? d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''; }
  function timeMins(t) {
    var m = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i.exec(String(t || ''));
    if (!m) return 0;
    var h = +m[1], mi = +(m[2] || 0), ap = (m[3] || '').toLowerCase();
    if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0;
    return h * 60 + mi;
  }
  function startOf(ws, cls) {
    var d = parseDate(ws.date); if (!d) return null;
    d.setMinutes(timeMins(cls.time)); return d;
  }
  function normPhone(s) {
    var d = String(s || '').replace(/\D/g, '');
    if (d.length > 10 && d.indexOf('91') === 0) d = d.slice(-10);
    if (d.length === 11 && d[0] === '0') d = d.slice(1);
    return d;
  }
  function rand(n) {
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }
  function fetchJSON(url, opts, ms) {
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 20000);
    opts = opts || {}; if (ctl) opts.signal = ctl.signal;
    return fetch(url, opts).then(function (r) { return r.json(); }).then(function (j) { clearTimeout(timer); return j; },
      function (e) { clearTimeout(timer); throw e; });
  }
  function sheetGet(params) {
    var q = Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetchJSON(C.scriptUrl + (C.scriptUrl.indexOf('?') > -1 ? '&' : '?') + q);
  }
  function sheetPost(body) {
    return fetchJSON(C.scriptUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
  }

  /* ---------------- theme + accent ---------------- */
  function hexRGB(h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-f]{6}$/i.test(h)) return [45, 212, 160];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function lum(rgb) {
    var a = rgb.map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * a[0] + .7152 * a[1] + .0722 * a[2];
  }
  function applyAccent() {
    var root = document.documentElement, light = root.getAttribute('data-theme') === 'light';
    var rgb = hexRGB(C.theme.accent || '#2DD4A0');
    var rgbT = light ? hexRGB(C.theme.accentOnLight || '') : rgb;
    if (light && !C.theme.accentOnLight) rgbT = rgb.map(function (v) { return Math.round(v * .6); });
    var use = light ? rgbT : rgb;
    root.style.setProperty('--accent', 'rgb(' + rgb.join(',') + ')');
    root.style.setProperty('--accent-rgb', rgb.join(','));
    root.style.setProperty('--accent-text', 'rgb(' + use.join(',') + ')');
    root.style.setProperty('--on-accent', lum(rgb) > .42 ? '#05120D' : '#FFFFFF');
  }
  function setTheme(m, save) {
    document.documentElement.setAttribute('data-theme', m);
    if (save) { try { localStorage.setItem('rr_theme', m); } catch (e) {} }
    var meta = $('metaTheme'); if (meta) meta.setAttribute('content', m === 'light' ? '#EDF1EE' : '#070A09');
    $('themeBtn').setAttribute('aria-label', m === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    applyAccent();
  }

  /* ---------------- data ---------------- */
  var DATA = { ready: false, teachers: [], workshops: [], at: 0 };

  function nextSaturday(weeks) {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    var add = ((6 - d.getDay()) + 7) % 7 || 7;
    d.setDate(d.getDate() + add + (Math.max(1, weeks || 1) - 1) * 7);
    return ymd(d);
  }
  function demoTickets() { return store.get('rr_tickets', {}); }
  function demoSold() {
    var sold = {}, t = demoTickets();
    Object.keys(t).forEach(function (id) {
      if (t[id].status === 'Rejected') return;
      (t[id].classIds || []).forEach(function (c) { sold[c] = (sold[c] || 0) + 1; });
    });
    return sold;
  }
  function normalizeConfig() {
    var sold = demoSold();
    return {
      teachers: (C.teachers || []).slice(),
      workshops: (C.workshops || []).map(function (w) {
        return {
          id: w.id, teacher: w.teacher, tag: w.tag || 'Dance Workshop', date: w.date || nextSaturday(w.weeksFromNow),
          city: w.city || C.city || '', venue: w.venue || '', mapLink: w.mapLink || '', groupLink: w.groupLink || '',
          bundle: w.bundle && w.bundle.min ? { min: +w.bundle.min, off: +w.bundle.off || 0 } : null,
          classes: (w.classes || []).map(function (c) {
            return { id: c.id, name: c.name, time: c.time, price: +c.price || 0, left: c.seats == null ? null : Math.max(0, (+c.seats) - (sold[c.id] || 0)) };
          })
        };
      })
    };
  }
  function normalizeApi(j) {
    return {
      teachers: (j.teachers || []).map(function (t) {
        return { id: String(t.id), name: t.name, photo: t.photo || '', styles: Array.isArray(t.styles) ? t.styles : String(t.styles || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean), instagram: t.instagram || '', bio: t.bio || '' };
      }),
      workshops: (j.workshops || []).map(function (w) {
        return {
          id: String(w.id), teacher: String(w.teacher || ''), tag: w.tag || 'Dance Workshop', date: String(w.date || '').slice(0, 10),
          city: w.city || '', venue: w.venue || '', mapLink: w.mapLink || '', groupLink: '',
          bundle: w.bundle && +w.bundle.min ? { min: +w.bundle.min, off: +w.bundle.off || 0 } : null,
          classes: (w.classes || []).map(function (c) { return { id: String(c.id), name: c.name, time: c.time, price: +c.price || 0, left: c.left == null || c.left === '' ? null : +c.left }; })
        };
      })
    };
  }
  function loadData() {
    if (!SHEET) { var d = normalizeConfig(); DATA.teachers = d.teachers; DATA.workshops = d.workshops; DATA.ready = true; DATA.at = Date.now(); return Promise.resolve(); }
    return sheetGet({ action: 'data' }).then(function (j) {
      if (!j || j.ok === false) throw new Error((j && j.error) || 'bad response');
      var d = normalizeApi(j); DATA.teachers = d.teachers; DATA.workshops = d.workshops; DATA.ready = true; DATA.at = Date.now();
    });
  }
  function upcoming() {
    var today = ymd(new Date());
    return DATA.workshops.filter(function (w) { return w.date && w.date >= today && w.classes.length; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  }
  function teacherOf(w) {
    var id = w.teacher;
    for (var i = 0; i < DATA.teachers.length; i++) if (String(DATA.teachers[i].id) === String(id)) return DATA.teachers[i];
    return { id: id, name: id || 'Guest choreographer', photo: '', styles: [], instagram: '', bio: '' };
  }
  function wsById(id) { for (var i = 0; i < DATA.workshops.length; i++) if (DATA.workshops[i].id === id) return DATA.workshops[i]; return null; }
  function minPrice(w) { return Math.min.apply(null, w.classes.map(function (c) { return c.price; })); }
  function soldOut(w) { return w.classes.every(function (c) { return c.left === 0; }); }
  function initial(s) { return String(s || '?').replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase() || '?'; }

  /* ---------------- static content ---------------- */
  function renderStatic() {
    document.title = (C.brand || 'Studio') + ' | ' + (C.tagline || 'Dance Workshops');
    var og = document.querySelector('meta[property="og:title"]'); if (og) og.setAttribute('content', document.title);
    var md = document.querySelector('meta[name="description"]'); if (md && C.intro) md.setAttribute('content', C.intro);
    $('loaderMark').innerHTML = logoHTML(); $('loaderTag').textContent = C.tagline || '';
    $('navLogo').innerHTML = logoHTML(); $('footLogo').innerHTML = logoHTML();
    $('heroLogo').innerHTML = C.images.logo ? logoHTML() : '<div class="wordmark">' + brandHTML() + '</div>';
    $('heroTitle').innerHTML = (C.headline || []).map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('');
    $('heroIntro').textContent = C.intro || '';
    $$('[data-c]').forEach(function (el) { el.textContent = C[el.getAttribute('data-c')] || ''; });
    $('yr').textContent = new Date().getFullYear();
    $('refundNote').textContent = C.payment.note || '';

    var wa = waLink('Hi! I have a question about the workshops.');
    $('mWa').href = wa; $('fab').href = wa;

    // hero slideshow
    var hero = (C.images.hero || []).filter(Boolean);
    if (hero.length) {
      var hb = $('heroBg');
      hero.forEach(function (src, i) { var d = document.createElement('div'); d.className = 'hs' + (i === 0 ? ' on' : ''); d.setAttribute('data-bg', src); hb.appendChild(d); });
      applyBgs(hb);
      if (hero.length > 1) {
        var idx = 0, sl = $$('.hs', hb);
        setInterval(function () { sl[idx].classList.remove('on'); idx = (idx + 1) % sl.length; sl[idx].classList.add('on'); }, 6500);
      }
    }
    if (C.images.workshopsBg) { $('wsBg').style.setProperty('--img', 'url("' + C.images.workshopsBg.replace(/"/g, '%22') + '")'); }

    // how
    $('steps').innerHTML = (C.how || []).map(function (s, i) {
      return '<div class="step glass glow reveal"><i>' + pad(i + 1) + '</i><h3>' + esc(s.t) + '</h3><p>' + esc(s.d) + '</p></div>';
    }).join('');
    // about
    var A = C.about || {};
    $('aboutTitle').textContent = A.title || ''; $('aboutText').textContent = A.text || '';
    $('pillars').innerHTML = (A.pillars || []).map(function (p) {
      return '<div class="pillar glass glow reveal"><h3>' + esc(p.t) + '</h3><p>' + esc(p.d) + '</p></div>';
    }).join('');
    var ai = (C.images.about || []).filter(Boolean);
    if (ai.length) {
      $('aboutImgs').innerHTML = ai.slice(0, 2).map(function (s, i) { return '<div class="about-img p' + (i + 1) + ' reveal" data-bg="' + esc(s) + '"></div>'; }).join('');
      applyBgs($('aboutImgs'));
    } else $('aboutImgs').classList.add('hide');
    // gallery
    var gl = (C.images.gallery || []).filter(Boolean);
    if (gl.length) {
      $('galleryGrid').innerHTML = gl.map(function (s, i) { return '<button type="button" data-lb="' + esc(s) + '" aria-label="Open photo ' + (i + 1) + '"><img loading="lazy" src="' + esc(s) + '" alt=""></button>'; }).join('');
    } else C.sections.gallery = false;
    // reviews / faq
    $('reviewGrid').innerHTML = (C.reviews || []).map(function (r) {
      return '<figure class="rev glass glow reveal"><p>“' + esc(r.q) + '”</p><small>' + esc(r.by) + '</small></figure>';
    }).join('');
    $('faqList').innerHTML = (C.faqs || []).map(function (f) {
      return '<details class="glass reveal"><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
    }).join('');
    // contact + social
    var cards = [];
    if (C.contact.whatsapp) cards.push(['WhatsApp', C.contact.phoneDisplay || ('+' + C.contact.whatsapp), 'Fastest reply', wa]);
    if (C.contact.phoneDisplay) cards.push(['Call', C.contact.phoneDisplay, 'Daytime calls', 'tel:+' + String(C.contact.whatsapp || '').replace(/\D/g, '')]);
    if (C.contact.email) cards.push(['Email', C.contact.email, 'We reply within a day', 'mailto:' + C.contact.email]);
    if (C.contact.instagram) cards.push(['Instagram', C.contact.instagramHandle || 'Follow us', 'Updates and recaps', C.contact.instagram]);
    $('contactCards').innerHTML = cards.map(function (c) {
      return '<a class="cc glass glow reveal" href="' + esc(c[3]) + '" target="' + (c[3].indexOf('http') === 0 ? '_blank' : '_self') + '" rel="noopener"><small>' + esc(c[0]) + '</small><b>' + esc(c[1]) + '</b><span>' + esc(c[2]) + '</span></a>';
    }).join('');
    var soc = '';
    if (C.contact.instagram) soc += '<a href="' + esc(C.contact.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram">' + IC.ig + '</a>';
    if (C.contact.youtube) soc += '<a href="' + esc(C.contact.youtube) + '" target="_blank" rel="noopener" aria-label="YouTube">' + IC.yt + '</a>';
    if (C.contact.whatsapp) soc += '<a href="' + esc(wa) + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + IC.wa + '</a>';
    $('social').innerHTML = soc;
    if (C.contact.youtube) { $('videoBox').hidden = false; $('ytLink').href = C.contact.youtube; }

    // sections on/off
    $$('[data-sec]').forEach(function (el) {
      var key = el.getAttribute('data-sec');
      if (C.sections[key] === false) { el.hidden = true; el.classList.add('hide'); }
      else if (key === 'gallery') { el.hidden = false; }
    });
    if (C.sections.gallery !== false && gl.length) $('gallery').hidden = false;
  }

  /* ---------------- dynamic home: workshops, teachers, pill ---------------- */
  function renderWorkshops() {
    var list = upcoming(), grid = $('wsGrid');
    if (!list.length) {
      grid.innerHTML = '<div class="empty glass" style="grid-column:1/-1"><h3>New workshops are being planned</h3><p style="margin:10px 0 18px">Follow us or message on WhatsApp to hear first.</p><a class="btn btn-accent" href="' + esc(waLink('Hi! Please tell me when the next workshop is.')) + '" target="_blank" rel="noopener">Ask on WhatsApp</a></div>';
      return;
    }
    grid.innerHTML = list.map(function (w) {
      var t = teacherOf(w), out = soldOut(w);
      var rows = w.classes.map(function (c) {
        var flag = c.left === 0 ? '<span class="gone">Sold out</span>' : (c.left != null && c.left <= 5 ? '<span class="low">Only ' + c.left + ' left</span>' : '');
        return '<li><div><b>' + esc(c.name) + '</b><small>' + esc(c.time) + '</small></div><div class="p">' + rupee(c.price) + flag + '</div></li>';
      }).join('');
      var cta = out
        ? '<a class="btn btn-ghost btn-block" href="' + esc(waLink('Hi! The ' + t.name + ' workshop (' + dateShort(w.date) + ') is full. Please add me to the waitlist.')) + '" target="_blank" rel="noopener">Join waitlist on WhatsApp</a>'
        : '<a class="btn btn-accent btn-block" href="#register/' + esc(w.id) + '" data-nav>Choose your classes</a>';
      var venue = w.venue ? (w.mapLink
        ? '<a class="venue" href="' + esc(w.mapLink) + '" target="_blank" rel="noopener">' + IC.pin + '<span>' + esc(w.venue) + ' ↗</span></a>'
        : '<div class="venue">' + IC.pin + '<span>' + esc(w.venue) + '</span></div>') : '';
      return '<article class="ws glass glow reveal">' +
        '<div class="wph' + (t.photo ? '' : ' ph') + '" data-i="' + esc(initial(t.name)) + '"' + (t.photo ? ' data-bg="' + esc(t.photo) + '"' : '') + '>' +
        '<span class="wtag">' + esc(w.tag) + '</span>' +
        '<button class="icon-btn wshare" type="button" data-share="' + esc(w.id) + '" aria-label="Share this workshop">' + IC.share + '</button>' +
        '<button class="wname" type="button" data-teacher="' + esc(t.id) + '">' + esc(t.name) + '</button>' +
        '<div class="wmeta"><span>' + IC.cal + esc(dateShort(w.date)) + '</span><span>' + IC.pin + esc(w.city) + '</span></div></div>' +
        '<div class="wbody"><ul class="cl">' + rows + '</ul><div class="wfoot">' +
        (w.bundle && w.bundle.off ? '<div class="bundle">Pick ' + w.bundle.min + '+ classes and save ' + rupee(w.bundle.off) + '</div>' : '') +
        '<div class="from"><div><small>Starting from</small><div class="price">' + rupee(minPrice(w)) + '</div></div><em>per class</em></div>' +
        cta + venue + '</div></div></article>';
    }).join('');
    applyBgs(grid); observeReveal(grid);
  }
  function renderTeachers() {
    var list = DATA.teachers.slice();
    if (!list.length) { $('teachers').hidden = true; return; }
    $('rail').innerHTML = list.map(function (t) {
      return '<button class="tc glass glow reveal" type="button" data-t="' + esc(t.id) + '"><div class="ph' + (t.photo ? '' : ' ph0') + '"' + (t.photo ? ' data-bg="' + esc(t.photo) + '"' : '') + '>' + (t.photo ? '' : '<b>' + esc(initial(t.name)) + '</b>') + '</div><div class="nm"><h3>' + esc(t.name) + '</h3><span>' + esc((t.styles || []).slice(0, 3).join(' · ')) + '</span></div></button>';
    }).join('');
    applyBgs($('rail')); observeReveal($('rail'));
  }
  function nextClass() {
    var now = new Date(), best = null;
    upcoming().forEach(function (w) {
      w.classes.forEach(function (c) {
        if (c.left === 0) return;
        var s = startOf(w, c); if (s && s > now && (!best || s < best.at)) best = { at: s, w: w };
      });
    });
    return best;
  }
  function renderPill() {
    var n = nextClass(), pill = $('nextPill');
    if (!n) { pill.hidden = true; return; }
    var ms = n.at - new Date(), d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
    var cd = d > 0 ? d + 'd ' + h + 'h' : h + 'h ' + m + 'm';
    $('nextTxt').textContent = 'Next up: ' + teacherOf(n.w).name + ' · ' + dateShort(n.w.date) + ' · in ' + cd;
    pill.hidden = false; pill.setAttribute('data-id', n.w.id);
  }
  function injectJsonLd() {
    var items = upcoming().map(function (w) {
      var first = w.classes.slice().sort(function (a, b) { return timeMins(a.time) - timeMins(b.time); })[0], s = startOf(w, first);
      return {
        '@context': 'https://schema.org', '@type': 'Event', name: (C.brand || '') + ' – ' + teacherOf(w).name,
        startDate: s ? s.toISOString() : w.date, eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: w.venue || w.city, address: w.city },
        offers: { '@type': 'Offer', price: minPrice(w), priceCurrency: 'INR', availability: soldOut(w) ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' },
        organizer: { '@type': 'Organization', name: C.brand }
      };
    });
    if (!items.length) return;
    var old = $('ldjson'); if (old) old.remove();
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ldjson'; s.textContent = JSON.stringify(items);
    document.head.appendChild(s);
  }
  function renderLoadError() {
    $('wsGrid').innerHTML = '<div class="empty glass" style="grid-column:1/-1"><h3>Couldn’t load workshops</h3><p style="margin:10px 0 18px">Please check your internet and try again.</p><button class="btn btn-accent" type="button" id="retryLoad">Try again</button> <a class="btn btn-ghost" href="' + esc(waLink('Hi! The website is not loading workshops.')) + '" target="_blank" rel="noopener">WhatsApp us</a></div>';
  }

  /* ---------------- reveal on scroll ---------------- */
  var io = null;
  function observeReveal(root) {
    var els = $$('.reveal:not(.in)', root || document);
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    if (!io) io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: .06, rootMargin: '0px 0px -4% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- teacher modal + lightbox + share ---------------- */
  function openDlg(d) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
  function closeDlg(d) { if (d.close) d.close(); else d.removeAttribute('open'); }
  function openTeacher(id) {
    var t = null; DATA.teachers.forEach(function (x) { if (String(x.id) === String(id)) t = x; });
    if (!t) return;
    var ph = $('tPhoto'); ph.style.backgroundImage = t.photo ? 'url("' + t.photo.replace(/"/g, '%22') + '")' : '';
    $('tName').textContent = t.name;
    $('tStyles').innerHTML = (t.styles || []).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
    $('tBio').textContent = t.bio || ''; $('tBio').hidden = !t.bio;
    var ig = $('tIg');
    if (t.instagram) { ig.href = /^https?:/.test(t.instagram) ? t.instagram : 'https://instagram.com/' + t.instagram.replace(/^@/, ''); ig.hidden = false; } else ig.hidden = true;
    var ws = upcoming().filter(function (w) { return String(w.teacher) === String(t.id); });
    $('tWs').innerHTML = ws.length ? '<div class="t-ws"><small class="muted">Upcoming workshops</small>' + ws.map(function (w) {
      return '<a href="#register/' + esc(w.id) + '" data-close><span>' + esc(dateShort(w.date)) + ' · ' + esc(w.city) + '</span><b>from ' + rupee(minPrice(w)) + '</b></a>';
    }).join('') + '</div>' : '';
    openDlg($('tDlg'));
  }
  function shareWs(id) {
    var w = wsById(id); if (!w) return;
    var url = location.href.split('#')[0] + '#register/' + id, title = (C.brand || '') + ' – ' + teacherOf(w).name + ' · ' + dateShort(w.date);
    if (navigator.share) { navigator.share({ title: title, text: title, url: url }).catch(function () {}); return; }
    var done = function () { toast('Link copied', 'good'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { toast(url); });
    else toast(url);
  }

  /* ---------------- register ---------------- */
  var reg = { ws: null, picked: {}, promo: null, step: 1, busy: false };

  function pricing() {
    var w = reg.ws, sub = 0, n = 0, picked = [];
    if (w) w.classes.forEach(function (c) { if (reg.picked[c.id]) { sub += c.price; n++; picked.push(c); } });
    var bundle = (w && w.bundle && n >= w.bundle.min) ? Math.min(sub, w.bundle.off) : 0;
    var after = sub - bundle, promo = 0;
    if (reg.promo && n) promo = reg.promo.type === 'percent' ? Math.round(after * reg.promo.value / 100) : Math.min(after, reg.promo.value);
    return { picked: picked, n: n, sub: sub, bundle: bundle, promo: promo, total: Math.max(0, after - promo) };
  }
  function renderTotals() {
    var p = pricing(), w = reg.ws, html = '';
    p.picked.forEach(function (c) { html += '<div><dt>' + esc(c.name) + '</dt><dd>' + rupee(c.price) + '</dd></div>'; });
    if (p.bundle) html += '<div class="disc"><dt>Bundle discount</dt><dd>−' + rupee(p.bundle) + '</dd></div>';
    if (p.promo) html += '<div class="disc"><dt>Promo ' + esc(reg.promo.code) + '</dt><dd>−' + rupee(p.promo) + '</dd></div>';
    $('sumList').innerHTML = html;
    $('sumTotal').textContent = rupee(p.total); $('barTotal').textContent = rupee(p.total);
    var hint = 'Select at least one class to see your total.';
    if (p.n) {
      hint = '';
      if (w && w.bundle && w.bundle.off && p.n < w.bundle.min) {
        var more = w.bundle.min - p.n;
        hint = 'Add ' + more + ' more class' + (more > 1 ? 'es' : '') + ' to save ' + rupee(w.bundle.off) + '.';
      }
    }
    $('sumHint').textContent = hint;
  }
  function renderClasses() {
    var w = reg.ws; if (!w) return;
    $('classList').innerHTML = w.classes.map(function (c) {
      var gone = c.left === 0, low = c.left != null && c.left > 0 && c.left <= 5;
      return '<label class="opt"><input type="checkbox" value="' + esc(c.id) + '"' + (reg.picked[c.id] && !gone ? ' checked' : '') + (gone ? ' disabled' : '') + '>' +
        '<span class="t"><b>' + esc(c.name) + '</b><small>' + IC.clock + esc(c.time) + '</small></span>' +
        '<span class="pr">' + (gone ? 'Sold out' : rupee(c.price) + (low ? '<small>' + c.left + ' left</small>' : '')) + '</span></label>';
    }).join('');
    renderTotals();
  }
  function selectWorkshop(id, push, keep) {
    var w = wsById(id); if (!w) return;
    if (!keep && (!reg.ws || reg.ws.id !== w.id)) { reg.picked = {}; reg.promo = null; $('promoMsg').textContent = ''; $('promoMsg').className = 'hint'; $('rPromo').value = ''; }
    reg.ws = w; $('rWs').value = w.id;
    var t = teacherOf(w);
    $('rTitle').innerHTML = esc(t.name) + ' <i>' + esc(w.tag) + '</i>';
    $('rMeta').innerHTML = '<span>' + IC.cal + esc(dateLong(w.date)) + '</span><span>' + IC.pin + esc(w.venue ? w.venue + ', ' + w.city : w.city) + '</span>';
    if (push) history.replaceState(null, '', '#register/' + w.id);
    renderClasses();
  }
  function setStep(n) {
    reg.step = n;
    $('s1').classList.toggle('hide', n !== 1); $('s2').classList.toggle('hide', n !== 2);
    $('st2').classList.toggle('on', n === 2);
    $('barBtn').textContent = n === 1 ? 'Continue to payment' : 'Create my ticket';
    var top = $('st1'); if (top && top.scrollIntoView) top.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function initRegister(wid) {
    var list = upcoming(), sel = $('rWs');
    if (!list.length) {
      $('rTitle').textContent = 'No open workshops'; $('rMeta').textContent = '';
      $('classList').innerHTML = '<p class="muted">There are no upcoming workshops right now. Message us on WhatsApp and we’ll tell you when the next one opens.</p>';
      $('sumList').innerHTML = ''; $('wsPickWrap').classList.add('hide'); return;
    }
    sel.innerHTML = list.map(function (w) { return '<option value="' + esc(w.id) + '">' + esc(teacherOf(w).name + ' · ' + dateShort(w.date) + ' · ' + w.city) + '</option>'; }).join('');
    $('wsPickWrap').classList.toggle('hide', list.length < 2);
    var target = list.filter(function (w) { return w.id === wid; })[0] || (reg.ws && list.filter(function (w) { return w.id === reg.ws.id; })[0]) || list[0];
    var same = !!(reg.ws && reg.ws.id === target.id);
    selectWorkshop(target.id, !wid || wid !== target.id, same);
    if (reg.step !== 1 && !reg.busy) setStep(1);
    var prof = store.get('rr_profile', null);
    if (prof && !$('rName').value) { $('rName').value = prof.name || ''; $('rEmail').value = prof.email || ''; $('rPhone').value = prof.phone || ''; $('rAge').value = prof.age || ''; }
  }
  function validate1() {
    var p = pricing(), name = $('rName').value.trim(), phone = normPhone($('rPhone').value), email = $('rEmail').value.trim();
    if (!p.n) return 'Please choose at least one class.';
    if (name.length < 2) return 'Please enter your full name.';
    if (phone.length !== 10) return 'Please enter a valid 10 digit WhatsApp number.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'That email address doesn’t look right.';
    return '';
  }
  function upiLink(total) {
    var note = ((C.brand || '') + ' ' + teacherOf(reg.ws).name).slice(0, 40);
    return 'upi://pay?pa=' + encodeURIComponent(C.payment.upiId || '') + '&pn=' + encodeURIComponent(C.payment.upiName || C.brand || '') + '&am=' + total.toFixed(2) + '&cu=INR&tn=' + encodeURIComponent(note);
  }
  function renderPay() {
    var p = pricing(), free = p.total === 0;
    $('upiId').textContent = C.payment.upiId || '';
    $('upiPay').href = upiLink(p.total); $('upiPay').hidden = free;
    var q = $('qr'); q.innerHTML = '';
    if (!free && window.QRCode) { try { new QRCode(q, { text: upiLink(p.total), width: 170, height: 170, correctLevel: QRCode.CorrectLevel.M }); } catch (e) {} }
    $('qr').parentNode.hidden = free || !window.QRCode;
    $('rUtr').closest('.f').hidden = free;
    $('s2').querySelector('.pay-side .muted').textContent = free ? 'Your total is ₹0, so no payment is needed. Just confirm below.' : 'Pay the exact total of ' + rupee(p.total) + ', then enter the UTR from your UPI app.';
  }
  function applyPromo() {
    var code = $('rPromo').value.trim().toUpperCase(), msg = $('promoMsg');
    if (!code) { msg.textContent = 'Enter a code first.'; msg.className = 'hint bad'; return; }
    var done = function (pr) {
      reg.promo = { code: code, type: pr.type === 'percent' ? 'percent' : 'flat', value: +pr.value || 0 };
      var p = pricing(); msg.textContent = code + ' applied. You save ' + rupee(p.promo) + '.'; msg.className = 'hint ok';
      renderTotals(); renderPay();
    };
    var bad = function (t) { reg.promo = null; msg.textContent = t || 'That code isn’t valid.'; msg.className = 'hint bad'; renderTotals(); renderPay(); };
    if (!SHEET) {
      var hit = (C.promoCodes || []).filter(function (x) { return String(x.code).toUpperCase() === code; })[0];
      return hit ? done(hit) : bad();
    }
    msg.textContent = 'Checking…'; msg.className = 'hint';
    sheetGet({ action: 'promo', code: code, workshop: reg.ws.id }).then(function (j) { j && j.ok ? done(j) : bad(j && j.error); }, function () { bad('Couldn’t check the code. Try again.'); });
  }
  function submitReg() {
    if (reg.busy) return;
    var e2 = $('e2'); e2.textContent = '';
    var err1 = validate1(); if (err1) { setStep(1); $('e1').textContent = err1; return; }
    var p = pricing(), utr = $('rUtr').value.replace(/\s/g, '');
    if (p.total > 0 && !/^[A-Za-z0-9]{10,22}$/.test(utr)) { e2.textContent = 'Please enter the UTR / transaction ID from your UPI app (12 digits).'; return; }
    if (!$('rPolicy').checked) { e2.textContent = 'Please tick the non-refundable box to continue.'; return; }
    var phone = normPhone($('rPhone').value);
    var payload = {
      action: 'register', workshopId: reg.ws.id, classIds: p.picked.map(function (c) { return c.id; }),
      promo: reg.promo ? reg.promo.code : '', name: $('rName').value.trim(), email: $('rEmail').value.trim(), phone: phone,
      age: $('rAge').value, level: $('rLevel').value, note: $('rNote').value.trim(), utr: utr, hp: $('rHp').value
    };
    store.set('rr_profile', { name: payload.name, email: payload.email, phone: payload.phone, age: payload.age });
    reg.busy = true;
    var btns = [$('submit'), $('barBtn')], labels = btns.map(function (b) { return b.innerHTML; });
    btns.forEach(function (b) { b.disabled = true; b.innerHTML = '<span class="spin" aria-hidden="true"></span> Creating ticket…'; });
    var finish = function () { reg.busy = false; btns.forEach(function (b, i) { b.disabled = false; b.innerHTML = labels[i]; }); };
    var ok = function (id) {
      finish(); store.set('rr_last', { id: id, p: phone.slice(-4) });
      reg.picked = {}; reg.promo = null; reg.ws = null; $('rUtr').value = ''; $('rPolicy').checked = false; setStep(1);
      toast('Ticket created', 'good'); location.hash = '#ticket/' + id + '.' + phone.slice(-4);
    };
    var fail = function (t) { finish(); e2.textContent = t || 'Something went wrong. Please try again.'; };
    if (!SHEET) {
      var tk = demoTickets(), dup = Object.keys(tk).some(function (k) { return payload.utr && tk[k].utr === payload.utr; });
      if (dup) return fail('This UTR has already been used.');
      var id = (C.idPrefix || 'RR') + '-' + rand(6), t = teacherOf(reg.ws);
      tk[id] = {
        id: id, status: 'Pending', name: payload.name, email: payload.email, phone: phone, workshopId: reg.ws.id, teacher: t.name, tag: reg.ws.tag,
        date: reg.ws.date, city: reg.ws.city, venue: reg.ws.venue, mapLink: reg.ws.mapLink, groupLink: '', classIds: payload.classIds, utr: payload.utr,
        classes: p.picked.map(function (c) { return { name: c.name, time: c.time, price: c.price }; }), total: p.total, discount: p.bundle + p.promo, promo: payload.promo
      };
      store.set('rr_tickets', tk);
      setTimeout(function () { ok(id); }, 500);
      return;
    }
    sheetPost(payload).then(function (j) {
      if (j && j.ok && j.ticket) ok(j.ticket.id); else fail(j && j.error);
    }, function () { fail('Couldn’t reach the server. Check your internet and try again (don’t pay twice).'); });
  }

  /* ---------------- ticket ---------------- */
  function getTicket(id, p4) {
    id = String(id || '').trim().toUpperCase(); p4 = String(p4 || '').trim();
    if (!SHEET) {
      var t = demoTickets()[id];
      return Promise.resolve(t && String(t.phone).slice(-4) === p4 ? { ok: true, ticket: t } : { ok: false, error: 'No ticket found. Check the ID and last 4 digits.' });
    }
    return sheetGet({ action: 'ticket', id: id, p: p4 });
  }
  function icsDate(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00'; }
  function downloadIcs(t) {
    var cls = (t.classes || []).slice().sort(function (a, b) { return timeMins(a.time) - timeMins(b.time); });
    if (!cls.length || !parseDate(t.date)) return;
    var s = parseDate(t.date); s.setMinutes(timeMins(cls[0].time));
    var e = parseDate(t.date); e.setMinutes(timeMins(cls[cls.length - 1].time) + 120);
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + (C.brand || 'Workshop') + '//EN', 'BEGIN:VEVENT', 'UID:' + t.id + '@workshop',
      'DTSTAMP:' + icsDate(new Date()), 'DTSTART:' + icsDate(s), 'DTEND:' + icsDate(e),
      'SUMMARY:' + (C.brand || '') + ' - ' + (t.teacher || 'Workshop'), 'LOCATION:' + [t.venue, t.city].filter(Boolean).join(', ').replace(/,/g, '\\,'),
      'DESCRIPTION:' + cls.map(function (c) { return c.name + ' (' + c.time + ')'; }).join('\\n') + '\\nTicket ' + t.id, 'END:VEVENT', 'END:VCALENDAR'];
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = t.id + '.ics'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function renderTicket(t, p4) {
    var key = String(t.status || 'Pending').toLowerCase();
    var label = { pending: 'Payment under review', verified: 'Confirmed', rejected: 'Payment issue' }[key] || t.status;
    var note = {
      pending: 'We verify payments within a few hours. Refresh this page to see the update. You can also send your payment screenshot on WhatsApp to speed it up.',
      verified: 'You’re in! Show this ticket at the venue. Join the WhatsApp group below for timings and updates.',
      rejected: 'We couldn’t match your payment. Please WhatsApp us your payment screenshot and we’ll sort it out.'
    }[key] || '';
    var out = $('ticketOut');
    var rows = '<div><dt>Name</dt><dd>' + esc(t.name) + '</dd></div>' +
      '<div><dt>Date</dt><dd>' + esc(dateLong(t.date)) + '</dd></div>' +
      '<div><dt>Venue</dt><dd>' + esc([t.venue, t.city].filter(Boolean).join(', ')) + '</dd></div>' +
      '<div><dt>Classes</dt><dd>' + (t.classes || []).map(function (c) { return esc(c.name) + ' · ' + esc(c.time); }).join('<br>') + '</dd></div>' +
      (t.discount ? '<div><dt>Discount</dt><dd>−' + rupee(t.discount) + '</dd></div>' : '') +
      '<div><dt>Total</dt><dd>' + rupee(t.total || 0) + '</dd></div>';
    var btns = '';
    if (key === 'verified' && t.groupLink) btns += '<a class="btn btn-accent" href="' + esc(t.groupLink) + '" target="_blank" rel="noopener">Join WhatsApp group</a>';
    if (key !== 'verified') btns += '<a class="btn btn-accent" href="' + esc(waLink('Hi! My ticket ' + t.id + ' payment screenshot is attached.')) + '" target="_blank" rel="noopener">Send proof on WhatsApp</a>';
    if (key !== 'rejected') btns += '<button class="btn btn-ghost" type="button" id="icsBtn">Add to calendar</button>';
    if (t.mapLink) btns += '<a class="btn btn-ghost" href="' + esc(t.mapLink) + '" target="_blank" rel="noopener">Directions</a>';
    btns += '<button class="btn btn-ghost" type="button" id="refreshTicket">Refresh status</button><button class="btn btn-ghost" type="button" id="printTicket">Print</button>';
    out.innerHTML = '<div class="ticket"><div class="t-top"><span class="status st-' + esc(key) + '">' + esc(label) + '</span><div class="t-qr" id="tQr"></div></div>' +
      '<h2>' + esc(t.teacher || 'Workshop') + '</h2><div class="t-id">' + esc(t.id) + '</div><dl>' + rows + '</dl><p class="t-note">' + esc(note) + '</p>' +
      '<div class="actions no-print" style="margin-top:20px">' + btns + '</div></div>';
    if (window.QRCode) { try { new QRCode($('tQr'), { text: t.id, width: 80, height: 80, correctLevel: QRCode.CorrectLevel.M }); } catch (e) {} }
    $('icsBtn') && $('icsBtn').addEventListener('click', function () { downloadIcs(t); });
    $('printTicket').addEventListener('click', function () { window.print(); });
    $('refreshTicket').addEventListener('click', function () { lookup(t.id, p4, true); });
  }
  function lookup(id, p4, quiet) {
    $('te').textContent = '';
    if (!id || !/^\d{4}$/.test(p4 || '')) { $('te').textContent = 'Enter your ticket ID and the last 4 digits of your phone.'; return; }
    var btn = $('findTicket'); btn.disabled = true;
    getTicket(id, p4).then(function (j) {
      btn.disabled = false;
      if (j && j.ok && j.ticket) { renderTicket(j.ticket, p4); if (quiet) toast('Status updated', 'good'); }
      else { $('ticketOut').innerHTML = ''; $('te').textContent = (j && j.error) || 'No ticket found.'; }
    }, function () { btn.disabled = false; $('te').textContent = 'Couldn’t reach the server. Please try again.'; });
  }

  /* ---------------- routing ---------------- */
  var curView = '';
  function route() {
    var parts = location.hash.replace(/^#/, '').split('/'), base = parts[0] || 'top';
    var view = base === 'register' ? 'register' : base === 'ticket' ? 'ticket' : 'home';
    var changed = view !== curView; curView = view;
    ['home', 'register', 'ticket'].forEach(function (v) { $('v-' + v).classList.toggle('on', v === view); });
    document.body.setAttribute('data-view', view);
    $('links').classList.remove('open'); $('menuBtn').setAttribute('aria-expanded', 'false');
    if (view === 'home') {
      var el = base === 'top' ? null : $(base);
      if (el && !el.hidden) setTimeout(function () { el.scrollIntoView({ behavior: changed ? 'auto' : 'smooth', block: 'start' }); }, 30);
      else if (changed || location.hash === '#top') window.scrollTo(0, 0);
      return;
    }
    if (changed) window.scrollTo(0, 0);
    if (view === 'register') {
      if (!DATA.ready) return;
      initRegister(parts[1]);
      if (SHEET && Date.now() - DATA.at > 30000) loadData().then(function () { if (curView === 'register' && !reg.busy) initRegister(reg.ws && reg.ws.id); }, function () {});
    } else {
      var sp = (parts[1] || '').split('.');
      if (sp[0]) { $('tId').value = sp[0]; $('tPhone').value = sp[1] || ''; if (/^\d{4}$/.test(sp[1] || '')) lookup(sp[0], sp[1]); }
      else { var last = store.get('rr_last', null); if (last && !$('tId').value) { $('tId').value = last.id; $('tPhone').value = last.p; } }
    }
  }

  /* ---------------- init ---------------- */
  function init() {
    applyAccent(); setTheme(document.documentElement.getAttribute('data-theme') || 'dark', false);
    renderStatic(); observeReveal();

    // theme + menu
    $('themeBtn').addEventListener('click', function () { setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light', true); });
    $('menuBtn').addEventListener('click', function () {
      var o = $('links').classList.toggle('open'); $('menuBtn').setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { $('links').classList.remove('open'); $('menuBtn').setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) { $('links').classList.remove('open'); $('menuBtn').setAttribute('aria-expanded', 'false'); }
    });

    // glow tracking (mouse) + touch flash
    var setPos = function (g, e) { var r = g.getBoundingClientRect(); g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px'); };
    document.addEventListener('pointermove', function (e) { var g = e.target.closest && e.target.closest('.glow'); if (g) setPos(g, e); }, { passive: true });
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      var g = e.target.closest && e.target.closest('.glow'); if (!g) return;
      setPos(g, e); g.classList.add('lit'); clearTimeout(g._t); g._t = setTimeout(function () { g.classList.remove('lit'); }, 750);
    }, { passive: true });
    document.addEventListener('pointercancel', function (e) { var g = e.target.closest && e.target.closest('.glow'); if (g) g.classList.remove('lit'); }, { passive: true });

    // delegated clicks
    document.addEventListener('click', function (e) {
      var t = e.target;
      var sh = t.closest('[data-share]'); if (sh) { e.preventDefault(); shareWs(sh.getAttribute('data-share')); return; }
      var tn = t.closest('[data-teacher]'); if (tn) { openTeacher(tn.getAttribute('data-teacher')); return; }
      var tc = t.closest('[data-t]'); if (tc && !tc._dragged) { openTeacher(tc.getAttribute('data-t')); return; }
      var lb = t.closest('[data-lb]'); if (lb) { $('lbImg').src = lb.getAttribute('data-lb'); openDlg($('lbDlg')); return; }
      if (t.closest('[data-close]')) closeDlg($('tDlg'));
      if (t.id === 'retryLoad') boot(true);
    });
    $('tClose').addEventListener('click', function () { closeDlg($('tDlg')); });
    $('lbClose').addEventListener('click', function () { closeDlg($('lbDlg')); });
    ['tDlg', 'lbDlg'].forEach(function (id) { $(id).addEventListener('click', function (e) { if (e.target === this) closeDlg(this); }); });

    // teachers rail
    var rail = $('rail');
    $('prev').addEventListener('click', function () { rail.scrollBy({ left: -rail.clientWidth * .8, behavior: 'smooth' }); });
    $('next').addEventListener('click', function () { rail.scrollBy({ left: rail.clientWidth * .8, behavior: 'smooth' }); });
    var dn = false, sx = 0, sl = 0, moved = 0;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; dn = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; });
    window.addEventListener('pointermove', function (e) {
      if (!dn) return; var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) { rail.classList.add('drag'); rail.scrollLeft = sl - dx; }
    });
    window.addEventListener('pointerup', function () {
      if (!dn) return; dn = false; rail.classList.remove('drag');
      if (moved > 5) { $$('.tc', rail).forEach(function (c) { c._dragged = true; }); setTimeout(function () { $$('.tc', rail).forEach(function (c) { c._dragged = false; }); }, 60); }
    });

    // next pill
    $('nextPill').addEventListener('click', function () { location.hash = '#register/' + this.getAttribute('data-id'); });

    // register events
    $('rWs').addEventListener('change', function () { selectWorkshop(this.value, true); });
    $('classList').addEventListener('change', function (e) {
      if (e.target.type !== 'checkbox') return;
      reg.picked[e.target.value] = e.target.checked; renderTotals(); $('e1').textContent = '';
    });
    $('to2').addEventListener('click', function () {
      var err = validate1(); $('e1').textContent = err; if (err) return;
      renderPay(); setStep(2);
    });
    $('back1').addEventListener('click', function () { setStep(1); });
    $('applyPromo').addEventListener('click', applyPromo);
    $('rPromo').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } });
    $('copyUpi').addEventListener('click', function () {
      var v = C.payment.upiId || '';
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(function () { toast('UPI ID copied', 'good'); }, function () { toast(v); }); else toast(v);
    });
    $('rUtr').addEventListener('input', function () { this.value = this.value.replace(/\s/g, ''); });
    $('submit').addEventListener('click', submitReg);
    $('barBtn').addEventListener('click', function () { (reg.step === 1 ? $('to2') : $('submit')).click(); });
    $('findTicket').addEventListener('click', function () { var id = $('tId').value.trim().toUpperCase(), p = $('tPhone').value.trim(); if (id) history.replaceState(null, '', '#ticket/' + id + '.' + p); lookup(id, p); });
    $('tPhone').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('findTicket').click(); });
    window.addEventListener('hashchange', route);

    // analytics
    if (C.analyticsId) {
      var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.analyticsId); document.head.appendChild(g);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', C.analyticsId);
    }

    route();
    boot(false);
    setInterval(function () { if (DATA.ready) renderPill(); }, 60000);
  }

  var firstBoot = true, t0 = Date.now();
  function hideLoader() {
    var seen = false; try { seen = !!sessionStorage.getItem('rr_seen'); sessionStorage.setItem('rr_seen', '1'); } catch (e) {}
    var wait = Math.max(0, (seen ? 150 : 900) - (Date.now() - t0));
    setTimeout(function () { $('loader').classList.add('done'); }, wait);
  }
  function boot(retry) {
    if (retry) $('wsGrid').innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
    var failTimer = setTimeout(function () { if (firstBoot) { firstBoot = false; hideLoader(); } }, 6000);
    loadData().then(function () {
      renderWorkshops(); renderTeachers(); renderPill(); injectJsonLd(); route();
    }, function () { renderLoadError(); }).then(function () {
      clearTimeout(failTimer); if (firstBoot) { firstBoot = false; hideLoader(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
