# DESSET INTEGRATION-01 — preparación segura (NO DEPLOY)

Fecha: 2026-11-20, Perú. **Estado: DRAFT / NO-GO**.

## Referencias congeladas

- Origen visual: `M0-coder/DESSET-prime`, [PR #11](https://github.com/M0-coder/DESSET-prime/pull/11), SHA `fcac31dafa51c80b6d03ab8569cb7cef211c3719`.
- CI del candidato: [run #44838906681](https://github.com/M0-coder/DESSET-prime/actions/runs/44838906681), artifact #14680420212.
- Baseline oficial: `M0-coder/DESSET` SHA `9f48d62cdadb43135fc9c2072cdc9e31f695c9ab`.
- Producción observada: Cloudflare Pages `desset-institucional`, deployment `b107eff2-6511-4e04-a780-fbd28e93e4e9`. Revalidar justo antes de cualquier integración.

## Entregables

- `config/prime-candidate-lock.json`: SHA-256 **congelado fuera del artefacto** para `dist/site-manifest.json`, que a su vez enumera hashes y tamaños de sus 30 archivos (2.376.763 bytes).
- `scripts/prime-integration-preflight.mjs`: comparación de la integridad del paquete, detección de cambios de SHA, archivos extra, symlinks, GLB malformados, CSP, noindex, fotos independientes, aplicaciones no publicadas y canales aún pendientes.
- `tests/prime-integration-preflight.test.mjs`: cinco pruebas positivas y negativas.

## Ejecutar sin efectos externos

Descargar de GitHub Actions el artefacto exacto #14680420212 del PR #11, extraerlo a una ruta local y usar:

```bash
node --test tests/prime-integration-preflight.test.mjs
node scripts/prime-integration-preflight.mjs /ruta/absoluta/artefacto/dist fcac31dafa51c80b6d03ab8569cb7cef211c3719
```

La comprobación del artefacto de referencia debe entregar `integrity: PASS`, **pero siempre `release_decision: NO-GO` y `release_authorized: false`**. El SHA-256 del manifiesto es una comprobación de integridad, no una firma de identidad. Verificar además procedencia de los artefactos de GitHub.

## Pendientes antes del cambio de web

1. **INTEGRATION-02:** adaptar en otro PR el contrato oficial de 13 archivos y sus controles de release para el paquete Prime de 30, incluyendo `_headers`, `robots.txt`, `sitemap.xml`, canonical y cache busting. No copiar `dist` sobre producción.
2. Autorizar la nueva experiencia visual y el logo/fotografías por SHA; acreditar titulares/derechos.
3. Verificar canal empresarial y política de privacidad. Los perfiles de Instagram, X y Facebook están marcados `pending`.
4. Ejecutar SAST/SCA/SBOM, licencias, doble build comparable, cobertura del código productivo, mutation testing ampliado, auditoría accesibilidad manual y pruebas Android/Safari físicos.
5. Ensayar staging aislado, smoke HTTP, redirecciones/rutas, CSP, noindex según política aprobada y rollback del deployment anterior.

**Excluido:** PR #12 PERF-01, sin mejora probada de rendimiento. El PR #13 es documentación forense de referencia y no forma parte de la web nueva.

**Gobierno:** este PR no cambia `index.html`, estilos, fotos, CI de publicación, Cloudflare, DNS, ramas existentes ni el sitio oficial. Sin merge, sin despliegue y sin releases. Merge y publicación requieren autorizaciones separadas por SHA exacto.
