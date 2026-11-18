# CF-WEB-ANALYTICS-01 — Estado observado y antecedentes de preparación

> **Actualización observacional 17/11/2026 — sin autorización implícita.** Esta página contiene un borrador histórico (más abajo), que describe una configuración anterior. **El estado actual debe leerse en esta sección**, no en las instrucciones originales de preparación.

## Estado contrastado al 17/11/2026

- Cloudflare zona `desset.lat`: `settings/rum.value = on`; Web Analytics Site existente con `auto_install = true` y `ruleset.enabled = true`. **La afirmación histórica de que la analítica estaba apagada ya no describe la configuración observada.**
- Proyecto Pages `desset-institucional`: despliegue de producción `b118e080-24c8-412a-8ae7-ab52af7506f3` (SUCCESS), commit `c27b11586ba7dfbd6a02a65087299a261d5173d0`. El `main` posterior `0f7fda9568de3749e5bd2b38d74ee4ce798f4991` solo corrige la comprobación de `curl` del workflow e incorpora pruebas; **no es un nuevo despliegue**.
- `scripts/cloudflare-headers.mjs` declara CSP compatible con el beacon automático y `connect-src 'self'`. **No hay evidencia independiente todavía** de la inyección real, del estado de envío `/cdn-cgi/rum`, de las cabeceras HTTP servidas ni de volumen de datos recolectados.
- **Autorización de activación original: NOT_VERIFIED.** La presencia de RUM activo en la API no demuestra quién lo activó ni que exista autorización previa. No cambiar ni desactivar la zona automáticamente.
- **Privacidad: revisión P1.** Reconciliar inventario de tratamiento, información al visitante y condición jurídica aplicable antes de emitir conformidad. No afirmar incumplimiento sin hechos suficientes.
- **Acción segura:** auditar en lectura la configuración y el historial autorizativo; si es necesario cambiar algo, presentar impacto, alternativa, rollback y obtener autorización expresa separada. No cambiar DNS, diseño, código público ni publicar por esta actualización.

## Archivo histórico de propuesta (no describe el estado actual)

**Estado de este bloque histórico:** PROPUESTA original / NO-GO para despliegues sin autorización. La configuración de RUM fue observada como activa el 17/11/2026 (véase la actualización anterior). No modificar RUM, crear sitios o mover DNS desde este documento.

## Referencia canónica

- Web oficial única: https://desset.lat/
- Cloudflare Pages existente: `desset-institucional` (rama operativa `release-approved`).
- Baseline de producción no sustituible: despliegue `c29ec7a7-806a-4a92-b326-e1a42c7dc1fe`, commit `841fb1d5ba44022237fe1534926c6c3a5ab564f5`. Mantener rollback.
- PR histórico SEO #28 en `main` no implica nueva publicación ni activación de analítica.
- La versión fuente `index.html` (Bento original), estilos, scripts visuales, ilustraciones, textos y manifiesto aprobado permanecen **intactos**.

## Problema descrito por el borrador original (histórico)

El borrador inicial registraba Cloudflare Web Analytics como apagado y sin sitios Web Analytics asociados; **esa descripción quedó obsoleta**. La CSP original tiene `script-src 'self'` tanto en el HTML fuente como en las cabeceras; sin compatibilidad preparada, la inyección del beacon puede ser bloqueada.

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

## Procedimiento de verificación planteado en la propuesta original (histórico)

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
