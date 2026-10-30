/* Privacy AI Studio · by Puzzle AI — comportamiento de la página.
   Idioma, menú, descargas, demos de los tres módulos, sectores, KPIs, índice lateral y formulario. */
(function () {
  'use strict';
  var html = document.documentElement, body = document.body;
  html.classList.remove('no-js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = function (k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  };
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DL = /*data:dl*/;

  /* ───────── Idioma ───────── */
  var META = {
    es: { title: 'Privacy AI Studio · IA generativa con datos confidenciales protegidos | by Puzzle AI',
          desc: 'Privacy AI Studio, de Puzzle AI: plataforma on-premise para anonimizar documentos, transcribir audio y video y usar IA generativa con datos confidenciales. Trazable y auditable. Para Poder Judicial, organismos públicos y RRHH.',
          ph: 'Elegí una opción' },
    en: { title: 'Privacy AI Studio · Generative AI with protected confidential data | by Puzzle AI',
          desc: 'Privacy AI Studio, by Puzzle AI: an on-premise platform to anonymize documents, transcribe audio and video and use generative AI with confidential data. Traceable and auditable. For the judiciary, public sector and HR.',
          ph: 'Choose an option' }
  };
  var langsel = $('#langsel'), langbtn = $('#langbtn');
  $$('option[data-en]').forEach(function (o) { o.dataset.es = o.textContent; });
  function setLang(lang, save) {
    if (lang !== 'es' && lang !== 'en') lang = 'es';
    html.lang = lang;
    body.classList.toggle('en', lang === 'en');
    document.title = META[lang].title;
    var md = $('meta[name="description"]'); if (md) md.setAttribute('content', META[lang].desc);
    $$('option[data-en]').forEach(function (o) { o.textContent = o.dataset[lang]; });
    $$('option.ph').forEach(function (o) { o.textContent = META[lang].ph; });
    $$('.lang-menu button').forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.lang === lang)); });
    if (save) store('privacy-lang', lang);
  }
  var q = (location.search.match(/[?&]lang=(es|en)/) || [])[1];
  setLang(q || store('privacy-lang') || ((navigator.language || 'es').slice(0, 2) === 'en' ? 'en' : 'es'));
  function closeLang() { langsel.classList.remove('open'); langbtn.setAttribute('aria-expanded', 'false'); }
  langbtn.addEventListener('click', function (e) {
    e.stopPropagation(); closeMenus();
    var o = langsel.classList.toggle('open'); langbtn.setAttribute('aria-expanded', String(o));
  });
  $$('.lang-menu button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang, true); closeLang(); });
  });

  /* ───────── Carga ───────── */
  var readyDone = false;
  function ready() { if (readyDone) return; readyDone = true; body.classList.add('ready'); }
  if (document.readyState === 'complete') setTimeout(ready, 200);
  else window.addEventListener('load', function () { setTimeout(ready, 250); });
  setTimeout(ready, 2600); // nunca dejar la pantalla de carga colgada

  /* ───────── Barra y menús ───────── */
  var hdr = $('#hdr'), hero = $('#hero');
  function onScroll() {
    var y = window.pageYOffset;
    hdr.classList.toggle('scrolled', y > 20);
    body.classList.toggle('scrolled-past', y > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var mis = $$('.mi[data-menu]');
  function closeMenus(except) {
    mis.forEach(function (m) { if (m !== except) { m.classList.remove('open'); $('.tl', m).setAttribute('aria-expanded', 'false'); } });
  }
  var canHover = window.matchMedia && matchMedia('(hover: hover)').matches;
  mis.forEach(function (m) {
    var t = $('.tl', m), timer;
    t.addEventListener('click', function (e) {
      e.stopPropagation(); closeLang();
      var o = !m.classList.contains('open'); closeMenus(m);
      m.classList.toggle('open', o); t.setAttribute('aria-expanded', String(o));
    });
    if (canHover) {
      m.addEventListener('mouseenter', function () { clearTimeout(timer); closeMenus(m); m.classList.add('open'); t.setAttribute('aria-expanded', 'true'); });
      m.addEventListener('mouseleave', function () { timer = setTimeout(function () { m.classList.remove('open'); t.setAttribute('aria-expanded', 'false'); }, 180); });
    }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.mi')) closeMenus();
    if (!e.target.closest('#langsel')) closeLang();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenus(); closeLang(); setMob(false); }
  });
  $$('.panel a').forEach(function (a) { a.addEventListener('click', function () { closeMenus(); }); });

  var mbtn = $('#mbtn');
  function setMob(o) { body.classList.toggle('mopen', o); mbtn.setAttribute('aria-expanded', String(o)); }
  mbtn.addEventListener('click', function () { setMob(!body.classList.contains('mopen')); });
  $$('#mov a').forEach(function (a) { a.addEventListener('click', function () { setMob(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1120) setMob(false); });

  /* ───────── Descargas (cada PDF viaja una sola vez en el HTML) ───────── */
  var blobs = {};
  function dlHref(key) {
    var src = DL[key];
    if (!src) return Promise.reject(new Error('sin archivo ' + key));
    if (src.indexOf('data:') !== 0) return Promise.resolve(src); // modo --dev: ruta al archivo del repo
    if (blobs[key]) return Promise.resolve(blobs[key]);
    var i = src.indexOf(','), bin = atob(src.slice(i + 1)), n = bin.length, u8 = new Uint8Array(n);
    for (var k = 0; k < n; k++) u8[k] = bin.charCodeAt(k);
    blobs[key] = URL.createObjectURL(new Blob([u8], { type: 'application/pdf' }));
    return Promise.resolve(blobs[key]);
  }
  $$('[data-dl]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.dataset.ready) return; // ya tiene su blob: dejar que el navegador descargue
      e.preventDefault();
      dlHref(a.dataset.dl).then(function (url) {
        $$('[data-dl="' + a.dataset.dl + '"]').forEach(function (x) { x.href = url; x.dataset.ready = '1'; });
        a.click();
      });
    });
  });

  /* ───────── Aparición al hacer scroll ───────── */
  var rev = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('in'); });

  /* Video de fondo: pausado si el usuario pidió menos movimiento o si el hero no se ve */
  var vid = $('.hero-bg');
  if (vid) {
    if (REDUCED) { vid.removeAttribute('autoplay'); vid.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var v = es[0].isIntersecting;
        if (v) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause();
      }).observe(hero);
    }
  }

  /* ───────── Módulo 01 · anonimización ───────── */
  var anon = $('#anon-demo');
  if (anon) {
    var segs = $$('.seg button', anon);
    segs.forEach(function (b) {
      b.addEventListener('click', function () {
        anon.dataset.view = b.dataset.v;
        segs.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      });
    });
    $('#anon-validate').addEventListener('click', function () { anon.classList.add('validated'); });
  }

  /* ───────── Módulo 02 · transcripción ───────── */
  var tr = $('#tr-demo');
  if (tr) {
    var wave = $('.wave', tr), BARS = 56, DUR = 30, bars = [];
    for (var b = 0; b < BARS; b++) {
      var h = 18 + Math.round(70 * Math.abs(Math.sin(b * 0.55) * Math.cos(b * 0.21)) + (b % 3) * 4);
      var i = document.createElement('i'); i.style.height = Math.min(h, 100) + '%'; wave.appendChild(i); bars.push(i);
    }
    var lines = $$('.ln', tr), tc = $('#tr-tc'), pbtn = $('.pbtn', tr), cur = 0, playT = null;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    function seek(idx) {
      cur = idx;
      var t = +lines[idx].dataset.t;
      lines.forEach(function (l, k) { l.classList.toggle('on', k === idx); });
      tc.textContent = '00:' + pad(Math.floor(t / 60)) + ':' + pad(t % 60);
      var lim = Math.round(BARS * t / DUR);
      bars.forEach(function (x, k) { x.classList.toggle('on', k < lim); });
    }
    lines.forEach(function (l, k) { l.addEventListener('click', function () { stop(); seek(k); }); });
    function stop() { clearInterval(playT); playT = null; pbtn.classList.remove('on'); }
    pbtn.addEventListener('click', function () {
      if (playT) return stop();
      pbtn.classList.add('on');
      playT = setInterval(function () { if (cur >= lines.length - 1) stop(); else seek(cur + 1); }, 2200);
    });
    seek(0);
  }

  /* ───────── Módulo 03 · chat IA ───────── */
  var chat = $('#chat-demo');
  if (chat) {
    var convo = $('#chat-convo'), alog = $('#alog-body'), model = 'GPT', busy = false;
    var L = function (es, en) { return '<span class="l-es">' + es + '</span><span class="l-en">' + en + '</span>'; };
    var P = [
      { q: ['Resumí el acta en dos líneas.', 'Summarize the record in two lines.'],
        a: ['Comparece [PERSONA_1], con domicilio en [DOMICILIO_1], en el expediente [EXPEDIENTE_1], representada por [PERSONA_2].',
            '[PERSON_1], residing at [ADDRESS_1], appears in case file [CASE_1], represented by [PERSON_2].'] },
      { q: ['Identificá a las partes del documento.', 'Identify the parties in the document.'],
        a: ['Compareciente: [PERSONA_1]. Representante legal: [PERSONA_2]. Causa: [EXPEDIENTE_1]. Ningún dato real fue enviado al modelo.',
            'Appearing party: [PERSON_1]. Legal representative: [PERSON_2]. Case: [CASE_1]. No real data was sent to the model.'] },
      { q: ['Extraé los plazos y fechas relevantes.', 'Extract the relevant deadlines and dates.'],
        a: ['Fecha del acta: 12/03/2026. No se mencionan plazos procesales en el texto analizado.',
            'Record date: 03/12/2026. No procedural deadlines are mentioned in the analyzed text.'] }
    ];
    var mbtns = $$('.models button', chat);
    mbtns.forEach(function (bt) {
      bt.addEventListener('click', function () {
        model = bt.dataset.m;
        mbtns.forEach(function (x) { x.setAttribute('aria-checked', String(x === bt)); });
      });
    });
    function msg(cls, inner) {
      var d = document.createElement('div'); d.className = 'msg ' + cls; d.innerHTML = inner; convo.appendChild(d);
      while (convo.children.length > 4) convo.removeChild(convo.firstElementChild);
      return d;
    }
    function logRow(tokens) {
      var n = new Date(), r = document.createElement('tr');
      var t = [n.getHours(), n.getMinutes(), n.getSeconds()].map(function (x) { return (x < 10 ? '0' : '') + x; }).join(':');
      var name = model === 'Local' ? (html.lang === 'en' ? 'Local' : 'Local') : model;
      r.innerHTML = '<td>' + t + '</td><td>analista.03</td><td>' + name + '</td><td>' + tokens + '</td>';
      alog.insertBefore(r, alog.firstChild);
      while (alog.children.length > 3) alog.removeChild(alog.lastElementChild);
    }
    $$('.pclic button', chat).forEach(function (bt) {
      bt.addEventListener('click', function () {
        if (busy) return; busy = true;
        var p = P[+bt.dataset.p];
        msg('u', L(p.q[0], p.q[1]));
        var ty = msg('a typing', L('Procesando sobre el documento anonimizado…', 'Processing the anonymized document…'));
        setTimeout(function () {
          ty.classList.remove('typing');
          var txt = p.a[html.lang === 'en' ? 1 : 0], n = 0;
          if (REDUCED) n = txt.length;
          (function type() { // la respuesta se escribe como en un chat real
            n = Math.min(txt.length, n + 3);
            ty.textContent = txt.slice(0, n);
            if (n < txt.length) return setTimeout(type, 16);
            ty.innerHTML = L(p.a[0], p.a[1]);
            logRow(280 + Math.floor(Math.random() * 380)); busy = false;
          })();
        }, REDUCED ? 50 : 900);
      });
    });
  }

  /* ───────── Sectores ───────── */
  var tabs = $$('.stabs [role=tab]');
  function setSector(s, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.s === s;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.classList.toggle('on', on);
    });
  }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { setSector(t.dataset.s); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); setSector(tabs[(k + d + tabs.length) % tabs.length].dataset.s, true); }
    });
  });
  setSector('judicial');
  $$('a[data-sector]').forEach(function (a) { a.addEventListener('click', function () { setSector(a.dataset.sector); }); });

  /* ───────── KPIs ───────── */
  var nums = $$('.num[data-to]');
  function count(el) {
    var to = +el.dataset.to, suf = el.dataset.suf || '', t0 = null, D = 1400;
    if (REDUCED) { el.textContent = to + suf; return; }
    function f(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / D), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e) + suf;
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  if ('IntersectionObserver' in window) {
    var ko = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { count(en.target); ko.unobserve(en.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { n.textContent = '0' + (n.dataset.suf || ''); ko.observe(n); });
  }

  /* ───────── Índice lateral ───────── */
  var dots = $$('#dotnav a'), dotnav = $('#dotnav');
  var secs = dots.map(function (d) { return document.querySelector(d.getAttribute('href')); });
  function onDots() {
    var mid = window.innerHeight * 0.45, act = 0;
    secs.forEach(function (s, k) { if (s && s.getBoundingClientRect().top <= mid) act = k; });
    dots.forEach(function (d, k) { d.classList.toggle('on', k === act); });
    var s = secs[act]; dotnav.classList.toggle('on-light', !!(s && s.classList.contains('light')));
  }
  window.addEventListener('scroll', onDots, { passive: true }); onDots();

  /* ───────── Formulario de demo ───────── */
  var form = $('#contact-form');
  if (form) {
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function check(el) {
      var v = (el.value || '').trim(), ok = !el.required || (el.type === 'email' ? EMAIL.test(v) : v !== '');
      var fld = el.closest('.fld'); if (fld) fld.classList.toggle('bad', !ok);
      return ok;
    }
    $$('[required]', form).forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { var f = el.closest('.fld'); if (f && f.classList.contains('bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.classList.remove('done-ok', 'done-ko');
      var bad = $$('[required]', form).filter(function (el) { return !check(el); });
      if (bad.length) { bad[0].focus(); return; }
      if (form.elements._honey.value) return; // bot
      var f = form.elements, sel = f.sector.options[f.sector.selectedIndex];
      var data = {
        _subject: 'Solicitud de demo · Privacy AI Studio · ' + f.organizacion.value.trim(),
        _template: 'table', _captcha: 'false',
        Nombre: f.nombre.value.trim(), 'Organización': f.organizacion.value.trim(), Cargo: f.cargo.value.trim(),
        Sector: sel ? sel.value : '', Email: f.email.value.trim(), 'Teléfono': f.telefono.value.trim(),
        Mensaje: f.mensaje.value.trim(), Idioma: html.lang, Origen: location.href
      };
      form.classList.add('sending');
      var endpoint = form.dataset.endpoint;
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (j) {
          if (j && (j.success === false || j.success === 'false')) throw new Error(j.message || 'error');
          form.classList.add('done-ok'); form.reset(); setLang(html.lang);
        })
        .catch(function () { form.classList.add('done-ko'); })
        .then(function () { form.classList.remove('sending'); });
    });
  }
})();
