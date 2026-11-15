# DESSET — VISUAL-CHANGE-01 · Baseline aprobada y evolución controlada

> Estado inicial: solo preparación técnica; este documento NO autoriza rediseño, squash merge ni despliegue.

## Problema real

`scripts/approved-baseline-gate.mjs` contenía hashes SHA-1 y un hash FNV del BODY fijos en el propio código. Esto impedía trabajar con cualquier versión visual autorizada sin editar directamente el programa de verificación. **El gate no debe eliminarse ni permitir un bypass por variable de entorno.**

## Modelo nuevo

1. `config/visual-baseline-approved.json` guarda la versión autorizada, origen y evidencia del último release, siete hashes Git y firma BODY.
2. `scripts/approved-baseline-gate.mjs` sigue siendo obligatorio en GitHub Actions y publicación manual. Comprueba que el HTML/CSS/JS/PNG/SVG coincidan con el manifiesto; también conserva `noindex` en la fuente.
3. `npm run visual:propose` ofrece un diagnóstico **de solo lectura**: cambios detectados y hashes propuestos. El resultado **no aprueba**, no modifica manifiestos, no crea PR, no fusiona y no despliega.
4. Cada futura propuesta se trabaja en una **rama aparte**, se inspecciona mediante imágenes/capturas y pruebas visuales, y se presenta al fundador con diff, licencia de imágenes, accesibilidad y evidencia de rendimiento.
5. **Tras autorización explícita para una versión concreta**: nuevo PR de promoción actualiza `config/visual-baseline-approved.json`, incrementa `baseline_id`, registra `source_commit` de la versión revisada, referencia de aprobación verificable y los nuevos blobs; actualiza las pruebas de texto/estructura exclusivamente para el nuevo diseño aceptado. No se altera la vieja referencia de publicación en Cloudflare sin deployment autorizado.
6. Exigir `npm run check`, `security:audit`, `test:coverage`, `mutation:smoke`, Chrome (13 tamaños), `release:package`, gate Cloudflare, CodeQL, hashes del bundle y revisión visual. Un PR de propuesta puede permanecer con el gate rojo **hasta que se apruebe la versión**; esto es comportamiento correcto de fail-closed.
7. Aprobar e integrar el PR por separado. **Publicar por `workflow_dispatch` en `main` con `PUBLICAR_DESSET` solo si el fundador lo autoriza en otra operación**, conservar el deployment actual como rollback y comprobar el nuevo.

## Límites todavía existentes (no declararlos resueltos)

- `tests/site.test.mjs` comprueba frases, colores y geometría explícitos del Bento actual. Ajustar los contratos en el PR del diseño aprobado; no borrarlos sin pruebas equivalentes.
- `scripts/release-package.mjs`, `scripts/cloudflare-release-candidate.mjs`, `scripts/cloudflare-release-gate.mjs` y `scripts/browser-audit.mjs` manejan rutas y cantidades de archivos explícitas. **Agregar nuevas imágenes requiere actualizar la allowlist del paquete y las pruebas**, no simplemente copiar archivos.
- `scripts/release-package-gate.mjs` y `scripts/mutation-smoke.mjs` todavía incluyen condiciones históricas de copy/ilustración. Se deben revisar durante un rediseño autorizado.
- `config/visual-baseline-approved.json` es auditable pero **no una firma criptográfica del consentimiento del fundador**. GitHub exige PR y checks `verify`/`analyze`, pero el ruleset observado tiene `required_approving_review_count=0`. La autorización humana y el control operativo de merges deben mantenerse; si existe un segundo revisor confiable, valorar configurar aprobación obligatoria.
- Mantener licencia y trazabilidad de fotografías, tipografías y recursos; no publicar marcas o servicios que no estén debidamente acreditados.

## Baseline anterior protegida

- Cloudflare Pages deployment: `c29ec7a7-806a-4a92-b326-e1a42c7dc1fe`.
- Commit del último release publicado: `841fb1d5ba44022237fe1534926c6c3a5ab564f5`.
- Historial, evidencia y respaldos: [PRODUCTION-BASELINE-2026-11-15.md](PRODUCTION-BASELINE-2026-11-15.md).

**Resultado de esta migración:** se elimina el bloqueo *por hashes incrustados en el código*, conservando una barrera de CI contra cambios visuales no revisados. No se ha cambiado ningún archivo público.
