# CF-WEB-ANALYTICS-01 — Preparación controlada y no publicada

**Estado:** PROPUESTA / NO-GO para despliegue sin autorización específica del propietario. No activar RUM ni crear un nuevo sitio ni mover DNS.

## Referencia canónica

- Web oficial única: https://desset.lat/
- Cloudflare Pages existente: `desset-institucional` (rama operativa `release-approved`).
- Baseline de producción no sustituible: despliegue `c29ec7a7-806a-4a92-b326-e1a42c7dc1fe`, commit `841fb1d5ba44022237fe1534926c6c3a5ab564f5`. Mantener rollback.
- PR histórico SEO #28 en `main` no implica nueva publicación ni activación de analítica.
- La versión fuente `index.html` (Bento original), estilos, scripts visuales, ilustraciones, textos y manifiesto aprobado permanecen **intactos**.

## Problema observado

Cloudflare Web Analytics está apagado y no existen Web Analytics Sites asociados. La CSP original tiene `script-src 'self'` tanto en el HTML fuente como en las cabeceras; sin compatibilidad preparada, la inyección del beacon puede ser bloqueada.

Documentación oficial:
- https://developers.cloudflare.com/web-analytics/get-started/
- https://developers.cloudflare.com/web-analytics/faq/
- https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/

## Cambio candidato (solo generador de paquete y gates)

Para el modo **automático de dominio proxied** de Cloudflare:

- Permitir únicamente `https://static.cloudflareinsights.com/beacon.min.js` además de `'self'` en `script-src`.
- Declarar explícitamente `connect-src 'self'` para envío a `https://desset.lat/cdn-cgi/rum`; **no** añadir `cloudflareinsights.com` a `connect-src`, que corresponde al modo manual.
- Sin `unsafe-inline`, `unsafe-eval`, `*`, etiquetas adicionales, cookies, GA4 o scripts insertados por el repositorio.
- Modificar la CSP del **paquete final** y de `_headers` con política común, nunca `index.html` fuente ni BODY. Ambos CSP se aplican por navegador y ambos deben permitir el beacon.
- `scripts/release-package-gate.mjs` debe comprobar que el BODY generado es **idéntico byte a byte** al original y que la fuente mantiene `noindex`; los gates del manifiesto y Cloudflare deben validar la CSP exacta.

## Verificación técnica — antes de integrar

1. `npm ci --ignore-scripts --no-audit --no-fund`.
2. `npm run check`, `npm run security:audit`, `npm run mutation:smoke`, `npm run test:coverage`.
3. `node scripts/approved-baseline-gate.mjs` y `node scripts/hosting-policy-gate.mjs`.
4. `DESSET_PACKAGE_MODE=LOCAL_TEST_ONLY DESSET_OFFICIAL_ORIGIN=https://desset.lat npm run release:package`, `node scripts/release-package-gate.mjs`.
5. `DESSET_CF_RELEASE_MODE=LOCAL_TEST_ONLY npm run cloudflare:release-candidate` y `npm run cloudflare:release-gate`; 11 archivos, hashes verificables, sin funciones, sin secrets.
6. Auditoría Chrome local (13 tamaños, navegadores e interacciones) más CodeQL.
7. Revisión de la política de privacidad y de categorías de datos capturados antes de activación pública.

## Secuencia posterior, cada etapa con autorización independiente

- **FASE A:** revisar PR, pruebas y evidencia. Autorizar squash merge por separado. Nunca auto-merge.
- **FASE B:** autorizar despliegue de CSP preparada (no activar analítica todavía); confirmar SHA publicado, 11/11 archivos, CSP en HTML y HTTP, funcionamiento del Bento, HTTPS, 200/404 y rollback.
- **FASE C:** autorizar explícitamente activación automática de Cloudflare Web Analytics en la zona existente; verificar que `/cdn-cgi/rum` responde y que navegador no muestra violaciones CSP. Comprobar datos de uso, sin prometer mediciones antes de su ejecución.
- **FASE D:** si hay cualquier regresión, desactivar analítica y restaurar despliegue anterior; declarar NO-GO. Nunca sustituir el proyecto ni crear una segunda web.

## Pendencias externas

- Google Search Console: requiere propiedad verificada con TXT exacto emitido por Google; la integración OpenSEO aún no presenta cuentas conectadas.
- Condiciones legales y privacidad definitivas: aún requieren revisión y datos empresariales reales; esta rama no publica ni altera documentos jurídicos.

**No se altera producción, DNS, la rama principal, la identidad visual ni se activa telemetría mediante este documento.**
