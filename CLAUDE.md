# Notas para trabajar este repo con Claude

- Sitio de Privacy AI Studio (producto de Puzzle AI). Ver README.md.
- Editar solo `src/`, `links/`, recursos y `tools/`. Después: `node build.js` → `dist/index.html`.
- Todo texto nuevo lleva sus dos variantes `.l-es` / `.l-en`.
- Los títulos `.h2` y `.contact-big` se parten en palabras desde motion.js: no meterles HTML complejo (solo `span.l-es/l-en`, `.chrome`, `b`).
- Breakpoints 480/640/860/900 (más 1120/1180/1240 para la barra y el hero). No agregar otros salvo necesidad real.
- Verificar con Playwright a 1440, 768 y 390 px: cero errores de consola, cero overflow horizontal, demos funcionando, ES y EN.
- No borrar nada de la carpeta del usuario; cada actualización del repo se entrega en un solo zip.
- Login: `src/js/gate-privacy.js` (marca Privacy). SALT y USERS tienen que ser idénticos a `gate.js` (ZLT-WEB-V2); el build lo verifica.
- Novedades y FAQs se editan en `src/data/news.json` y `src/data/faqs.json`.
- Alternar fondos oscuros y claros (`.light`, `.light.soft`); dentro de `.light` las variables -d se redefinen.
