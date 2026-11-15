# DESSET-LAUNCH-GATE-01 — Cierre de accesibilidad y acceso restringido

**Revisión 15-11-2026 · Base SHA:** `f5484e7ed9e5af0a69ba6fdbe4331f6f784b06be`.
**Decisión de publicación:** `BLOCKED` — no se autoriza merge, DNS, despliegue público ni indexación.

## 0. Alcance ASI
Arquitectura, compilación/empaquetado, pruebas unitarias e instrumentadas, cobertura, análisis estático, calidad CI, seguridad, reproducibilidad SHA, micro-mutation testing, deuda técnica y evidencia de ejecución. Sin cambios en HTML/CSS/SVG/iconos/JS de producto aprobados. Los nuevos controles auditables no certifican WCAG.

## 1. Bloqueo Cloudflare Access — FAIL observado
- Cloudflare cuenta `5a1fbee5f06b8dcec986caa4e080c8d9` (solo referencia administrativa interna). Proyecto `desset-institucional` en Pages, rama `release-approved`, sin source Git, sin custom domains, sin deploys, sin zona `desset.lat`.
- Consulta API `GET /accounts/{account_id}/access/apps` devolvió **HTTP 403** con `access.api.error.not_enabled`. No hay Access habilitado para comprobar ni proteger el proyecto.
- **Nunca desplegar a `desset-institucional.pages.dev` antes de configurar Access**. Cloudflare indica que los previews son públicos por defecto; `noindex` y robots no son autenticación.
- Cloudflare Pages **Settings → General → Enable access policy** protege previews, pero **no** automáticamente el hostname raíz `desset-institucional.pages.dev`. Según la documentación Cloudflare, hay que configurar una aplicación Access exacta para hostname raíz sin wildcard y otra para `*.desset-institucional.pages.dev` mediante opciones del dashboard. Requiere antes activar Zero Trust/Access en la cuenta.
- Política deseada: allow solo miembros/identidades designadas (primero el propio fundador), default deny, sin bypass de visitantes anónimos; 2FA, sesión corta y pruebas de acceso no autenticado en ambos nombres. Verificar la configuración efectiva antes de cualquier ensayo, no confiar en que exista la aplicación.
- La activación administrativa de Zero Trust/Access puede requerir UI, elección de subdominio de equipo o aceptación de términos/plan; **no se ha realizado**. No se agregaron rutas, dominios o recursos públicos por API.

## 2. Accesibilidad — evidencia que sí se puede automatizar
- Chrome en 13 resoluciones × fuente / dist Vercel / stage Cloudflare con métricas de clipping, scroll condicionado a alturas <=400, cambio de vista, diálogos y navegación por teclado.
- Comprobaciones adicionales: idioma, nombres de controles nativos, relación `aria-labelledby`/`aria-describedby` del diálogo, recuperación de foco con Escape, contraste de los cuatro rótulos de rol móvil, **ejecución observable de `src/app.mjs` mediante Chrome DevTools Profiler**.
- Este protocolo *no* equivale a zoom de navegador real 200/400%, lector de pantalla, prueba WCAG AA, contraste de cada píxel ni cobertura total del JavaScript. Estas pruebas quedan `NOT_VERIFIED` y necesitan ejecución independiente de usuario/QA.
- El contrato `npm run launch:guard` falla si se introduce una orden de deploy al CI, se retira `noindex` en fuente o se rompe la separación del modo compacto.
- Pruebas negativas de Cloudflare-stage y hash de artefactos permanecen activas.

## 3. Propiedad intelectual — Notion DESSET-IP-01
[DESSET-IP-01](https://app.notion.com/p/413eb559c05c815b96e4f921cbab6b32) es un borrador de análisis, no un registro marcario ni una cesión firmada. Marca DESSET vs semejanzas, Figma, logotipo, software, materiales e inventario de autores aún requieren evidencia. Diferenciar denominación social SUNARP de registro/uso de marca Indecopi. `NOT_VERIFIED` para clearance y cesión; no presumir que la compra del dominio otorga derecho sobre marca.

## 4. Identidad integrable y publicación separadas
Cadena de PR en borrador: #7 main -> #8 #7 -> #9 #8 -> #10 #9 -> #11 #10. **No están fusionados** y `main` sigue siendo antiguo. CI de PR hacia `main` se puede ejecutar para auditoría, pero tras retarget a rama intermedia deben repetirse checks del árbol final integrado antes de un merge. Las reglas de GitHub para `main` no protegen automáticamente las ramas intermedias.
- Compilar solo artefacto con lista blanca. Verificar hashes, content-security-policy/cabeceras **aplicadas** a HTTP, no solo declaradas.
- Artefacto staging conserva noindex. La eventual producción (SEO y otros metadatos) debe ser un **artefacto distinto** autorizado por SHA, digest y método de despliegue manual o CI controlada. Ningún script de esta rama despliega.
- Antes de GO: asegurar Access en hosting de prueba, revisión zoom real y lector, revisión de derechos/claims, escoger SHA/release, ensayar retirada, confirmar dominio, NS/MX/SPF/TXT y rollback DNS. El primer rollback realista es retirar el dominio público y restaurar DNS Namecheap (con posible indisponibilidad); Bento V1 y antigua producción Vercel **no** son rollback aptos.

## 5. Matriz final
- PREP: PASS si CI y pruebas puntuales pasan en SHA exacto.
- ACCESS: FAIL (API 403 Access no habilitado).
- PRODUCT NORMAL VISUAL: PASS solo si comparación de capturas normales y candado original sigue aprobada.
- BROWSER JS EXECUTION: PASS si Profiler demuestra rangos ejecutados.
- ZOOM REAL / SCREEN READER: NOT_VERIFIED.
- IP / RIGHTS: NOT_VERIFIED.
- TLS + HTTP HEADERS + ROLLBACK ON CUSTOM DOMAIN: NOT_VERIFIED.
- `candidate_decision = BLOCKED` hasta cierre explícito y autorización de fundador.

**Fuentes:** [Documentación Cloudflare previews](https://developers.cloudflare.com/pages/configuration/preview-deployments/), [Known Issues Access](https://developers.cloudflare.com/pages/platform/known-issues/), [Notion DESSET-IP-01](https://app.notion.com/p/413eb559c05c815b96e4f921cbab6b32).
