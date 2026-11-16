# DESSET — V3 propuesta: retirar rótulos móviles redundantes

Estado: **V3 autorizada por comentario verificable del propietario; publicación todavía pendiente.**

- SHA del commit de diseño: `8ce36e7ae1df66990f47e4971833b017ce17f635`.
- Referencia anterior aprobada: `DESSET-EYE-FIT-2026-11-16-V2`.
- GIF original y PNG de accesibilidad: sin cambios.
- `index.html`: se elimina el bloque `role-legend` completo; no se eliminan los roles de negocio ni el SVG.
- `styles.css`: se eliminan todas las reglas de `role-legend` y el límite móvil `max-height:43%`; la imagen ocupa la tarjeta con `object-fit:contain`, dejando espacio al caption inferior.
- `tests/site.test.mjs` y `scripts/browser-audit.mjs`: la ausencia de la leyenda se verifica en pruebas de DOM y navegador, conservando `MOVIMIENTO / SISTEMA` y el GIF.
- La página publicada permanece en `c29ec7a7-806a-4a92-b326-e1a42c7dc1fe` hasta publicación manual autorizada.

**Firma requerida:** SHA-256 del manifiesto V3: `360e4421b95a372b82e94d4bec2a20a349d25788b54f33c9e2f46c3b16782afa`.

El propietario del repositorio debe comentar personalmente en <https://github.com/M0-coder/DESSET/issues/29> exactamente:

```text
AUTORIZO DISENO VISUAL DESSET SHA256 360e4421b95a372b82e94d4bec2a20a349d25788b54f33c9e2f46c3b16782afa
```

Luego incorporar la URL exacta del comentario en `config/visual-baseline-approved.json`, cambiar su versión a V3, actualizar hashes/BODY y pruebas correspondientes, y comprobar `npm run check`, seguridad, cobertura, mutation smoke, Chrome responsivo, CodeQL y paquetes Cloudflare. **No omitir ningún gate ni asumir aprobación por este archivo.**

Publicación requiere comprobación independiente de `main` y Cloudflare, respaldo y rollback. No activar workflow, auto-merge ni publicar sin cumplir los controles.

## Evidencia de aprobación V3

El titular aprobó esta huella exacta con su cuenta `M0-coder` en https://github.com/M0-coder/DESSET/issues/29#issuecomment-6911006310 . API GitHub comprobó `author_association=OWNER`, cuerpo exacto y pertenencia al issue #29. La publicación de Cloudflare aún requiere controles y despliegue manual separados.
