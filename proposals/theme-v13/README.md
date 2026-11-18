# DESSET THEME-V13 — Propuesta de tarjeta «ACTIVAR MODO OSCURO»

**ESTADO: CANDIDATA / NO APROBADA / NO MERGE / NO DEPLOY.**

Referencia: primera imagen aportada por el fundador el 18/11/2026; segunda imagen, situación publicada antes de esta propuesta. La primera es la dirección gráfica que se está preparando. No se declara identidad píxel por píxel sin inspección visual de las capturas.

## Cambios precisos
- Solo **tarjeta tema**, con fondo negro carbón texturado (grano discreto), engranaje pixelado en esquina superior izquierda y luna creciente y tres cruces en superior derecha.
- Texto original en esquina inferior izquierda y flecha ↗ con **marco blanco cuadrado** en la inferior derecha.
- No usar fuentes externas, imágenes externas, JavaScript nuevo, permisos de red ni dependencias. El SVG va inline para conservar el allowlist estático de 13 archivos.
- El botón #themeButton y su transición funcional `light ↔ dark` permanecen a cargo de `src/app.mjs`, sin cambios. Mantener `aria-label`, `aria-pressed` y caption de modo claro/oscurro.
- Otros nueve módulos: exactamente el mismo HTML que la versión V12 al restaurar únicamente la tarjeta. CSS original completo con SHA Git `70ee2931257ee6e50f72656def5f19f379a8d5a7` sin alterar.

## Evidencia
- Version base de `main`: `9f48d62cdadb43135fc9c2072cdc9e31f695c9ab`.
- Fuente V12 publicada: HTML Git blob `77b81ec013ed229cff6e064823ce99b4b3b52c4a`.
- Pruebas aisladas: `node --test tests/theme-v13-candidate.test.mjs`.
- Auditoría Chrome: `node scripts/theme-v13-browser.mjs` (13 tamaños, 2 temas, 26 capturas, foco/ARIA, reversibilidad del interruptor, recortes y solapes).
- Revisión de diferencias y artefactos del workflow `theme-v13-browser-no-deploy` del PR.

## Política fail-closed
El manifiesto de producción `config/visual-baseline-approved.json` sigue autorizando V12. El workflow global `verify` **debe rechazar** cualquier cambio gráfico hasta que se apruebe una nueva huella SHA-256 y un comentario verificable del propietario. No forzar verde eliminando el gate.

La autorización de diseño debe ocurrir tras revisar capturas; la de squash merge debe ser distinta y contener el HEAD definitivo; la de publicación en Cloudflare requiere una autorización posterior sobre el SHA resultante. No alterar DNS, ramas ajenas, `main`, ni liberar código desde esta rama.
