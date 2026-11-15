# DESSET — SEC-FINAL-01 · Política ASI de integración segura

**Objetivo:** auditar la publicación de `desset.lat` sin alterar el diseño aprobado. La fuente de trabajo sigue en `audit/prelaunch-02-final-gates`; los cambios de seguridad se proponen únicamente en `audit/sec-final-01-asi` y se revisan en PR separado.

**Referencia de identidad:** `0d2b3f8d6d229b6f9a1fb3b23550826f832784f3`.

### Inmutables
- No alterar: `index.html` (BODY/HEAD), `styles.css`, `src/app.mjs`, `src/content.mjs`, `assets/`, `vercel.json`.
- No modificar la web publicada, la DNS de `desset.lat`, ni la rama `main`.
- Controles ya existentes: `approved-baseline-gate.mjs`, CodeQL, security-audit, contract tests y Chrome.
- El repositorio de GitHub **no tiene rulesets activos observados** y `main.protected=false`. Un script dentro del propio repo NO equivale a protección administrativa.

### Modificaciones de seguridad
1. Empaquetado: `DESSET_PACKAGE_MODE=LOCAL_TEST_ONLY` reemplaza la variable engañosa `DESSET_RELEASE_APPROVED`. El script solo produce archivos locales y rechaza modos de producción.
2. Seis pruebas negativas comprueban rechazo ante modo ausente, modo inválido, dominio ajeno, protocolo HTTP, ruta extra y variable antigua. **No declaran que el registrador ya entregó el dominio.**
3. Auditoría de navegador sobre el resultado construido `dist/` además de la fuente en diez resoluciones; comprobación de metadatos de indexación.
4. Registro de evidencia: CI registra SHA, estado, logs y capturas; la captura producida por CI NO sustituye comprobación de producción.

### Configuración administrativa todavía obligatoria (no ejecutable por el conector)
GitHub → repositorio `M0-coder/DESSET` → Settings → Rules → Rulesets → New branch ruleset. Reglas propuestas:
- Target `main`, Active.
- Require a pull request before merging.
- Require successful checks **DESSET Web Checks / verify** y **DESSET CodeQL / analyze** (ver nombres exactos en GitHub).
- Require conversation resolution y branch up to date.
- Block force pushes y branch deletions.
- No bypass salvo justificación expresa. Con fundador único, el número de reviews exigidos depende de contar con un reviewer independiente y de las capacidades del plan.
- Verificar reglas efectivas por API/UI con evidencia de fecha, no inferir protección por documentación.

**Dependencias para publicación**: compra real y titularidad de `desset.lat`, copyright/marca, accesibilidad con zoom y lector de pantalla, rendimiento del hosting y plan de rollback.

### Doctrina ASI v3.3 aplicada
- `control_result = PASS` solo para una propiedad medida y un SHA preciso.
- `branch_protection = FAIL` para el estado observado: `main.protected=false` y rulesets vacíos. Una futura protección queda `NOT_VERIFIED` hasta que el administrador la configure y se vuelva a observar.
- `candidate_decision = BLOCKED` para la publicación si queda una condición crítica incumplida.
- Auditoría independiente externa distinta del creador; este PR es **autoverificación**, no certificación independiente.

Fuentes: Notion «00 — Doctrina ASI de Ingeniería Verificable v3.3» y «04 — ASI Verifiable Engineering — Runbooks y autorizaciones».
