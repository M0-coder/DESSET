# DESSET-CF-CI-01 — Publicación controlada de GitHub a Cloudflare Pages

**Estado:** propuesta implementada en rama `audit/cloudflare-ci-deployment-01`, **sin habilitar publicación ni modificar producción**. Fecha: 15/11/2026.

## Arquitectura y decisión

- Repositorio fuente: `M0-coder/DESSET`, rama protegida `main`. El candidato comprobado anterior es `a1ceeb457a8829a05d75b554387930bd9c840fa8`.
- Proyecto existente y en uso: Cloudflare Pages `desset-institucional`; `desset.lat` y `www.desset.lat` ya están activos. No crear otro proyecto ni modificar DNS ni Vercel.
- **Cloudflare Direct Upload no puede convertirse a integración Git de Pages in situ.** Usar GitHub Actions para construir el paquete estático, validarlo y enviarlo con `cloudflare/wrangler-action` al proyecto existente. Referencia: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- Fuente GitHub: `main`. Rama de destino Cloudflare: `release-approved` (establecida ya en Pages); `--branch=release-approved` selecciona producción en **Cloudflare**, no requiere crear una rama de GitHub con ese nombre.
- Artifact: `dist-cloudflare-release-candidate/` (11 archivos allowlisted, HTML de producción con canonical/robots correctos, JS y CSS existentes, PNG original, SVG, `_headers`, sitemap). La carga como static assets deja de usar el módulo `_worker.js` actualmente publicado.
- **El diseño aprobado permanece congelado por `scripts/approved-baseline-gate.mjs`.** Modificaciones intencionales al diseño requieren autorización, cambios al contrato de integridad y pruebas, no quitar el guard.

## Seguridad de GitHub Actions

Workflow: `.github/workflows/cloudflare-pages-production.yml`.

1. Solo ejecuta publicación **MANUAL** desde `refs/heads/main`: **Actions → DESSET - Cloudflare Pages Production → Run workflow** desde `main`, introducir exactamente `PUBLICAR_DESSET`. El workflow no contiene evento `push` ni escucha una variable `DESSET_AUTO_DEPLOY`: incluso si tal variable existiera, **no podría activar el despliegue automático**.
2. Instala Node 22, ejecuta validación estática, pruebas unitarias, chequeo de seguridad, smoke mutation, cobertura diagnóstica, candado visual y pruebas negativas.
3. Construye el paquete en modo `LOCAL_TEST_ONLY` **sin credenciales**; verifica hashes SHA-256 y 11 rutas permitidas; ejecuta auditorías Chrome de fuente y de artefacto.
4. Almacena manifiesto SHA-256/capturas como artefactos de GitHub Actions durante 30 días.
5. Comprueba token secreto, cuenta, proyecto y rama Cloudflare **después de la construcción**.
6. Publica `pages deploy dist-cloudflare-release-candidate --project-name=desset-institucional --branch=release-approved --commit-hash=<SHA exacto>`.
7. Verifica por API que la versión de producción es el SHA esperado y `uses_functions=false`, y hace smoke HTTPS/404/robots/sitemap/logo idéntico/CSP.

El workflow no se ejecuta en PR externos. Tiene permisos GitHub mínimos (`contents: read`, `deployments: write`), sin auto-merge ni borrado de ramas, y `concurrency` evita dos promociones simultáneas. Las acciones están fijadas a SHA y Wrangler a versión explícita.

## Configuración manual pendiente (no enviar tokens al chat)

1. Crear un **API Token de Cloudflare de permisos mínimos**: Cloudflare → My Profile → API Tokens → Create Token → Custom Token; **Account → Cloudflare Pages → Edit**, limitarlo a la cuenta que aloja el proyecto. No dar permisos de DNS ni de zonas.
2. Abrir https://github.com/M0-coder/DESSET/settings/environments y preparar el entorno `desset-production` (con control de aprobaciones si el plan/organización lo permiten).
3. En el entorno `desset-production` guardar un **environment secret** llamado `CLOUDFLARE_API_TOKEN` con el token. Alternativamente, usar Repository Actions Secret https://github.com/M0-coder/DESSET/settings/secrets/actions (preferir entorno).
4. No se necesita pegar el Account ID como secreto: el workflow usa el identificador de cuenta **no confidencial** ya verificado `5a1fbee5f06b8dcec986caa4e080c8d9`.
5. Tras la revisión y los checks exitosos, integrar el PR de este workflow en `main` conforme a la protección de rama. **No fusionar simultáneamente el PR #13** sin resolver la superposición de commits.
6. Toda ejecución de producción debe ser **manual** con `PUBLICAR_DESSET`; inspeccionar artefactos y comprobar `https://desset.lat/` y `https://www.desset.lat/`. Para introducir auto-deploy en el futuro se requiere **otro PR explícito y una autorización independiente**; crear `DESSET_AUTO_DEPLOY` no hará nada por sí solo.

**No se ha generado ni conocido un API Token en este trabajo.** No aceptar credenciales por DM ni en commits, issues o capturas.

## Reversión

Estado vivo antes de esta propuesta:
- Pages producción `313b15bc-4621-48f6-910b-00ffe2be0d54` (Worker que sirve HTML/CSS/JS y solicita el PNG a GitHub).
- Si el nuevo deploy no cumple los checks, el job falla y no autoriza declarar éxito. Si la nueva producción carga incorrectamente, **Cloudflare Pages → Deployments → All deployments → menú de la versión anterior → Rollback to this deployment**, confirmar y verificar HTTP.
- El rollback de Pages no requiere cambiar los nameservers ni borrar registros. Confirmar que el historial conserve el deployment anterior antes de activar el workflow.
- Instrucciones oficiales: https://developers.cloudflare.com/pages/configuration/rollbacks/

## Calidad y alcance

La publicación de esta web estática **no prueba** seguridad de apps Customer/Business/Rider/Control, backend, RBAC o pagos. El reporte de cobertura es parcial, el mutation test son micro-mutaciones cromáticas, y el control real 200%/400% y lectores de pantalla sigue pendiente.

**NO-GO actual para desplegar mediante este workflow** hasta: PR aprobado + checks + secreto de entorno + autorización de la primera publicación + verificación de rollback. No se ha cambiado `desset.lat` durante la creación de este archivo.
