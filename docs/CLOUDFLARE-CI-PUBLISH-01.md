# DESSET-CF-CI-01 — Publicación controlada de GitHub a Cloudflare Pages

**Estado actual (15/11/2026):** web estática publicada desde `main=202401702b1f3955b779f63176d9c08524dbc7a9`, deployment Cloudflare `089e9ed3-502c-451e-8da7-8906670e469d`, `uses_functions=false`. El **endurecimiento de herramientas propuesto en PR correctivo separado NO está fusionado ni publicado**.

## Arquitectura y decisión

- Repositorio fuente: `M0-coder/DESSET`, rama protegida `main`. El candidato comprobado anterior es `a1ceeb457a8829a05d75b554387930bd9c840fa8`.
- Proyecto existente y en uso: Cloudflare Pages `desset-institucional`; `desset.lat` y `www.desset.lat` ya están activos. No crear otro proyecto ni modificar DNS ni Vercel.
- **Cloudflare Direct Upload no puede convertirse a integración Git de Pages in situ.** Usar GitHub Actions para construir y validar el paquete estático y enviarlo al proyecto existente con Wrangler CLI instalada en un directorio temporal fuera del checkout (en el correctivo propuesto). Referencia: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- Fuente GitHub: `main`. Rama de destino Cloudflare: `release-approved` (establecida ya en Pages); `--branch=release-approved` selecciona producción en **Cloudflare**, no requiere crear una rama de GitHub con ese nombre.
- Artifact: `dist-cloudflare-release-candidate/` (11 archivos allowlisted, HTML de producción con canonical/robots correctos, JS y CSS existentes, PNG original, SVG, `_headers`, sitemap). La carga como static assets deja de usar el módulo `_worker.js` actualmente publicado.
- **El diseño aprobado permanece congelado por `scripts/approved-baseline-gate.mjs`.** Modificaciones intencionales al diseño requieren autorización, cambios al contrato de integridad y pruebas, no quitar el guard.

## Seguridad de GitHub Actions

Workflow: `.github/workflows/cloudflare-pages-production.yml`.

1. Solo ejecuta publicación **MANUAL** desde `refs/heads/main`: **Actions → DESSET - Cloudflare Pages Production → Run workflow** desde `main`, introducir exactamente `PUBLICAR_DESSET`. El workflow no contiene evento `push` ni escucha una variable `DESSET_AUTO_DEPLOY`: incluso si tal variable existiera, **no podría activar el despliegue automático**.
2. Instala Node 22, ejecuta validación estática, pruebas unitarias, chequeo de seguridad, smoke mutation, cobertura diagnóstica, candado visual y pruebas negativas.
3. Construye el paquete en modo `LOCAL_TEST_ONLY` **sin credenciales**; verifica hashes SHA-256 y 11 rutas permitidas; ejecuta auditorías Chrome de fuente y de artefacto.
4. Almacena manifiesto SHA-256/capturas como artefactos de GitHub Actions durante 30 días.
5. Instala **Wrangler `4.162.0` fijado** fuera del repositorio, ejecuta `npm audit --audit-level=high` sin credenciales, comprueba `git status --porcelain` limpio y conserva el reporte de auditoría y el lock temporal en artefactos CI. Si falla, **no procede publicación**. Después comprueba token secreto, cuenta, proyecto y rama Cloudflare.
6. Publica `pages deploy dist-cloudflare-release-candidate --project-name=desset-institucional --branch=release-approved --commit-hash=<SHA exacto>`.
7. Verifica por API que la versión de producción es el SHA esperado y `uses_functions=false`, y hace smoke HTTPS/404/robots/sitemap/logo idéntico/CSP.

El workflow no se ejecuta en PR externos. Tiene permisos GitHub mínimos (`contents: read`, `deployments: write`), sin auto-merge ni borrado de ramas, y `concurrency` evita dos promociones simultáneas. Las acciones de checkout/setup/upload están fijadas a SHA y la instalación CLI a la versión exacta `4.162.0` (pendiente de integrar). Una instalación de Wrangler dentro del checkout fue reproducida como causa de modificaciones de `package.json` y `package-lock.json`, por lo que el correctivo la aísla.

## Configuración manual pendiente (no enviar tokens al chat)

1. Crear un **API Token de Cloudflare de permisos mínimos**: Cloudflare → My Profile → API Tokens → Create Token → Custom Token; **Account → Cloudflare Pages → Edit**, limitarlo a la cuenta que aloja el proyecto. No dar permisos de DNS ni de zonas.
2. Abrir https://github.com/M0-coder/DESSET/settings/environments y preparar el entorno `desset-production` (con control de aprobaciones si el plan/organización lo permiten).
3. En el entorno `desset-production` guardar un **environment secret** llamado `CLOUDFLARE_API_TOKEN` con el token. Alternativamente, usar Repository Actions Secret https://github.com/M0-coder/DESSET/settings/secrets/actions (preferir entorno).
4. No se necesita pegar el Account ID como secreto: el workflow usa el identificador de cuenta **no confidencial** ya verificado `5a1fbee5f06b8dcec986caa4e080c8d9`.
5. El workflow original ya se integró por PR #16 y la web fue publicada. Para cualquier nuevo correctivo se requiere revisión, checks y **autorización expresa de Squash Merge**; no reutilizar instrucciones del PR #13, ya cerrado como histórico.
6. Toda ejecución de producción debe ser **manual** con `PUBLICAR_DESSET`; inspeccionar artefactos y comprobar `https://desset.lat/` y `https://www.desset.lat/`. Para introducir auto-deploy en el futuro se requiere **otro PR explícito y una autorización independiente**; crear `DESSET_AUTO_DEPLOY` no hará nada por sí solo.

El token se comunicó como configurado y el despliegue manual anterior funcionó; el conector GitHub no puede leer su valor ni verificarlo directamente. No aceptar credenciales por DM ni en commits, issues o capturas.

## Reversión

Estado confirmado:
- Pages producción actual `089e9ed3-502c-451e-8da7-8906670e469d`, estática, exitosa y sin Functions.
- Respaldo previo `313b15bc-4621-48f6-910b-00ffe2be0d54`, con Pages Functions, conservado y disponible para rollback.
- Si el nuevo deploy no cumple los checks, el job falla y no autoriza declarar éxito. Si la nueva producción carga incorrectamente, **Cloudflare Pages → Deployments → All deployments → menú de la versión anterior → Rollback to this deployment**, confirmar y verificar HTTP.
- El rollback de Pages no requiere cambiar los nameservers ni borrar registros. Confirmar que el historial conserve el deployment anterior antes de activar el workflow.
- Instrucciones oficiales: https://developers.cloudflare.com/pages/configuration/rollbacks/

## Calidad y alcance

La publicación de esta web estática **no prueba** seguridad de apps Customer/Business/Rider/Control, backend, RBAC o pagos. El reporte de cobertura es parcial, el mutation test son micro-mutaciones cromáticas, y el control real 200%/400% y lectores de pantalla sigue pendiente.

**Dictamen:** web operativa en producción (GO); **cierre de seguridad del runner pendiente** hasta demostrar eliminación de las cuatro alertas altas y `commit_dirty=false` en una publicación posterior. [Auditoría reproducible PR #20](https://github.com/M0-coder/DESSET/pull/20): Wrangler 4.136.3 → 4 HIGH; Wrangler 4.162.0 → 0 alertas npm en el entorno auditado; instalación dentro de clon modifica `package.json`, `package-lock.json` y `node_modules/`. La corrección no se publica ni se fusiona sin autorización.
