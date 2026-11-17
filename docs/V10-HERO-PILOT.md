# DESSET V10 — primera tarjeta: tipografía original, piloto aislado

**Decisión del fundador (2026-11-17): mantener exclusivamente la tipografía original.**
Las propuestas de tipografías alternativas dejan de formar parte del plan V10.
**No se comprarán, incorporarán ni cargarán fuentes adicionales.**

## Baseline y límites

- Repositorio `M0-coder/DESSET`, base aprobada `main@2022820443e9ed2edbccd7235edac893d7dacb0f`.
- Rama aislada `design/v10-hero-pilot-no-deploy`; PR #46 en borrador.
- El CSS original conserva la declaración `font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace` en `body`.
- V10 mantiene la **familia tipográfica original**. Solo dentro de la primera tarjeta ajusta tamaño, peso, interlineado y espaciado para adaptar la composición al Bento; no se incorporan tipografías nuevas.
- El HTML **sí cambia dentro de la primera tarjeta**: incorpora la palabra DESSET y un SVG decorativo de ciudad. Las otras nueve tarjetas, los diálogos, el script, el diseño responsive compacto, el logotipo, el SVG de cuatro roles, el GIF y su imagen estática reducida permanecen sin cambios.
- El GIF `assets/desset-eye.gif` conserva más de un fotograma y su hash aprobado; la imagen estática se utiliza solo bajo `prefers-reduced-motion: reduce`.
- Ni el manifiesto `config/visual-baseline-approved.json` ni los controles de publicación se modifican.

## Cambio propuesto — reproducción de la referencia facilitada

La **misma imagen facilitada por el fundador** es la referencia de composición: logo rojo, palabra DESSET junto al logo, estado a la derecha con separador, texto institucional a la izquierda, ojo GIF original a la derecha, cruz roja superior, cruz amarilla junto al ojo, silueta urbana inferior y pie institucional. **La única sustitución tipográfica acordada es la monoespaciada original de la web**, sin licencias ni fuentes adicionales.

Cambios candidatos:
- `index.html`: únicamente se incorpora un wordmark textual `DESSET` y un `<svg class="intro-skyline">` decorativo trazado desde la imagen aportada, dentro de `.tile--intro`. No se añaden recursos externos ni nuevos archivos al paquete de Cloudflare.
- `styles.css`: estilos CSS de textura cálida, marco, acento geométrico rojo y amarillo, jerarquía y disposición responsiva, todos limitados a la primera tarjeta. Se mantiene la familia de fuentes original heredada; los tamaños/pesos en esa tarjeta sí se adaptan para caber sin recortes.
- `tests/hero-v10-preview.test.mjs`: verifica que el HTML original se obtiene exactamente retirando esas dos adiciones; valida la pila monoespaciada, el GIF con más de un fotograma, los activos, los selectores acotados y la ausencia de imports/font-face externos.
- El proyecto no incluye `®` sin constancia registral. No introduce declaraciones comerciales o disponibilidad anticipada.

**Límite:** la silueta urbana está vectorizada y reducida a la resolución del Bento; no equivale píxel a píxel a todo el fotomontaje original. La composición debe revisarse en capturas instrumentadas reales. Si el dibujo o espaciado resulta inadecuado, NO-GO hasta corregirlo.

## Evidencia e interpretación correcta

- `tests/hero-v10-preview.test.mjs` comprueba que el CSS base conserva sus bytes, que las nuevas reglas heredan la **familia** tipográfica original, que el HTML fuera de dos inserciones concretas coincide con el original, que la malla Bento y los activos JS/PNG/SVG preexistentes siguen idénticos, y que el GIF posee varios fotogramas.
- El workflow `.github/workflows/v10-hero-preview.yml` ejecuta la batería de candidato **excepto el archivo de pruebas que presupone aprobación V9**, verifica expresamente que el gate oficial **falla cerrado**, ensaya el empaquetado local para Cloudflare y realiza auditoría Chrome en 13 resoluciones. Las tres pruebas del V9 observadas en `verify` siguen FAIL y no se modifican para simular aprobación. No toca secretos ni producción.
- El workflow oficial `ci.yml` **debe mantener el gate rojo** mientras `styles.css` no tenga un manifiesto nuevo con autorización real del propietario. No reemplazarlo ni considerarlo incidencia a ocultar.
- El mutation smoke del repo solo cubre mutaciones contractuales de los cuatro roles; la cobertura de código reportada es parcial, no una métrica de mutation testing integral.
- Cada revisión de candidato necesita nuevas capturas de escritorio, móvil, modo oscuro y preferencia de movimiento reducido; ninguna captura PNG demuestra animación por sí sola.

## Condiciones para promoción (no autorizada)

1. Evidencias de auditoría de navegador y pruebas del HEAD exacto.
2. Revisión de contraste, recortes y accesibilidad de la composición sin modificar la tipografía.
3. Comparativa de capturas `main` vs. candidato, con cambios confinados a la primera tarjeta. El análisis geométrico no sustituye pruebas de contraste, zoom ni accesibilidad con lector de pantalla.
4. Manifiesto de identidad visual nuevo, digest SHA-256 de la propuesta y comentario de aprobación de la cuenta propietaria en GitHub, según `docs/VISUAL-CHANGE-01.md`.
5. Revisión posterior del PR y **autorizaciones independientes** de merge y publicación manual.

**Estado: piloto exclusivamente visual, no aprobado para integración ni despliegue.**
