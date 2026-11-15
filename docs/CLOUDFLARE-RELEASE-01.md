# DESSET-CF-RELEASE-01 — Artefacto Cloudflare compatible en simulación local

**Fecha:** 2026-11-14 (Perú) / ejecución UTC 15-11-2026. 
**Base:** PR #11 `45502903b7521b774821483f717003642ff935e6`.
**Decisión:** preparación técnica, PUBLICACIÓN **NO-GO**.

## Por qué existe
La preparación del PR #10 produce un paquete de preview indexación prohibida. Cloudflare Pages requiere un artefacto diferente para la web institucional pública. Éste es un ensayo de **forma de release**, no una publicación ni una autorización para subirlo.

## Contrato
- Se toma `dist/` construido por `release:package` con `DESSET_PACKAGE_MODE=LOCAL_TEST_ONLY` y `DESSET_OFFICIAL_ORIGIN=https://desset.lat`.
- Se copia allowlist estática **11 archivos** a `dist-cloudflare-release-candidate/` incluyendo `_headers`, `robots.txt` y `sitemap.xml`; se excluye `vercel.json`, cualquier archivo privado y resto de raíz.
- Mantiene canon `https://desset.lat/`, metadatos de compartir, robots públicos y sitemap. **No cambia** el body HTML, el CSS aprobado, símbolos, imágenes, palabras ni código JavaScript de aplicación.
- Requiere `DESSET_CF_RELEASE_MODE=LOCAL_TEST_ONLY`. Si hay `DESSET_RELEASE_APPROVED` o tokens Cloudflare, falla. No hay API call, HTTP upload ni deploy en el script. Artefacto no está autorizado para difusión, aunque sea técnicamente indexable si alguien lo subiera manualmente.
- `_headers` declara CSP estricta, bloqueo de framing, nosniff, política de referencias y permisos. Su implementación real **no puede comprobarse** en este CI sin despliegue autorizado. No añadir HSTS-preload ni redirects en ausencia de pruebas TLS finales.
- CI realiza pruebas negativas, integridad SHA-256 del paquete contra fuente `dist/`, inventario de ficheros, reglas SEO y Chrome en 13 resoluciones. El archivo `reports/cloudflare-release-manifest.json` declara `deployment_authorized:false`, `candidate_head`, `checkout_sha` y hashes. No transferir a producción un manifest no firmado por control humano.

## Controles pendientes
1. Declaración expresa de autorización para integraciones y despliegues. PR #7→#8→#9→#10→#11→#12 en borrador, ningún merge.
2. Derechos de marca y materiales en [DESSET-IP-01](https://app.notion.com/p/413eb559c05c815b96e4f921cbab6b32): no hay clearance registral final ni cesión documentada.
3. QA independiente real de zoom 200/400%, lector de pantalla y accesibilidad completa. Chrome viewport/CSP checks no certifican WCAG.
4. Inventariar DNS Namecheap incluidos MX/SPF/DKIM y decidir quién gestiona DNS antes de mover NS a Cloudflare. La compra del dominio no constituye permiso de publicación.
5. Pruebas HTTPS, CSP headers reales, 404, SEO y rollback desde Cloudflare antes de go-live.
6. Zero Trust Access no está habilitado y pide datos de pago; no introducir tarjeta ni contratar para pruebas privadas. Usar QA local / artifact. Para publicación pública de un sitio ya aprobado **Access no es requisito**, pero la publicación debe ser explícitamente autorizada.

**Dictamen final:** OFFLINE_BUILD_PASS solo si CI y CodeQL final pasan; LIVE_HTTP_NOT_VERIFIED; LEGAL_RIGHTS_NOT_VERIFIED; ACCESS_FOR_PRIVATE_PREVIEW_NOT_ENABLED; PUBLIC_RELEASE_NO-GO.
