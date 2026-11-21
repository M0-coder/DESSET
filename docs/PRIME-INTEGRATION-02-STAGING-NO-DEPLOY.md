# INTEGRATION-02 — ensayo aislado DESSET Prime (NO DEPLOY)

**Alcance:** arquitectura, compilación, pruebas unitarias e instrumentadas, cobertura, análisis estático, calidad CI, seguridad, reproducibilidad, mutation testing, deuda técnica y evidencia de ejecución.

**Origen bloqueado:** `M0-coder/DESSET-prime` PR #11, SHA `fcac31dafa51c80b6d03ab8569cb7cef211c3719`; artefacto CI #14680420212 de [run #44838906681](https://github.com/M0-coder/DESSET-prime/actions/runs/44838906681). Esta fase depende del PR oficial #63 / INTEGRATION-01. No se fusionan ni se alteran los archivos publicados.

## Qué hace

`scripts/prime-staging-package.mjs` exige `LOCAL_TEST_ONLY`, ejecuta el verificador de integridad y SHA del origen, y copia los **30 recursos originales** a una nueva carpeta temporal del sistema. Cada recurso vuelve a comprobarse por SHA-256 y tamaño después de copiarse. Añade exclusivamente tres archivos de **staging**, sin alterar el código de la página:

- `robots.txt` con `Disallow: /`.
- `sitemap.xml` vacío, sin URLs publicables.
- `404.html` mínima en español y con `noindex,nofollow`.

El resultado contiene **33 archivos**; no publica el `site-manifest.json` original. El registro `stage-audit.json` permanece FUERA del directorio público, con inventario, SHA, tamaños y `release_decision:NO-GO`. No hay integraciones con Cloudflare, DNS, Wrangler, GitHub Actions de publicación ni tokens. El HTML conserva `noindex,nofollow`, fotos, logo, tres modelos GLB, CSS/JS, aplicaciones no publicadas y canales sociales `pending`. **No genera canonical ni OG de producción.**

## Ejecutar localmente sin despliegue

```bash
node --test tests/prime-integration-preflight.test.mjs tests/prime-staging-package.test.mjs
DESSET_PRIME_STAGE_MODE=LOCAL_TEST_ONLY node scripts/prime-staging-package.mjs \
  /ABSOLUTE/PATH/PRIME_CI_ARTIFACT/dist fcac31dafa51c80b6d03ab8569cb7cef211c3719
```

## Evidencia observada antes del PR

- **12/12** tests Node combinados (5 INTEGRATION-01 y 7 INTEGRATION-02).
- Ejecutado sobre el paquete real del CI del candidato: **33 archivos / 2.377.264 bytes**, decisión **NO-GO**, sin indexación.
- Pruebas negativas: sin bandera de ensayo, SHA equivocado, foto adulterada y archivo extra bloqueados; dos copias equivalentes tienen hashes idénticos.
- Esto demuestra integridad de la copia y aislamiento, **no** un build completo del sitio desde fuente ni pruebas de dispositivos físicos.

## Bloqueos deliberados

El workflow de publicación oficial conserva su contrato de 13 archivos. **NO se ha adaptado ni autorizado** para aceptar este paquete de 33, por lo que INTEGRATION-02 no constituye una ruta de despliegue.

Antes de una propuesta de release deberán existir cambios y autorizaciones independientes: contrato final de activos, canonical/OG/robots/sitemap y política de indexación, CSP y cabeceras en Cloudflare, revisión de contacto y derechos, accesibilidad manual, Android/iOS físicos, SAST/SCA/SBOM, CI/rollback y conformidad visual asociada a un SHA exacto.

**GOBIERNO:** DRAFT · NO MERGE · NO AUTO-MERGE · NO DEPLOY · NO RELEASE · NO DNS · NO CLOUDFLARE. El proyecto `desset-institucional` y sus dominios continúan intocables.
