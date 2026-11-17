# DESSET V10 — Primera tarjeta, piloto aislado (NO-GO para producción)

Fecha de auditoría: 2026-11-17. Repositorio original: `M0-coder/DESSET`.
Base verificada: `main@2022820443e9ed2edbccd7235edac893d7dacb0f`.
Rama de experimento: `design/v10-hero-pilot-no-deploy`.

## Fuente de verdad

- `index.html` contiene las diez tarjetas y la primera tarjeta mantiene su estructura aprobada.
- `assets/desset-eye.gif` conserva la animación; `assets/desset-eye-still.png` se ofrece exclusivamente para `prefers-reduced-motion: reduce`. No se cambió el HTML de `picture`.
- El logotipo `assets/deliver-assets-mark.png`, `assets/roles-geometry-v2.svg`, `src/app.mjs`, `src/content.mjs` y `styles-compact.css` permanecen intactos.
- El manifiesto `config/visual-baseline-approved.json` conserva los hashes originales y NO se actualiza en esta propuesta. El gate `scripts/approved-baseline-gate.mjs` debe rechazar `styles.css` hasta disponer de una autorización visual nueva.
- El pipeline de Cloudflare sigue requiriendo despacho manual. Esta propuesta no autoriza un merge, DNS, una publicación o un cambio de entorno.

## Intervención real de Fase 1

Sólo se anexa CSS a `styles.css` con selectores acotados a `.tile--intro` y su estado de tema oscuro:
fondo claro cálido, textura CSS discreta, jerarquía tipográfica para el título y un pequeño acento pixelado rojo mediante pseudo-elemento CSS de la primera tarjeta. No hay imagen externa ni modificación del DOM.
No se cambia la cuadrícula de 12/6 columnas, la posición del ojo, ninguna otra tarjeta ni ningún recurso binario.

El CSS expresa la preferencia por `PP Mondwest` únicamente en la frase «UNA MISMA VISIÓN.»; **no incluye ni descarga la fuente real**. Mientras no exista licencia web documentada y un procedimiento de empaquetado seguro, el navegador utilizará una serif de respaldo. El concepto no representa aún un render auténtico de Mondwest. «Space Grotesk» también queda como preferencia con fallback del sistema hasta incorporar su distribución OFL y verificar sus recursos.

No se incorpora `®`, ya que no consta respaldo registral de DESSET. Tampoco se agregan cifras, versión de lanzamiento o contactos no acreditados.

## Evidencia requerida antes de recomendar integración

1. `npm run check`, `npm run security:audit`, `npm run mutation:smoke`, `npm run test:coverage`.
2. `npm run browser:audit` con **13 tamaños** y capturas de escritorio/móvil/alturas bajas; comprobar cero recortes indebidos, navegación, diálogos y modo oscuro.
3. La nueva prueba `tests/hero-v10-preview.test.mjs` certifica hashes del GIF, PNG de respaldo, logo, SVG, HTML, contenido, código y CSS base; también analiza los bloques del GIF para exigir **más de un fotograma real** y comprueba el acento decorativo. No certifica una reproducción tipográfica exacta ni es una auditoría de accesibilidad completa.
4. Comparación fotograma/geométrica de la tarjeta: `main` contra el candidato; garantizar que el GIF sigue animado en preferencia estándar y que el fallback estático sólo aparece con movimiento reducido.
5. Verificar licencia y formato de PP Mondwest antes de introducir `@font-face`, actualizar allowlists/hashes y recalcular la geometría. No subir fuentes propietarias sin permiso de distribución.
6. Documentar deuda técnica y límites de cobertura: las pruebas de Node y mutation smoke no sustituyen cobertura profunda, mutation score integral ni contraste, zoom o lectores de pantalla.
7. Para una versión finalmente aprobada, nuevo manifiesto con los hashes reales y comentario SHA-256 exacto del OWNER `M0-coder`, seguido de checks de integración, aprobación de merge y autorización de publicación separada.

**La previsualización de PR NO es el gate de aprobación**. Es una ejecución aislada sin secretos ni despliegue. El CI principal sigue fallando correctamente hasta que exista autorización.
