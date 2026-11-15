# DESSET — VISUAL-CHANGE-01 · Baseline aprobada y evolución controlada

> Estado inicial: solo preparación técnica; este documento NO autoriza rediseño, squash merge ni despliegue.

## Problema real

`scripts/approved-baseline-gate.mjs` contenía hashes SHA-1 y un hash FNV del BODY fijos en el propio código. Esto impedía trabajar con cualquier versión visual autorizada sin editar directamente el programa de verificación. **El gate no debe eliminarse ni permitir un bypass por variable de entorno.**

## Modelo nuevo

1. `config/visual-baseline-approved.json` guarda la versión autorizada, origen y evidencia del último release, los siete archivos canónicos protegidos y, cuando se aprueben, fotografías raster adicionales; cada archivo tiene hash Git, además de la firma BODY.
2. `scripts/approved-baseline-gate.mjs` sigue siendo obligatorio en GitHub Actions y publicación manual. Comprueba que el HTML/CSS/JS/PNG/SVG coincidan con el manifiesto; también conserva `noindex` en la fuente.
3. `npm run visual:propose` ofrece un diagnóstico **de solo lectura**: cambios detectados y hashes propuestos. El resultado **no aprueba**, no modifica manifiestos, no crea PR, no fusiona y no despliega.
4. Cada futura propuesta se trabaja en una **rama aparte**, se inspecciona mediante imágenes/capturas y pruebas visuales, y se presenta al fundador con diff, licencia de imágenes, accesibilidad y evidencia de rendimiento.
5. **Tras autorización explícita para una versión concreta**: nuevo PR de promoción actualiza `config/visual-baseline-approved.json`, incrementa `baseline_id`, registra el `source_commit` del candidato ya revisado y los nuevos blobs. **Para aprobar**, el fundador deja un comentario en un issue GitHub con el SHA-256 exacto del diseño (instrucciones abajo), y el manifiesto apunta a ese comentario. El gate consulta GitHub y comprueba autor, identidad de propietario, pertenencia al issue y digest. Actualizar los tests de contenido exclusivamente para el nuevo diseño aceptado. La referencia del deployment histórico se conserva hasta otro acto autorizado.
6. Exigir `npm run check`, `security:audit`, `test:coverage`, `mutation:smoke`, Chrome (13 tamaños), `release:package`, gate Cloudflare, CodeQL, hashes del bundle y revisión visual. Un PR de propuesta puede permanecer con el gate rojo **hasta que se apruebe la versión**; esto es comportamiento correcto de fail-closed.
7. Aprobar e integrar el PR por separado. **Publicar por `workflow_dispatch` en `main` con `PUBLICAR_DESSET` solo si el fundador lo autoriza en otra operación**, conservar el deployment actual como rollback y comprobar el nuevo.

## Autorización técnica verificable de futuras versiones

**No se concede aprobación por cambiar JSON, renombrar `baseline_id` o enlazar un run de CI.** El primer Bento conserva un ancla histórica verificada por el SHA de su manifiesto completo (Git blob `8cef913d9018bc7294a951fd16b521ec8c87a018`); cualquier manifiesto diferente requiere verificación de propietario.

1. Trabajar en una rama de diseño y revisar pantallas/capturas, derechos de cada imagen, accesibilidad y paquete reproducible. Crear un commit del diseño candidato.
2. Preparar un manifiesto de **candidato** con `baseline_id` nuevo, `source_commit` del commit de diseño revisado, hashes Git de los archivos protegidos, firma del BODY y un enlace provisional de formato válido. Ejecutar `npm run visual:propose` para imprimir `current_manifest_design_sha256` y la frase de aprobación del **contenido del manifiesto**. El comando es solo lectura.
3. El titular del repositorio `M0-coder` debe publicar personalmente en un issue de `M0-coder/DESSET` un comentario cuyo **contenido íntegro** sea exactamente `AUTORIZO DISENO VISUAL DESSET SHA256 <digest>` (sustituir `<digest>` por los 64 hexadecimales generados). No sirve la aprobación de otra persona ni un enlace genérico a un PR.
4. Incorporar en `approval_evidence` la URL precisa del comentario (formato `https://github.com/M0-coder/DESSET/issues/N#issuecomment-ID`) y ejecutar el gate de nuevo: validará vía API pública de GitHub el autor, `author_association=OWNER`, el issue y el digest. Si GitHub no responde, **NO-GO**.
5. CI de PR, Chrome, SAST, coverage, mutation smoke, paquete y evidencia deben aprobar. Solo después de una aprobación de merge adicional puede integrarse el PR. La **publicación es otro consentimiento independiente** y continúa restringida a despacho manual del workflow de Cloudflare.

**Alcance y límite de seguridad:** la comprobación del comentario autentica la cuenta propietaria de GitHub, pero no constituye firma legal, ni resiste el compromiso de esa cuenta o la modificación intencional del propio código de verificación por alguien con facultades de merge. El ruleset actual reportó cero revisores obligatorios. Cuando exista un revisor independiente, configurar una revisión de código obligatoria y CODEOWNERS en la configuración administrativa de GitHub. No imponer ahora una revisión imposible a un fundador único.

## Límites todavía existentes (no declararlos resueltos)

- `tests/site.test.mjs` comprueba frases, colores y geometría explícitos del Bento actual. Ajustar los contratos en el PR del diseño aprobado; no borrarlos sin pruebas equivalentes.
- El manifiesto admite **imágenes raster adicionales versionadas** en `assets/` (`png`, `jpg`, `jpeg`, `webp`, `avif` o `gif`), pero `scripts/release-package.mjs`, `scripts/cloudflare-release-candidate.mjs`, `scripts/cloudflare-release-gate.mjs` y `scripts/browser-audit.mjs` manejan rutas y cantidades de archivos explícitas. **Agregar nuevas imágenes requiere actualizar la allowlist del paquete y las pruebas**, no simplemente copiar archivos. Imágenes SVG nuevas exigen auditoría de seguridad específica.
- `scripts/release-package-gate.mjs` y `scripts/mutation-smoke.mjs` todavía incluyen condiciones históricas de copy/ilustración. Se deben revisar durante un rediseño autorizado.
- `config/visual-baseline-approved.json` es auditable pero **no una firma criptográfica del consentimiento del fundador**. GitHub exige PR y checks `verify`/`analyze`, pero el ruleset observado tiene `required_approving_review_count=0`. La autorización humana y el control operativo de merges deben mantenerse; si existe un segundo revisor confiable, valorar configurar aprobación obligatoria.
- Mantener licencia y trazabilidad de fotografías, tipografías y recursos; no publicar marcas o servicios que no estén debidamente acreditados.

## Baseline anterior protegida

- Cloudflare Pages deployment: `c29ec7a7-806a-4a92-b326-e1a42c7dc1fe`.
- Commit del último release publicado: `841fb1d5ba44022237fe1534926c6c3a5ab564f5`.
- Historial, evidencia y respaldos: [PRODUCTION-BASELINE-2026-11-15.md](PRODUCTION-BASELINE-2026-11-15.md).

**Resultado de esta migración:** se elimina el bloqueo *por hashes incrustados en el código*, conservando una barrera de CI contra cambios visuales no revisados. No se ha cambiado ningún archivo público.
