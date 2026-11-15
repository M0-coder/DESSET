# DESSET A11Y-COMPACT-01 — Recuperación de contenido en altura reducida

**Origen:** PR #8, SHA `557b9694dc7558584456bfa3b45f8726ce2dacce`. 
**Motivo:** informe DESSET-WORK-DOMAIN-01: contenido recortado a `320 x 256` CSS px.

## Alcance estricto
- No se modifica `styles.css` original, `src/`, `assets/`, `vercel.json` ni el cuerpo de `index.html`.
- Se incorpora `styles-compact.css` mediante enlace condicional en el HEAD. Opera exclusivamente a `max-height:400px`; fuera de ese umbral, el Bento aprobado usa los mismos CSS/HTML/JS/activos y mantiene no-scroll.
- En alturas bajas, las tarjetas obtienen filas de altura mínima y el documento permite scroll vertical; la navegación móvil queda fija al fondo. El diálogo permite desplazamiento propio.
- No es un cambio de identidad ni de narrativa. **Es una excepción accesible acotada** al contrato de pantalla sin scroll para evitar esconder contenido.
- El candado de integridad original continúa protegiendo el CSS aprobado y el cuerpo HTML.
- `dist/` de prueba incluye la hoja nueva para garantizar igualdad de activos de origen y destino.

## Validación
- Chrome de fuente y paquete: diez viewports estándar idénticos en comportamiento al candidato previo, más `768x320`, `390x320` y `320x256` (vista inicial/sections), con pruebas de acceso vertical, ausencia de desbordamiento horizontal, recorte de textos, diálogo y botones.
- Evidencia: CI + artefactos de capturas, comprobación final del SHA y comparación de archivos.
- `candidate_decision = BLOCKED` para publicación hasta revisión de capturas por persona, pruebas de zoom real 200%/400%, tecnologías asistivas, condiciones de alojamiento y aprobación del fundador.
- Ni merge ni despliegue ni DNS autorizados.
