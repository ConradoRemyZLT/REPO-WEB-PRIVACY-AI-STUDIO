#!/usr/bin/env node
/*
  Build del sitio Privacy AI Studio · by Puzzle AI (sin dependencias, Node 16+).

    node build.js             -> dist/index.html  (UN solo HTML autocontenido, todo en base64; es lo que se publica)
    node build.js --dev       -> preview.html     (misma página, pero apunta a los archivos del repo; para editar rápido)
    node build.js --index     -> permite indexación en Google (por defecto: noindex, para no competir con privacyaistudio.com)
    node build.js --sin-login -> sin pantalla de login (por defecto lleva el login de Privacy, con los mismos usuarios que ZLT-WEB-V2)

  Marcadores que entiende la plantilla (src/html/index.html):
    <!--css-->  <!--js-->            estilos y script (main.js + motion.js)
    <!--svg:ruta.svg-->             SVG inline (toman el color con currentColor)
    asset:ruta/archivo.ext          recurso del repo -> data URI (o ruta relativa en --dev)
    {{link:clave}}                  valor de links/links.json
    data:dl (entre barra-asterisco) JSON de src/data/dl.json (PDFs descargables; se embeben una sola vez)
    <!--news-->  <!--faqs-->        tarjetas de novedades y preguntas frecuentes, desde src/data/news.json y faqs.json
*/
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DEV = process.argv.includes('--dev');
const INDEX = process.argv.includes('--index');
const LOGIN = !process.argv.includes('--sin-login');
const LIMIT = 30 * 1024 * 1024; // límite de subida de GitHub web

const MIME = {
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf', '.woff2': 'font/woff2'
};
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const cache = new Map();
const used = new Map();
const hits = new Map();

function asset(rel) {
  rel = rel.replace(/^\.?\//, '');
  if (!exists(rel)) throw new Error('Falta el recurso: ' + rel);
  hits.set(rel, (hits.get(rel) || 0) + 1);
  if (DEV) return rel;
  if (!cache.has(rel)) {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    const mime = MIME[path.extname(rel).toLowerCase()] || 'application/octet-stream';
    cache.set(rel, 'data:' + mime + ';base64,' + buf.toString('base64'));
    used.set(rel, buf.length);
  }
  return cache.get(rel);
}

function svgInline(rel) {
  let s = read(rel).replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<!DOCTYPE[\s\S]*?>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  if (!/aria-hidden|role=/.test(s.slice(0, 300))) s = s.replace('<svg', '<svg aria-hidden="true" focusable="false"');
  s = s.replace(/<svg\b[^>]*>/, (tag) => tag.replace(/\s(width|height)="[\d.]+(pt|px)?"/g, '')); // solo en la etiqueta raíz: el tamaño lo da el CSS
  return s;
}

function resolveData(obj) {
  if (Array.isArray(obj)) return obj.map(resolveData);
  if (obj && typeof obj === 'object') {
    const o = {};
    for (const k of Object.keys(obj)) if (!k.startsWith('_')) o[k] = resolveData(obj[k]);
    return o;
  }
  if (typeof obj === 'string' && /^(fotos|videos|brochures|logos|iconos|graficos|premios)\//.test(obj) && exists(obj)) return asset(obj);
  return obj;
}

const links = JSON.parse(read('links/links.json'));
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

let html = read('src/html/index.html');
html = html.replace(/<!--svg:([^>]+?)-->/g, (_, p) => svgInline(p.trim()));
html = html.replace('<!--css-->', () => read('src/css/styles.css'));
html = html.replace('<!--js-->', () => read('src/js/main.js') + '\n' + read('src/js/motion.js')); // comportamiento + capa de movimiento
html = html.replace(/\/\*data:(\w+)\*\//g, (_, k) => {
  const src = k === 'links' ? links : JSON.parse(read('src/data/' + k + '.json'));
  return JSON.stringify(resolveData(src)).replace(/</g, '\\u003c');
});
// Novedades y preguntas frecuentes: se arman desde src/data/news.json y src/data/faqs.json
const MES = { es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
const fecha = (d, l) => { const [y, m, dd] = d.split('-').map(Number); return l === 'es' ? dd + ' ' + MES.es[m - 1] + ' ' + y : MES.en[m - 1] + ' ' + dd + ', ' + y; };
const pair = (es, en) => '<span class="l-es">' + es + '</span><span class="l-en">' + en + '</span>';
html = html.replace('<!--news-->', () => {
  const N = JSON.parse(read('src/data/news.json')).items;
  return N.map((n, k) => {
    const img = 'https://static.wixstatic.com/media/' + n.img + '/v1/fill/w_760,h_475,al_c,q_80,enc_auto/' + (k + 1) + '.jpg';
    const pdf = /\.pdf($|\?)/i.test(n.url);
    return '<a class="ncard' + (k === 0 ? ' nfeat' : '') + '" href="' + esc(n.url) + '" target="_blank" rel="noopener" data-reveal="up" style="--d:' + (0.04 + (k % 3) * 0.07).toFixed(2) + 's">' +
      '<span class="nimg"><img src="' + esc(img) + '" alt="" loading="lazy" decoding="async" width="760" height="475" referrerpolicy="no-referrer"></span>' +
      '<span class="nbody"><span class="nmeta"><b>' + esc(n.medio) + '</b><time datetime="' + n.date + '">' + pair(fecha(n.date, 'es'), fecha(n.date, 'en')) + '</time></span>' +
      '<span class="ntitle">' + pair(esc(n.es), esc(n.en)) + '</span>' +
      '<span class="nmore">' + (pdf ? pair('Leer la nota (PDF)', 'Read the article (PDF, ES)') : pair('Leer la nota', 'Read the article (ES)')) + '<svg><use href="#i-arrow"/></svg></span></span></a>';
  }).join('\n');
});
html = html.replace('<!--faqs-->', () => {
  const F = JSON.parse(read('src/data/faqs.json')).items;
  return F.map((f, k) => '<details class="faq" data-reveal="up" style="--d:' + (0.03 * (k % 4)).toFixed(2) + 's"' + (k === 0 ? ' open' : '') + '>' +
    '<summary><em>' + String(k + 1).padStart(2, '0') + '</em>' + pair(f.q_es, f.q_en) + '<i aria-hidden="true"></i></summary>' +
    '<div class="faq-a"><p>' + pair(f.a_es, f.a_en) + '</p></div></details>').join('\n');
});

html = html.replace(/\{\{link:(\w+)\}\}/g, (_, k) => {
  if (!(k in links)) throw new Error('Link inexistente: ' + k);
  return esc(links[k]);
});
html = html.replace(/asset:([\w\-./]+\.(?:webp|jpe?g|png|svg|mp4|webm|pdf|woff2))/g, (_, p) => asset(p));
html = html.replace('<!--robots-->', INDEX ? '<meta name="robots" content="index,follow">' : '<meta name="robots" content="noindex,nofollow">');

// Login: src/js/gate-privacy.js (estética Privacy; SALT y USERS copiados de gate.js, el de ZLT-WEB-V2) inline después de </title>
if (LOGIN) {
  if (!exists('src/js/gate-privacy.js')) throw new Error('Falta src/js/gate-privacy.js (login). Usar --sin-login para armar sin login');
  const ref = read('gate.js'), mine = read('src/js/gate-privacy.js');
  const pick = (s, re) => (s.match(re) || [''])[0].replace(/\s+/g, '');
  if (pick(ref, /var SALT = "[^"]+";/) !== pick(mine, /var SALT = "[^"]+";/) || pick(ref, /var USERS = \[[\s\S]*?\];/) !== pick(mine, /var USERS = \[[\s\S]*?\];/))
    throw new Error('Los usuarios del login no coinciden con gate.js (ZLT-WEB-V2): copiar SALT y USERS a src/js/gate-privacy.js');
  const gate = mine.replace('__LOGO__', asset('logos/privacy-ai-studio-claro.png'))
                   .replace('__BG__', asset('videos/fondo-hero-poster.webp'))
                   .replace('__SHAPE__', asset('graficos/forma-cromada.webp'));
  html = html.replace('</title>', () => '</title>\n<script>' + gate + '</script>');
}

const left = html.match(/asset:|\{\{link:|<!--svg:|\/\*data:/);
if (left) throw new Error('Quedó un marcador sin resolver cerca de: ' + html.substr(left.index, 80));

const out = DEV ? path.join(ROOT, 'preview.html') : path.join(ROOT, 'dist', 'index.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);

const size = Buffer.byteLength(html);
const mb = (b) => (b / 1048576).toFixed(2) + ' MB';
console.log((DEV ? 'preview.html' : 'dist/index.html') + ' · ' + mb(size) + (INDEX ? ' · indexable' : ' · noindex') + (LOGIN ? ' · con login' : ' · sin login'));
if (!DEV) {
  [...used.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([p, b]) => console.log('  ' + mb(b).padStart(9) + '  ' + p));
  [...hits.entries()].filter(([p, n]) => n > 1 && used.get(p) > 50 * 1024).forEach(([p, n]) => console.warn('  aviso: ' + p + ' se embebe ' + n + ' veces (duplica peso)'));
  if (size > LIMIT) { console.error('ATENCIÓN: supera 30 MB (límite de subida). Bajá peso de fotos/videos.'); process.exitCode = 1; }
}
