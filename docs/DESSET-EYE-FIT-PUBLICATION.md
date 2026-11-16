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
