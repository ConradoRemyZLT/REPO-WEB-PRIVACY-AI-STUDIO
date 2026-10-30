# PRIVACY-AI-STUDIO-WEB · by Puzzle AI

Sitio web de **Privacy AI Studio**, el producto de **Puzzle AI** (diseñado con el IALAB de la Facultad de Derecho, UBA) para usar IA generativa con datos confidenciales: anonimización, transcripción local y chat IA, on-premise, trazable y auditable.

Estructura base tomada de ZLT-WEB-V2 (barra de 64 px, wrap de 1200 px, breakpoints 480/640/860/900, pares bilingües `.l-es` / `.l-en`, un solo HTML autocontenido) con el branding del BrandBook y del brochure 2026 de Privacy.

## Qué se publica

`dist/index.html` → **un solo HTML autocontenido** (video, fotos, logos, premios, tipografías, brochure y one-pagers, CSS y JS embebidos en base64). Pesa ~16,5 MB (límite de subida: 30 MB).

Sale con `noindex` (no compite en Google con privacyaistudio.com hasta que se decida la mudanza). Para habilitar la indexación: `node build.js --index`.

Lleva un **login con la estética de Privacy** (`src/js/gate-privacy.js`) y **las mismas credenciales que ZLT-WEB-V2**: el `SALT` y los `USERS` son copia de `gate.js` (el de la v2, que queda en la raíz como referencia). `node build.js` verifica que coincidan y frena si no; si cambian los usuarios allá, copiar `gate.js` de nuevo y pegar `SALT` y `USERS` en `gate-privacy.js`. Para sacar el login: `node build.js --sin-login` y borrar el bloque "Login" del workflow.

`.github/workflows/pages.yml` publica `dist/index.html` en GitHub Pages en cada push a `main` (correr `node build.js` antes de subir).

## Cómo se trabaja

Requisito: Node 16 o superior (sin dependencias).

```
node build.js              # genera dist/index.html (lo que se publica)
node build.js --dev        # genera preview.html, apunta a los archivos del repo (para editar y ver rápido)
node build.js --index      # igual que el primero, pero indexable
node build.js --sin-login  # sin pantalla de login
```

Se edita siempre en `src/`, `links/` y las carpetas de recursos; nunca a mano `dist/index.html`.

## Carpetas

| Carpeta | Contenido |
|---|---|
| `src/html/index.html` | Plantilla de la página: todos los textos, en ES y EN |
| `src/css/styles.css` | Tokens de marca, estilos, responsive y la capa de movimiento (bloque "MOVIMIENTO") |
| `src/js/main.js` | Idioma, menú, descargas, demos de los 3 módulos, sectores, KPIs, índice lateral, formulario |
| `src/js/motion.js` | Animaciones: títulos palabra por palabra, parallax del hero y de las formas cromadas, datos que se anonimizan en el hero, recorrido del flujo con el scroll, registro de auditoría en vivo, marquesina de modelos, luz e inclinación en el vidrio, botones magnéticos, demos que arrancan solas |
| `src/data/dl.json` | Los PDF descargables (se embeben una sola vez) |
| `src/data/news.json` | **Novedades** (de la colección News del CMS de la web actual en Wix). Las fotos se cargan desde el servidor de Wix |
| `src/data/faqs.json` | **Preguntas frecuentes** (provisorias, ver Pendientes) |
| `src/js/gate-privacy.js` | Pantalla de login de Privacy |
| `links/links.json` | Web, mail, Puzzle AI y destino del formulario |
| `logos/` | Privacy AI Studio claro/oscuro (PNG oficiales), Puzzle AI (`puzzle-ai.svg`, vectorizado sin deformar), IALAB UBA; `original/` el .ai |
| `graficos/` | Forma cromada, cinta de seda y texturas claras (seda / ondas) del universo gráfico |
| `premios/` | Laureles RIPD · AEPD 2025 y LatamDigital 2026 |
| `videos/` | Loop del hero (fondo web) y su póster |
| `brochures/` | Brochure general 2026 (ES) y one-pagers Poder Judicial, Sector público y RRHH |
| `fotos/` | Tapas del brochure y de los one-pagers (para las tarjetas de descarga) |
| `iconos/web/` | Favicon, ícono iOS/Android, imagen para compartir |
| `fonts/` | **Causten** (la tipografía de la marca, desde los archivos oficiales, subconjunto latino en woff2) y DM Sans (OFL) |
| `tools/` | `optimize_assets.py` regenera los recursos desde la carpeta original de Privacy; `puzzle_svg.py` vectoriza el logo de Puzzle AI |

## Estructura de la página

1. **Hero** — video de marca, propuesta de valor, On-premise · Trazable · Auditable, demo + brochure, "Diseñado por IALAB UBA · Desarrollado por Puzzle AI", premios.
2. **Público** — banda con los tres sectores (va directo a su pestaña).
3. **El problema** — Shadow AI: fuga invisible, riesgo normativo, sin auditoría.
4. **Cómo funciona** — los 3 módulos en secuencia + registro de auditoría.
5. **Módulo 01 · Anonimización**, **02 · Transcripción**, **03 · Chat IA** — cada uno con su demo interactiva.
6. **Para quién es** — Poder Judicial / Organismos públicos / RRHH, cada uno con su one-pager.
7. **Diferenciadores**, marquesina de modelos, **Resultados**, **Implementación y soporte**, **Reconocimientos**.
8. **Un producto de Puzzle AI** — quién desarrolla, quién diseña, brochure general.
9. **Novedades** — notas y premios (6, de la web actual).
10. **Preguntas frecuentes** — acordeón.
11. **Solicitar demo** — formulario + contacto, y footer.

Ritmo de fondos: se alternan secciones oscuras (navy del manual) y claras (papel `#F9F9F7` y gris `#EDEFF4`, con las texturas claras del BrandBook). En las claras, las demos de producto siguen oscuras, como una app sobre el escritorio.

Respecto de la v2 de ZLT: en vez de fichas de proyectos, la página cuenta una historia de producto (problema → solución → módulos → público → por qué → prueba → quién está detrás → demo), y cada módulo se muestra funcionando.

## Movimiento

Todo anima sobre `transform`/`opacity` en un único `requestAnimationFrame`, a la frecuencia de la pantalla. Con "reducir movimiento" activado en el sistema operativo no se ejecuta nada de `motion.js` y la página queda estática y completa. Las demos se detienen apenas la persona las toca.

## Regenerar recursos desde los originales

```
python tools/optimize_assets.py "<ruta a Puzzle/Privacy AI Studio>"
```

Reglas: `exif_transpose` antes de escalar, LANCZOS, nunca deformar; PNG con alfa sin `optimize=True`.

## Fuentes

- Textos: Brochure Privacy AI Studio 2026 (12/08/2026), BrandBook, one-pagers 2026 y privacyaistudio.com.
- Paleta (BrandBook): `#021444` · `#2B344E` · `#606060` · `#F9F9F7`.

## Pendientes / a confirmar

- **Tipografía**: Causten se embebe desde los archivos de `Puzzle/Manual de marca/Tipografia`. Es una fuente comercial (Bagas Ardiatma): confirmar que la licencia cubra uso **web** antes de publicar en un dominio abierto. El texto corrido va en DM Sans, como en el brochure.
- **Logos de Puzzle AI e IALAB**: salen del brochure. El de Puzzle está vectorizado (`puzzle-ai.svg`, misma forma y proporción); igual conviene reemplazar ambos por los archivos oficiales en SVG.
- **Formulario**: envía con FormSubmit a hello@thepuzzle.ai. La primera vez llega un mail de activación que hay que confirmar; mientras tanto muestra el aviso con el mail directo.
- **Brochure y one-pagers solo en español**: en la versión EN los botones lo aclaran con "(ES)".
- **Dominio de Puzzle AI**: el brochure dice thepuzzle.ai y la web actual enlaza thepuzzle.digital. Se usa thepuzzle.ai.
- **Estudios jurídicos**: la web actual los nombra como sector; el brochure 2026 no. Quedó fuera hasta confirmar.
- **FAQs**: no están en el CMS de Wix (son texto de la página) y la página bloquea la lectura automática. Las de `faqs.json` son **provisorias**, redactadas desde el brochure 2026: reemplazarlas por las oficiales.
- **News**: las 6 notas vienen de la colección News del CMS de Wix. Sus fotos se cargan desde static.wixstatic.com: si se da de baja la web de Wix, hay que bajarlas y embeberlas.
- El video de fondo original es de 24 fps; en la web va interpolado a 60 fps.
