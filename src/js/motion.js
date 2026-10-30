/* Privacy AI Studio — capa de movimiento.
   Todo corre sobre transform/opacity en un solo requestAnimationFrame (a la frecuencia de la pantalla: 60 fps o más).
   Con "reducir movimiento" activado en el sistema, nada de esto se ejecuta y la página queda estática y completa. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var html = document.documentElement, body = document.body;
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ── Títulos: entran palabra por palabra (máscara) ── */
  function splitWords(el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          var inChrome = n.parentNode.classList && n.parentNode.classList.contains('chrome');
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('span'); i.className = inChrome ? 'wi chrome' : 'wi'; i.textContent = p;
            w.appendChild(i); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !/^(SVG|BR|IMG)$/i.test(n.tagName)) walk(n);
      });
    };
    walk(el);
    $$('.chrome', el).forEach(function (c) { if (!c.classList.contains('wi')) c.classList.remove('chrome'); });
    // cada idioma numera sus palabras desde cero, para que el escalonado sea igual en ES y EN
    var groups = $$('.l-es, .l-en', el); if (!groups.length) groups = [el];
    groups.forEach(function (g) { $$('.wi', g).forEach(function (w, k) { w.style.setProperty('--i', k); }); });
    el.classList.add('split');
  }

  if (REDUCED) { body.classList.add('still'); return; }
  body.classList.add('motion');
  $$('.h2, .contact-big').forEach(splitWords);

  /* ── Barra de progreso de lectura ── */
  var sprog = $('#sprog i');

  /* ── Hero: parallax con el puntero y con el scroll ── */
  var hero = $('#hero'), heroBg = $('.hero-bg'), heroIn = $('.hero-inner'), redact = $('.redact');
  var mx = 0, my = 0, tx = 0, ty = 0;
  if (FINE) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
      kick();
    });
    hero.addEventListener('pointerleave', function () { tx = ty = 0; kick(); });
  }

  /* ── Formas cromadas: flotan, giran y se desplazan con el scroll ── */
  var decos = $$('.deco').map(function (el, k) {
    return { el: el, sp: [0.18, -0.14, 0.22, -0.2][k % 4], rot: [14, -18, 22, -12][k % 4] };
  });

  /* ── Flujo: el recorrido se ilumina a medida que se baja ── */
  var flowSec = $('#flujo'), flow = $('.flow'), fnodes = $$('.fnode');
  if (flow) {
    var fill = document.createElement('li'); fill.className = 'flow-fill'; fill.setAttribute('aria-hidden', 'true');
    flow.appendChild(fill);
  }

  /* ── Marquesina: se acelera y se inclina según la velocidad del scroll ── */
  var mq = $('.mq-track'), mqX = 0, vel = 0, lastY = window.pageYOffset;
  var mqOn = false;
  if (mq && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { mqOn = es[0].isIntersecting; if (mqOn) kick(); }).observe(mq.parentNode);

  /* ── Bucle único ── */
  var dirty = true, running = false;
  function kick() { dirty = true; if (!running) { running = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);

  function frame(ts) {
    var y = window.pageYOffset, vh = window.innerHeight, docH = document.documentElement.scrollHeight - vh;
    var dy = y - lastY; lastY = y;
    vel = lerp(vel, dy, 0.18);
    if (sprog) sprog.style.transform = 'scaleX(' + (docH > 0 ? clamp(y / docH, 0, 1) : 0) + ')';

    // hero
    mx = lerp(mx, tx, 0.08); my = lerp(my, ty, 0.08);
    var hh = hero.offsetHeight, hp = clamp(y / hh, 0, 1);
    if (y < hh * 1.1) {
      heroBg.style.translate = (mx * -22) + 'px ' + (my * -14 + y * 0.18) + 'px';
      heroBg.style.scale = String(1.06 + hp * 0.08);
      heroIn.style.translate = '0 ' + (y * -0.12) + 'px';
      heroIn.style.opacity = String(clamp(1 - hp * 1.35, 0, 1));
      if (redact) { redact.style.translate = (mx * 26) + 'px ' + (my * 18 + y * -0.08) + 'px'; redact.style.opacity = String(clamp(1 - hp * 1.6, 0, 1)); }
    }

    // formas cromadas
    decos.forEach(function (d) {
      var r = d.el.parentNode.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var p = (vh - r.top) / (vh + r.height); // 0 al entrar, 1 al salir
      d.el.style.translate = '0 ' + ((p - 0.5) * r.height * d.sp) + 'px';
      d.el.style.rotate = ((p - 0.5) * d.rot) + 'deg';
    });

    // flujo
    if (flow) {
      var fr = flowSec.getBoundingClientRect();
      var fp = clamp((vh * 0.78 - fr.top) / (fr.height * 0.62), 0, 1);
      flow.style.setProperty('--fp', fp.toFixed(4));
      fnodes.forEach(function (n, k) { n.classList.toggle('act', fp > (k + 0.35) / 3.2); });
    }

    // marquesina
    if (mq && mqOn) {
      mqX -= 0.55 + Math.min(Math.abs(vel) * 0.35, 14);
      var half = mq.scrollWidth / 2; if (half && -mqX > half) mqX += half;
      mq.style.transform = 'translate3d(' + mqX + 'px,0,0) skewX(' + clamp(-vel * 0.25, -10, 10) + 'deg)';
    }

    var still = Math.abs(mx - tx) < 0.001 && Math.abs(my - ty) < 0.001 && Math.abs(vel) < 0.05;
    if (mqOn || !still) requestAnimationFrame(frame); else running = false;
    dirty = false;
  }
  kick();

  /* ── Vidrio: luz que sigue al puntero + leve inclinación 3D ── */
  if (FINE) {
    $$('.glass').forEach(function (g) {
      var tilt = g.matches('.card, .kpi, .stages li, .fnode, .io-col, .anymodel');
      g.addEventListener('pointermove', function (e) {
        var r = g.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        g.style.setProperty('--mx', (px * 100) + '%'); g.style.setProperty('--my', (py * 100) + '%');
        if (tilt) { g.style.setProperty('--rx', ((0.5 - py) * 5).toFixed(2) + 'deg'); g.style.setProperty('--ry', ((px - 0.5) * 6).toFixed(2) + 'deg'); }
      });
      g.addEventListener('pointerenter', function () { g.classList.add('lit'); if (tilt) g.classList.add('tilting'); });
      g.addEventListener('pointerleave', function () { g.classList.remove('lit'); g.style.setProperty('--rx', '0deg'); g.style.setProperty('--ry', '0deg'); });
    });

    /* botones magnéticos */
    $$('.hero-cta .btn, .hdr-cta, .fsend, .pz .btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.18) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px';
      });
      b.addEventListener('pointerleave', function () { b.style.translate = '0 0'; });
    });
  }

  /* ── Hero: datos que se anonimizan solos ── */
  var rks = $$('.rk');
  if (rks.length) {
    var ri = 0;
    setTimeout(function step() {
      var el = rks[ri % rks.length]; ri++;
      if (!el.dataset.orig) el.dataset.orig = el.textContent;
      el.classList.add('scan');
      setTimeout(function () {
        el.textContent = el.dataset[html.lang === 'en' ? 'en' : 'es']; el.classList.add('masked'); el.classList.remove('scan');
      }, 650);
      setTimeout(function () { el.classList.remove('masked'); el.textContent = el.dataset.orig; }, 650 + 4200);
      setTimeout(step, 1100);
    }, 1600);
    rks.forEach(function (el, k) { el.style.setProperty('--k', k); });
  }

  /* ── Registro de auditoría "en vivo" bajo el flujo ── */
  var live = $('.rail-live');
  if (live) {
    var FILES = ['acta_comparecencia.pdf', 'audiencia_0312.mp4', 'legajo_4471.docx', 'resolucion_118.odt', 'entrevista_rrhh.m4a'];
    var MODELS = ['GPT', 'Claude', 'Gemini', 'Mistral', 'Local'];
    var USERS = ['analista.03', 'juzgado.civil.12', 'rrhh.admin', 'mesa.entradas', 'compliance.02'];
    var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    setInterval(function () {
      if (document.hidden) return;
      var d = new Date();
      live.classList.remove('on'); void live.offsetWidth;
      live.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' · ' + pick(USERS) + ' · ' + pick(FILES) + ' · ' + pick(MODELS) + ' · ' + (180 + Math.floor(Math.random() * 640)) + ' tokens';
      live.classList.add('on');
    }, 2600);
  }

  /* ── Demos: arrancan solas al aparecer (hasta que la persona toque algo) ── */
  function auto(el, run) {
    if (!el || !('IntersectionObserver' in window)) return;
    var stopped = false, started = false;
    el.addEventListener('pointerdown', function (e) { if (e.isTrusted) stopped = true; }, true);
    el.addEventListener('keydown', function (e) { if (e.isTrusted) stopped = true; }, true);
    new IntersectionObserver(function (es, ob) {
      if (es[0].isIntersecting && !started) { started = true; ob.disconnect(); run(function () { return stopped; }); }
    }, { threshold: 0.55 }).observe(el);
  }
  // 01 · original → anonimizado → ofuscado → anonimizado → validación humana
  auto($('#anon-demo'), function (isStopped) {
    var seq = ['anon', 'obf', 'anon'], k = 0, d = $('#anon-demo');
    (function next() {
      if (isStopped()) return;
      if (k < seq.length) { $('.seg button[data-v="' + seq[k++] + '"]', d).click(); setTimeout(next, 2300); }
      else $('#anon-validate').click();
    })();
  });
  // 02 · reproduce la audiencia
  auto($('#tr-demo'), function (isStopped) { setTimeout(function () { if (!isStopped()) $('#tr-demo .pbtn').click(); }, 500); });
  // 03 · ejecuta un prompt-clic
  auto($('#chat-demo'), function (isStopped) { setTimeout(function () { if (!isStopped()) $('#chat-demo .pclic button[data-p="1"]').click(); }, 700); });

  /* ── Tarjetas: aparecen en cascada aunque estén en la misma fila ── */
  $$('.grid3, .kpis, .stages, .sp-steps, .flow, .feats, .awards').forEach(function (g) {
    $$(':scope > *', g).forEach(function (c, k) { c.style.setProperty('--stg', k); });
  });
})();
