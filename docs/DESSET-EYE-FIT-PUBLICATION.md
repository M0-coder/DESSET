# DESSET — Publicación del ojo aprobado

El fundador autorizó publicar la vista revisada el 16 de noviembre de 2026. Este documento prepara la ejecución; no acredita que la publicación haya ocurrido.

## Candidato exacto

- Commit de diseño y empaquetado: 84b51e1e542fe6c2efd75f26baaa73a1d60e8e6c.
- Base main: 137f09bf1105b8e3220d6bb8ddfc9aaefd3ea3cb.
- Respaldo público esperado: c29ec7a7-806a-4a92-b326-e1a42c7dc1fe. Reconfirmar antes del despliegue.
- Manifiesto candidato: docs/DESSET-EYE-FIT-candidate-manifest.json. Su status es el valor requerido por el formato técnico, NO una acreditación de aprobación remota. No sustituye config/visual-baseline-approved.json.
- SHA-256 del contenido visual: 88b7f0e8f5f8aa5f997cabcbd65423748269e84bb109e65b37be177adbc2cc3d.

## Bloqueo verificable

El control scripts/visual-approval.mjs exige un comentario OWNER con el digest exacto. No se inventó un comentario ni se cambió el control. El campo approval_evidence del candidato apunta al issue existente, y no cumple aún el formato de comentario exigido.

El titular debe dejar personalmente en https://github.com/M0-coder/DESSET/issues/29 este texto íntegro:

```text
AUTORIZO DISENO VISUAL DESSET SHA256 88b7f0e8f5f8aa5f997cabcbd65423748269e84bb109e65b37be177adbc2cc3d
```

Tras verificar ese comentario: incorporar su URL, promover el manifiesto, conservar la prueba del manifiesto histórico mediante fixture, actualizar las pruebas de los nueve archivos protegidos y ejecutar toda la CI. Integrar y publicar manualmente únicamente con todos los controles aprobados.

## Evidencia disponible y límites

- 14 tamaños instrumentados: distribución sin solapamiento, deformación ni desbordamiento. Véase DESSET-EYE-FIT-layout-evidence.json.
- GIF original idéntico por SHA-256; PNG fijo para prefers-reduced-motion. La preferencia no fue emulada en esta sesión.
- Paquete final: 13 archivos; staging: 12. Pruebas negativas de final 6/6, Cloudflare final 5/5 y staging 5/5 aprobadas.
- check conserva tres fallos esperados por el manifiesto visual anterior; no declarar CI verde ni publicar así.
- No se declara auditoría WCAG completa; el GIF mantiene el bucle original.
- No se modificaron DNS, dominio, despliegues automáticos, logo, textos, colores ni las demás tarjetas.

## Activación y rollback

Antes del workflow: confirmar main con el SHA integrado, verify/analyze aprobados, despliegue anterior conservado y opción de rollback. Ejecutar cloudflare-pages-production.yml con PUBLICAR_DESSET. Comprobar SHA, commit_dirty=false, uses_functions=false, 13 archivos, HTTPS, 200/404, cabeceras, GIF y PNG por hash, escritorio y móvil. Ante regresión: restaurar el deployment c29ec7a7-806a-4a92-b326-e1a42c7dc1fe y registrar NO-GO.

## Promoción autorizada — 16 de noviembre de 2026

El fundador autorizó registrar el texto exacto con su cuenta y continuar la publicación controlada. Comentario real: https://github.com/M0-coder/DESSET/issues/29#issuecomment-6910336609 . El gate verificó OWNER y digest exacto: PASS. Se promovió el manifiesto sin cambiar los archivos visuales autorizados. El manifiesto original se conserva byte a byte en tests/fixtures/visual-baseline-original.json con comprobación del blob histórico.

Pruebas locales después de promoción: check 61/61 PASS; seguridad estática PASS; mutation smoke 4/4; cobertura diagnóstica ejecutada (parcial); hosting, launch guard, pruebas negativas y paquete final 13/13 PASS. Las menciones anteriores a tres fallos y comentario pendiente describen el estado previo, ya resuelto. CI remota y publicación aún pendientes al redactar esta actualización.

### Corrección del servidor de pruebas

CI 43824979009 falló antes de cualquier integración o publicación: su allowlist HTTP omitía las dos imágenes nuevas. Se añadieron GIF y PNG con MIME explícito; se mantienen todas las aserciones de imágenes cargadas y geometría. La auditoría comprueba también proporción, contención y separación del ojo, y selección del PNG con reducción de movimiento en escritorio y móvil. No se modificó el contenido visual autorizado.

## Estado final de esta ejecución: NO-GO, sin publicación

- Se registró únicamente el texto que el fundador autorizó, en https://github.com/M0-coder/DESSET/issues/29#issuecomment-6910336609 .
- CI 43825246027 detectó recortes reales en 1280x600 y 375x667. Evidencia: https://github.com/M0-coder/DESSET/actions/runs/43825246027 . También detectó una espera pendiente al volver del PNG al GIF en la prueba de reducción de movimiento; se añadió espera acotada con fallo explícito.
- Corrección: solamente para alturas entre 401 y 700px, quitar padding vertical del bloque central y reducir el ancho del ojo 12px conservando su proporción. No cambia imagen, colores, textos, logotipo ni otras tarjetas.
- Candidato corregido: 066c1f07d486cfa05ce09c710c625862e2616c1a. Pruebas locales por DOM en 14 tamaños: sin overflow de la tarjeta, pie contenido, imagen cargada, proporción conservada. Archivo docs/DESSET-EYE-FIT-layout-evidence-v2.json. Las alturas compactas usan desplazamiento vertical previsto. No equivale a CI completa aprobada.
- Manifiesto propuesto: docs/DESSET-EYE-FIT-candidate-manifest-v2.json; NO se promovió al aprobado ni se reutilizó el comentario del digest anterior.
- Nuevo digest: b5391522849cb94d32658070ce5f6074566f9393a2a3da1634f7964ae3c25ff3. Texto exacto que requeriría autorización para registrarse:

```text
AUTORIZO DISENO VISUAL DESSET SHA256 b5391522849cb94d32658070ce5f6074566f9393a2a3da1634f7964ae3c25ff3
```

Pendiente: autorización para registrar el nuevo texto, promoción del manifiesto, CI completa remota y publicación manual con verificaciones. No hubo merge, workflow de publicación ni modificación de producción/DNS.

## Autorización V2 recibida — continuación

El fundador autorizó expresamente registrar la huella b5391522849cb94d32658070ce5f6074566f9393a2a3da1634f7964ae3c25ff3 y continuar hasta publicación si todos los controles aprueban, sin repetir aprobaciones de pasos ya autorizados. Comentario real: https://github.com/M0-coder/DESSET/issues/29#issuecomment-6910555482 . Se promueve el manifiesto V2 y se actualizan únicamente sus expectativas de identidad; los controles de integridad y autorización permanecen activos. El NO-GO anterior describe la ejecución previa, no una prohibición permanente. Publicación pendiente de CI completa en esta actualización.
