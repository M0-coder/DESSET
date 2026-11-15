# DESSET — SEC-FINAL-01 · Política ASI de integración segura

> **Nota de vigencia — 15/11/2026:** este documento conserva la historia de la política anterior al lanzamiento. El estado operativo actualizado y los hashes aprobados están en [PRODUCTION-BASELINE-2026-11-15.md](PRODUCTION-BASELINE-2026-11-15.md). La web ya está publicada, el `main` está protegido y la publicación automática sigue prohibida. Las reservas jurídicas y de accesibilidad **no** se consideran cerradas.

**Objetivo histórico:** auditar la publicación de `desset.lat` sin alterar el diseño aprobado. La fuente de trabajo de aquella fase fue `audit/prelaunch-02-final-gates`; los cambios de seguridad se preparaban en `audit/sec-final-01-asi`. Esos nombres son referencias históricas, no ramas vigentes de publicación.

**Referencia de identidad:** `0d2b3f8d6d229b6f9a1fb3b23550826f832784f3`.

### Inmutables
- No alterar: `index.html` (BODY/HEAD), `styles.css`, `src/app.mjs`, `src/content.mjs`, `assets/`, `vercel.json`.
- No modificar la web publicada, la DNS de `desset.lat`, ni la rama `main`.
- Controles ya existentes: `approved-baseline-gate.mjs`, CodeQL, security-audit, contract tests y Chrome.
- **Estado actual (verificado por API 15/11/2026):** ruleset activo `DESSET-MAIN-PROTECTION` (`27293415`), aplicado a la rama por defecto. Exige PR, `verify` y `analyze` exitosos y actualizados, resolución de conversaciones, bloquea borrado y non-fast-forward; sin excepciones de bypass declaradas. `main.protected=true`. En el estado histórico inicial estos controles aún no estaban activos. Un script dentro del repo nunca equivale a protección administrativa.

### Modificaciones de seguridad
1. Empaquetado: `DESSET_PACKAGE_MODE=LOCAL_TEST_ONLY` reemplaza la variable engañosa `DESSET_RELEASE_APPROVED`. El script solo produce archivos locales y rechaza modos de producción.
2. Seis pruebas negativas comprueban rechazo ante modo ausente, modo inválido, dominio ajeno, protocolo HTTP, ruta extra y variable antigua. **No declaran que el registrador ya entregó el dominio.**
3. Auditoría de navegador sobre el resultado construido `dist/` además de la fuente en diez resoluciones; comprobación de metadatos de indexación.
4. Registro de evidencia: CI registra SHA, estado, logs y capturas; la captura producida por CI NO sustituye comprobación de producción.

### Configuración administrativa originalmente propuesta (implementada; conservar como checklist)
GitHub → repositorio `M0-coder/DESSET` → Settings → Rules → Rulesets → New branch ruleset. Reglas propuestas:
- Target `main`, Active.
- Require a pull request before merging.
- Require successful checks **DESSET Web Checks / verify** y **DESSET CodeQL / analyze** (ver nombres exactos en GitHub).
- Require conversation resolution y branch up to date.
- Block force pushes y branch deletions.
- El ruleset activo reporta `required_approving_review_count=0` y `bypass_actors=[]`. Eso **no equivale a revisión humana independiente**: revisar el requisito conforme a la estructura real del equipo y capacidades de GitHub.
- Verificar reglas efectivas por API/UI con evidencia de fecha, no inferir protección por documentación.

**Dependencias para publicación**: compra real y titularidad de `desset.lat`, copyright/marca, accesibilidad con zoom y lector de pantalla, rendimiento del hosting y plan de rollback.

### Doctrina ASI v3.3 aplicada
- `control_result = PASS` solo para una propiedad medida y un SHA preciso.
- `branch_protection = FAIL` **correspondía al estado inicial** sin rulesets; **al 15/11/2026 es `PASS`** para ruleset activo `DESSET-MAIN-PROTECTION` y `main.protected=true`, sin afirmar que el control sea inmutable a cambios administrativos.
- `candidate_decision = BLOCKED` fue una condición del prelaunch; la **publicación técnica institucional actual es `GO`** según GitHub/Cloudflare, sin que ello autorice operaciones comerciales ni certifique derecho marcario o titularidad de activos.
- Auditoría independiente externa distinta del creador; este PR es **autoverificación**, no certificación independiente.

Fuentes: Notion «00 — Doctrina ASI de Ingeniería Verificable v3.3» y «04 — ASI Verifiable Engineering — Runbooks y autorizaciones».
