# DESSET-AUD-E2E-01 — Auditoría de extremo a extremo (web estática)

**Fecha del corte:** 14 de noviembre de 2026  
**Repositorio autorizado para escritura:** `M0-coder/DESSET`  
**Rama auditada:** `feat/bento-no-scroll-v1`  
**HEAD técnico que superó las pruebas:** `a91150d8867b08dcf5521306f50edccaab5550ad`  
**CI instrumentada:** [DESSET Web Checks #43641124393](https://github.com/M0-coder/DESSET/actions/runs/43641124393) — **SUCCESS**  
**Capturas y evidencia:** [artifact desset-browser-evidence #14132346482](https://github.com/M0-coder/DESSET/actions/runs/43641124393/artifacts/14132346482).  
**Versión de navegador comprobada:** Google Chrome 157.0.8103.50 en ubuntu-24.04.  
**Alcance estricto:** todo el repositorio de la *web institucional estática* y su pipeline de prueba/publicación. No se puede certificar una aplicación de reparto, un backend, pagos o procesos empresariales que este repositorio **no contiene**.

## 1. Dictamen ejecutivo

**APTO PARA CONTINUAR COMO PROTOTIPO PÚBLICO DE PRUEBA. NO APTO TODAVÍA PARA LANZAMIENTO EMPRESARIAL DEFINITIVO.**

El defecto visual solicitado —bandas grises exteriores causadas por ancho máximo de 1600 px, centrado y padding de `.site`— se eliminó. `.site` y `.board` ocupan exactamente la ventana en Chrome. Se conservaron las áreas, la cantidad de tarjetas, el espaciado negro entre ellas, los radios internos, el logo existente y las interacciones. Solo se ajustó la tarjeta de introducción en resoluciones compactas para impedir recortes.

El navegador encontró inicialmente **dos defectos reales de contenido recortado**, a 1280×720 y a 320×568. Se corrigieron y quedaron verdes en la segunda validación; posteriormente se amplió la matriz a diez tamaños, también aprobada.

## 2. Matriz de pruebas y evidencia

| Área | Evidencia ejecutada | Resultado y limitación |
| --- | --- | --- |
| Arquitectura | Revisión de `index.html`, `styles.css`, `src/app.mjs`, `src/content.mjs` y recursos | ✅ UI estática simple; estados y textos separados del DOM; sin backend |
| Compilación | No existe transpilación/compilador: distribución de HTML/CSS/ESM; `node --check` en JS | ✅ Sintaxis JS y carga real en Chrome; **build tradicional no aplicable** |
| Reproducibilidad | Node v22.16.0 en CI, `npm ci --ignore-scripts --no-audit --no-fund`, lockfile sin dependencias | ✅ Instalación sin dependencias externas; falta verificación de procedencia del runtime de Pages |
| Pruebas unitarias/estructurales | `node --test` | ✅ 8 superadas, 0 fallidas |
| Pruebas instrumentadas (Chrome) | `node scripts/browser-audit.mjs`; tamaño, bordes, ausencia de scroll, recortes internos, imágenes, diálogos, modos y vistas móviles | ✅ 10 resoluciones; pruebas de diálogos y capturas con evidencia |
| Sin scroll | `html`/`body` sin scroll, rectángulos de site y board contra viewport y scrollWidth/scrollHeight | ✅ En las resoluciones ensayadas |
| Activos | Firma PNG, SVG inspeccionado, carga `naturalWidth` en navegador | ✅ Carga íntegra; propiedad intelectual **sin cerrar** |
| Análisis estático | Node `--check`, pruebas de contrato y validación de activos/lockfile | ⚠️ Parcial: falta ESLint y SAST específico del nuevo repositorio |
| Seguridad | Inspección de cliente, CSP meta, `textContent` para inyectar texto, noindex, no formularios remotos, sin bibliotecas de terceros | ⚠️ Superficie reducida; sin escaneo automatizado de secretos, cabeceras de producción, DAST ni revisión independiente |
| Cobertura | No hay instrumentación de cobertura de líneas/ramas | 🔴 No medida; 8 pruebas no implican cobertura alta |
| Mutation testing | No existe configuración ni ejecución de mutantes en DESSET | 🔴 No ejecutado |
| Accesibilidad | Idioma español, botones, dialog nativo, cierre con botón/Escape, foco visible definido; pruebas de interacción con Chrome | ⚠️ Parcial: faltan revisión WCAG, zoom 200–400%, lector de pantalla y contraste automático |
| Performance/SEO | Recursos locales y HTML sin librerías; `robots=noindex,nofollow` | ⚠️ No hay Lighthouse/Core Web Vitals; `noindex` es deliberado durante pruebas |
| CI | Actions con checkout/setup-node anclados, Node v22.16.0, evidencia en artefactos | ✅ Ejecutado. ⚠️ No hay reglas obligatorias de branch protection en `main` |
| GitHub Pages | Despliegue desde rama de prototipo | ⚠️ El resultado de CI no demuestra por sí mismo que el servidor público ya sirve exactamente el nuevo commit; confirmar run de Pages y página final |
| Cumplimiento/branding | Expediente Notion/Drive y artefactos rastreables del repo antiguo | 🔴 No aprobados aún todos los requisitos para web oficial y marca |

### Resoluciones instrumentadas

- Desktop: **1920×1080, 1440×900, 1280×720, 1280×600, 1024×768**.
- Tablet: **768×900**.
- Móvil: **390×844, 375×667, 360×740, 320×568**.
- Móvil: se ensayaron **Inicio** y **Explorar** para el conjunto de tamaños móviles.
- En todos se comprobaron diálogos del contenido, botón de cierre, Escape, activación de tema, recursos de imagen y errores por recortes.

**Límite de la evidencia:** un conjunto discreto de viewports no certifica toda combinación de alto/ancho, densidad de pantalla, zoom, orientación o tecnología de asistencia.

## 3. Hallazgos y criticidad

| ID | Prioridad | Hallazgo | Estado | Acción |
| --- | --- | --- | --- | --- |
| UX-01 | P0 | Márgenes exteriores blancos/grises, borde negro no ocupa viewport | **CERRADO** | CSS de `.site`, `.board` y fondo del `body` corregidos |
| UX-02 | P1 | Recortes de texto de introducción a 1280×720 y 320×568; `overflow:hidden` los ocultaba | **CERRADO en matriz probada** | Breakpoints compactos, repetición de Chrome E2E |
| QA-01 | P1 | CI original solo comprobaba fuente y no representación real | **CERRADO en nivel básico** | Chrome CDP, capturas por viewport y comprobaciones de recortes |
| A11Y-01 | P1 | Tamaños mínimos de texto de 8–10 px en móvil compacto; conflicto potencial entre cero scroll y legibilidad/zoom | **ABIERTO** | Revisión WCAG; alternativa de paneles/vistas para 200% zoom, sin ocultar texto |
| BRAND-01 | P0 | Figma Pro documenta símbolo `277:5`, pero la aprobación de marca canónica figura abierta en Notion y falta cadena de derechos | **ABIERTO** | Confirmar identidad y licencias por titular/autor antes de publicación definitiva |
| LEGAL-01 | P0 | Denominación E.I.R.L., RUC, condiciones, privacidad y obligaciones sectoriales aún sin acreditación suficiente para operar | **ABIERTO** | Mantener sitio como prototipo; revisión legal antes de comercializar |
| CI-01 | P1 | `main` no estaba protegida al inspeccionar GitHub; CI podría omitirse en un push directo | **ABIERTO** | Configurar reglas de PR/review/checks cuando el fundador lo autorice |
| SEC-01 | P1 | CSP está en `meta`, no existe control demostrado de cabeceras HTTP como `frame-ancestors` | **ABIERTO** | Definir política y hosting compatible antes del dominio definitivo |
| SEC-02 | P1 | Falta CodeQL, secret scanning verificado y checklist OWASP como gates de CI | **ABIERTO** | Implementar análisis automático y revisar hallazgos |
| QA-02 | P1 | No hay pruebas de contraste WCAG, zoom, screen reader ni pixel-diff | **ABIERTO** | Añadir verificación instrumentada y revisión humana |
| QA-03 | P2 | Cobertura de ramas/líneas no medida; mutation testing pendiente | **ABIERTO** | Instrumentar lógica de cliente con tests medibles cuando se amplíe |
| OPS-01 | P1 | No existe verificación automatizada post-deploy que vincule respuesta HTTP pública a SHA | **ABIERTO** | Añadir release marker/health smoke después del despliegue, no antes |
| PERF-01 | P2 | Sin Lighthouse ni presupuesto de rendimiento medido | **ABIERTO** | Medir LCP, CLS, INP y transferencias con entorno estable |
| DOC-01 | P2 | El README anterior contenía escapes literales incorrectos en comandos Markdown | **CERRADO** | Markdown normalizado, documentación actualizada |

## 4. Seguridad: análisis de rutas de entrada

El código de cliente no expone credenciales ni contraseñas en los archivos examinados; tampoco contiene endpoints para pedidos, pagos, sesiones, bases de datos o ubicación. Los textos de las tarjetas se insertan por `textContent`, no mediante HTML arbitrario. Esto limita inyección por la capa de diálogo actual, **pero no constituye una prueba general de seguridad**.

No deben confundirse estas tres afirmaciones:

1. **No hay backend en este repositorio:** no corresponde afirmar autenticación, autorización, idempotencia, privacidad operativa o conciliación probadas.
2. **CSP y `noindex`:** ayudan a restringir ejecución/indexación; no ocultan una web pública ni sustituyen control de acceso.
3. **Código propietario previo:** el origen de archivos y sus hashes están documentados, pero la titularidad de todos los activos **no queda acreditada por GitHub**.

## 5. Deuda técnica y decisión de inversión

- Arquitectura ligera, mínimo coste y cero dependencias npm son adecuados para la etapa de prototipo.
- No añadir React, backend, CMS o analítica en esta fase sin caso de uso documentado.
- No prometer operación comercial, disponibilidad, cobertura, tiempos, soporte o seguridad real hasta tener evidencia.
- Antes de migrar a un dominio empresarial deben cerrarse **BRAND-01 y LEGAL-01**, después los gates de accesibilidad, seguridad y verificación post-deploy.
- Si el requisito cero scroll entra en conflicto con la lectura en zoom alto, priorizar acceso al contenido mediante **más vistas accesibles**, no texto microscópico ni corte de información.

## 6. Evidencia reproducible y comandos

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm run browser:audit
```

**Referencias canónicas:**

- [PR #1](https://github.com/M0-coder/DESSET/pull/1) — Draft, no fusionado.
- [CI #43641124393 (success)](https://github.com/M0-coder/DESSET/actions/runs/43641124393).
- [Capturas instrumentadas (artifact #14132346482)](https://github.com/M0-coder/DESSET/actions/runs/43641124393/artifacts/14132346482).
- [Auditoría de activos anteriores](AUDITORIA-REUTILIZACION-2026-11-14.md).
- [Contrato de diseño sin scroll](DESIGN-BENTO-01.md).
- [Centro oficial Notion](https://app.notion.com/p/413eb559c05c8121a80dc5f2d57803bb).
- [Aprobación de marca aún abierta en Notion](https://app.notion.com/p/3adeb559c05c81eda02bfd768bb13f7d).

## Veredicto

**GO** para seguir iterando y revisar en GitHub Pages como prototipo.  
**NO-GO** para declaración de operación empresarial, cobros, dominio/marketing oficial o merges sin autorización expresa.

**No se han modificado los repositorios antiguos, no hay compras, no se ha fusionado el PR, ni se ha configurado auto-merge.**
