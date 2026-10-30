# PRIVACY-AI-STUDIO-WEB · by Puzzle AI

Sitio web de **Privacy AI Studio**, el producto de **Puzzle AI** (diseñado con el IALAB de la Facultad de Derecho, UBA) para usar IA generativa con datos confidenciales: anonimización, transcripción local y chat IA, on-premise, trazable y auditable.

Estructura base tomada de ZLT-WEB-V2 (barra de 64 px, wrap de 1200 px, breakpoints 480/640/860/900, pares bilingües `.l-es` / `.l-en`, un solo HTML autocontenido) con el branding del BrandBook y del brochure 2026 de Privacy.

## Qué se publica

`dist/index.html` → **un solo HTML autocontenido** (video, fotos, logos, premios, tipografías, brochure y one-pagers, CSS y JS embebidos en base64). Pesa ~16 MB (límite de subida: 30 MB).

Sale con `noindex` (no compite en Google con privacyaistudio.com hasta que se decida la mudanza). Para habilitar la indexación: `node build.js --index`.

Lleva el mismo login que ZLT-WEB-V2 / Lumina (`gate.js`, copia exacta). Para sacarlo: `node build.js --sin-login` y borrar el bloque "Login" del workflow.

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
| `links/links.json` | Web, mail, Puzzle AI y destino del formulario |
| `logos/` | Privacy AI Studio claro/oscuro (PNG oficiales), Puzzle AI, IALAB UBA; `original/` el .ai |
| `graficos/` | Forma cromada y cinta de seda del universo gráfico |
| `premios/` | Laureles RIPD · AEPD 2025 y LatamDigital 2026 |
| `videos/` | Loop del hero (fondo web) y su póster |
| `brochures/` | Brochure general 2026 (ES) y one-pagers Poder Judicial, Sector público y RRHH |
| `fotos/` | Tapas del brochure y de los one-pagers (para las tarjetas de descarga) |
| `iconos/web/` | Favicon, ícono iOS/Android, imagen para compartir |
| `fonts/` | Urbanist y DM Sans (OFL) |
| `tools/` | `optimize_assets.py`: regenera todos los recursos desde la carpeta original de Privacy |

## Estructura de la página

1. **Hero** — video de marca, propuesta de valor, On-premise · Trazable · Auditable, demo + brochure, "Diseñado por IALAB UBA · Desarrollado por Puzzle AI", premios.
2. **Público** — banda con los tres sectores (va directo a su pestaña).
3. **El problema** — Shadow AI: fuga invisible, riesgo normativo, sin auditoría.
4. **Cómo funciona** — los 3 módulos en secuencia + registro de auditoría.
5. **Módulo 01 · Anonimización**, **02 · Transcripción**, **03 · Chat IA** — cada uno con su demo interactiva.
6. **Para quién es** — Poder Judicial / Organismos públicos / RRHH, cada uno con su one-pager.
7. **Diferenciadores**, marquesina de modelos, **Resultados**, **Implementación y soporte**, **Reconocimientos**.
8. **Un producto de Puzzle AI** — quién desarrolla, quién diseña, brochure general.
9. **Solicitar demo** — formulario + contacto, y footer.

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

- **Tipografía**: la marca usa **Causten** (licencia comercial). Se declara primero en el CSS (si está instalada, se usa) y se embebe **Urbanist** (OFL) como sustituto; el texto va en **DM Sans**, la misma del brochure. Si se compra la licencia web de Causten, sumar los `.woff2` en `fonts/` y sus `@font-face` al inicio de `styles.css`.
- **Logos de Puzzle AI e IALAB**: extraídos del brochure (resolución chica). Conviene reemplazarlos por los archivos oficiales, idealmente SVG.
- **Formulario**: envía con FormSubmit a hello@thepuzzle.ai. La primera vez llega un mail de activación que hay que confirmar; mientras tanto muestra el aviso con el mail directo.
- **Brochure y one-pagers solo en español**: en la versión EN los botones lo aclaran con "(ES)".
- **Dominio de Puzzle AI**: el brochure dice thepuzzle.ai y la web actual enlaza thepuzzle.digital. Se usa thepuzzle.ai.
- **Estudios jurídicos**: la web actual los nombra como sector; el brochure 2026 no. Quedó fuera hasta confirmar.
- **FAQs y News** de la web actual no se pudieron leer (el sitio de Wix bloquea la lectura automática): no se incluyeron.
- El video de fondo original es de 24 fps; en la web va interpolado a 60 fps.
