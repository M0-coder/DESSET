# DESSET-CF-PREFLIGHT-01 — Paquete Cloudflare Pages en ensayo local

**Fecha:** 15-11-2026. **Fuente:** PR #9 `c036fe2fe9a1292c974c951554bd70b2edb7f387`. **Decisión:** NO-GO para despliegue.

## Alcance
Arquitectura estática, compilación (empaquetado, sin transpilar), pruebas unitarias e instrumentadas, cobertura parcial, análisis estático, CI, seguridad, reproducibilidad por SHA-256, micro-mutation testing, deuda técnica y evidencia.

- Cloudflare: cuenta existente; proyecto `desset-institucional`, rama configurada `release-approved`, sin Git source, dominios ni despliegues.
- Generar solo `dist-cloudflare-stage/` con 10 entradas de lista blanca y archivo `reports/cloudflare-stage-manifest.json` de SHA-256. **El artefacto de staging nunca es un release**.
- El `index.html` **conserva** `noindex,nofollow` y no tiene canonical. `robots.txt` prohibe rastreo y `_headers` declara CSP, frame-ancestors, nosniff, DENY, Referrer-Policy, Permissions-Policy y X-Robots-Tag.
- `_headers` actúa sobre **archivos estáticos de Pages**; CI comprueba el contenido, **NO** la aplicación efectiva por HTTP. `robots.txt` y `noindex` no constituyen autenticación ni impiden acceder a una URL pública `.pages.dev`.
- No permitir Git integration automática en la versión de origen que todavía está en PR. No usar la producción antigua Vercel ni Bento V1.
- No cambiar `index.html`, `styles.css`, `styles-compact.css`, `src/`, `assets/` o narrativa. Los archivos de packaging y CI son el único alcance.

## Procedimiento local autorizado
1. `npm ci --ignore-scripts --no-audit --no-fund`
2. `npm run check && npm run security:audit && npm run mutation:smoke && npm run test:coverage`
3. `node scripts/approved-baseline-gate.mjs`
4. `npm run cloudflare:negative`
5. `DESSET_CLOUDFLARE_STAGE=LOCAL_TEST_ONLY npm run cloudflare:stage`
6. `npm run cloudflare:gate`
7. `DESSET_BROWSER_CLOUDFLARE=1 npm run browser:audit`
8. Comparar capturas de tamaños normales con la ejecución previa por SHA; conservar resultados de CI como evidencia. El artefacto puede descargarse para pruebas locales, **no se sube automáticamente**.

## Pendientes para autorización de publicación
- Validar visualmente capturas, zoom 200%/400%, lectores de pantalla y contraste.
- Resolver el control legal/marca y aprobar narrativa factual de los canales reales.
- Registrar un build de **producción distinto**: aprobar contenido y comportamiento SEO; no reutilizar el `dist` de Vercel sin adaptar cabeceras/headers de Cloudflare.
- Seleccionar exactamente el SHA final una vez integrados PR #7 → #8 → #9 → #10 con sus checks y evidencias; no hacer merges sin autorización.
- En Cloudflare, preparación de la zona `desset.lat` requiere analizar los registros actuales de Namecheap incluyendo MX/SPF; **no cambiar nameservers todavía**. Conectar apex a Pages requiere zona/nameservers gestionados por Cloudflare.
- Un despliegue a `.pages.dev` ya es **exposición pública** por defecto: primero aprobar un despliegue de prueba y su protección de acceso, o no desplegar.
- Ejecutar pruebas reales de TLS, redirects, status, cabeceras, 404, robots, sitemap, accesibilidad y rollback tras activación controlada. `candidate_decision=BLOCKED` hasta cerrar bloqueantes.
