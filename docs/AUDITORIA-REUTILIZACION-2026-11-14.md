# Auditoría de reutilización — DESSET-WEB-00

**Fecha de corte:** 2026-11-14  
**Tipo:** auditoría de inventario y preflight (lecturas de GitHub, Notion, Google Drive y consulta puntual a Figma).  
**Destino único de nuevas escrituras:** `M0-coder/DESSET`.  
**Resultado:** base técnica identificada; **NO-GO** para despliegue/representación comercial activa hasta cerrar identidad, licencias, revisión legal y pruebas propias.

## 1. Alcance y limitaciones

Se enumeraron árboles y se inspeccionaron archivos de arquitectura, componentes, estilos, configuración, manifiestos, auditorías y workflows de cuatro proyectos anteriores. **No se leyó cada línea de todos los archivos**, ni se ejecutó una compilación nueva. Los resultados de CI ajenos no prueban que DESSET compile o funcione. Los repositorios anteriores quedaron intactos.

En Figma se identificó el nodo `277:5` mediante `get_design_context`; el conector alcanzó después su cuota Starter, por lo que no se completó la inspección del wordmark `59:198`, la navegación `59:196` y las páginas. El nodo `277:5` se presenta como imagen raster con nombre `ChatGPT Image 6 ago 2026, 12_46_59 a.m. 1`: **el nombre no acredita licencia comercial ni aprobación vigente**.

## 2. Inventario y valoración

| Fuente de solo lectura | Corte verificable | Hallazgo | Tratamiento |
| --- | --- | --- | --- |
| [DELIVER-ASESSET-pro](https://github.com/M0-coder/DELIVER-ASESSET-pro) | `main@f3a075b5498ff61e7a70b983c21eb29f89dbafcc` | React 19, TypeScript, Vite, rutas declarativas, CSS tokens, pruebas Vitest y cobertura, ESLint, Stryker, CodeQL, Chrome headless, CI | **Referente de arquitectura corporativa** |
| [DELIVER-ASESSET-prime](https://github.com/M0-coder/DELIVER-ASESSET-prime) | `main@b99d94b45a80907cc9e35456c2cc70cdae3e9645` | 96 entradas; composición diurna/nocturna y recursos de Figma; HTML/CSS/JS estático con hojas acumuladas | Referencia visual, **no** importar todo |
| [DELIVER-ASSETS](https://github.com/M0-coder/DELIVER-ASSETS) | Árbol inspeccionado, 27 entradas | React/TypeScript/Vite; `src/App.tsx` 217184 bytes y `src/styles.css` 288456 bytes; simulación sin backend real | Descartar monolito; estudiar conceptos |
| [DELIVER-ASSETS-app](https://github.com/M0-coder/DELIVER-ASSETS-app) | Árbol inspeccionado, 383 entradas | Cuatro apps, catálogo, órdenes, perfiles, servicios y sincronización local | Extraer taxonomía/contratos tras seguridad; **no** integrarlas en la web pública |
| [app-DELIVER-ASSETS](https://github.com/M0-coder/app-DELIVER-ASSETS) | Sin árbol Git, repositorio vacío | No contiene base reutilizable | No usar |

**Precisión:** las cuentas de entradas son árboles de Git, no número de archivos fuente exclusivamente.

## 3. Código aprovechable del proyecto Pro

- `src/routing.ts`: normalización de rutas y bases, generación de URLs de activos, validación contra path traversal y parámetros permitidos. Requiere portar y probar, no copiar sin revisión.
- `src/routes.json`, `src/site.ts`, `src/main.tsx`: manifiesto público y resolución de rutas; separación explícita de apps y web corporativa.
- `src/components.tsx`: cabecera, logotipo referenciado, navegación responsive y controles de foco/teclado.
- `src/pages.tsx`, `src/styles.css`: base de composición editorial, páginas por audiencia y tokens.
- `scripts/generate-static-routes.mjs`: rutas estáticas, `404.html`, sitemap y robots.
- `scripts/verify-public-site.mjs`, `scripts/verify-mobile-navigation.mjs`, `src/routing.test.ts`: contratos de publicación y navegación verificable.
- `.github/workflows/ci.yml`, `codeql.yml`, `package-lock.json`, `stryker.config.mjs`: línea base de calidad y dependencias fijadas.

**No confundir código con madurez de producto:** los contratos de páginas describen posibilidades futuras y no acreditan que pago, pedido, rastreo, soporte o descarga estén en producción. Tampoco debe migrarse información corporativa antigua sin validación del expediente vigente.

### Evidencia de CI previa

- CodeQL **SUCCESS** el 09/11/2026 en `f3a075b...`: [ejecución](https://github.com/M0-coder/DELIVER-ASESSET-pro/actions/runs/42621407778).
- Último registro localizado del workflow CI **SUCCESS** el 10/09/2026 en SHA `66a59628...`: [ejecución](https://github.com/M0-coder/DELIVER-ASESSET-pro/actions/runs/34439993000). **No se debe equiparar** ese SHA con el HEAD del nuevo repositorio.
- La deuda `docs/TECH-DEBT.md` documenta cobertura unitaria limitada, dependencia externa de fuentes, ausencia de protección de rama, falta de pixel-diff y ocho mutantes sobrevivientes. El porcentaje de mutación reportado pertenece al documento anterior, no a pruebas ejecutadas aquí.

## 4. Diseño y logotipo — evidencia y conflicto

**Documento técnico de origen:** [docs/BRAND-SOURCE.md](https://github.com/M0-coder/DELIVER-ASESSET-pro/blob/main/docs/BRAND-SOURCE.md).

- Figma: `DELIVER ASSETS — Editorial AI Concept`, clave `cUGTTGlTB05xiKLL8NGcwG`.
- Página `59:2` — Design System Production.
- Símbolo raster documentado `277:5`; wordmark `59:198`; navegación `59:196`.
- Exportación versionada: `public/brand/deliver-assets-mark.png` (declarados 96 × 73 px, 9291 bytes según árbol Git).
- Contrato tipográfico anterior: **Inter Extra Bold 800**, wordmark `DELIVER ASSETS`.
- Tokens documentados en `docs/DESIGN-SYSTEM.md`: azul `#1551D8`, amarillo `#FFC62F`, rojo editorial `#FF3328`, papel `#FAF3DF`, crema `#F4E9C6`, tinta `#111111`. **Referencia histórica**, no ratificación automática como marca DESSET.

**Contradicción sin cerrar:** el repositorio Pro llama aprobado al símbolo; el [registro de decisión en Notion](https://app.notion.com/p/3adeb559c05c81eda02bfd768bb13f7d) sigue con `Status: Open` y `External Ready: NO` en su estado consultado. No adoptar por inferencia como marca definitiva. Falta verificación actual con el titular de archivo/nodo y cesiones.

**Sistema alternativo:** Prime contiene visuales día/noche y snapshots, pero también afirmaciones como `ENTREGA ESTIMADA · 12 MIN`, promesas de seguro y cobertura sin fuente. Son **claims excluidos**. El árbol muestra `assets/hero-strong-v2.webp` con tamaño de 48 bytes, por lo que no debe aceptarse como imagen útil sin validación binaria. En ejecuciones históricas de Prime hubo QA visual fallido, aun cuando GitHub Pages llegó a desplegar correctamente.

## 5. Licencias y propiedad intelectual

Los repositorios Pro, Prime y legacy exhiben avisos propietarios o reservados. En particular, Pro prohíbe copiar, modificar o distribuir sin autorización del titular de derechos; la presencia bajo `M0-coder` no acredita por sí sola las cesiones sobre colaboraciones, medios, fuentes y logotipos. Antes de migrar literalmente archivos, revisar titularidad y permiso de uso en el expediente [DESSET-IP-01](https://app.notion.com/p/413eb559c05c815b96e4f921cbab6b32). No reutilizar imágenes ni screenshots de fuente ambigua como activos finales.

## 6. Alcance técnico de DESSET

**Producto inicial:** sitio corporativo informativo, accesible y responsive, separado de aplicaciones y backends.  
**No incluido sin nuevas decisiones:** pagos, catálogo comercial activo, pedidos reales, tracking GPS, autenticación, dashboard Control, formulario receptor sin privacidad operativa, enlaces ficticios a tiendas o aplicaciones.

Rutas propuestas **por homologar con el expediente actual**, procedentes del contrato histórico de Pro:

```
/  /company/  /services/  /apps/  /apps/customer/
/apps/business/  /apps/rider/  /apps/control/
/security/  /news/  /contact/
```

No activar una ruta solo para rellenarla con información inexistente. El diseño técnico debe distinguir claramente estado `PRECONSTITUTIVO / PROTOTIPO` de operación autorizada.

## 7. Gates y evidencia obligatoria

1. **Identidad y licencias:** validación del logotipo y derechos, diseño Figma canónico, tokens, contenidos públicos.
2. **Arquitectura:** stack documentado, componentes, rutas, modelo de contenido, aislamiento de aplicaciones.
3. **Compilación reproducible:** lockfile, versión de Node, `npm ci`, build local y CI con SHA.
4. **Pruebas unitarias y de navegador:** rutas, enlaces, navegación móvil, accesibilidad, contraste y activos; cobertura medible.
5. **Análisis estático, dependencias y seguridad:** lint, TypeScript, CodeQL, auditoría de paquetes, revisión de secretos, CSP y cabeceras según hosting.
6. **Mutation testing y deuda:** score reproducible, mutantes supervivientes, backlog priorizado y condiciones de cierre.
7. **Evidencia de ejecución y publicación:** artefactos CI, trazabilidad del commit, revisión legal y pruebas sobre el dominio final.

**No se han ejecutado aquí builds, pruebas locales ni auditoría de seguridad dinámica.** Ningún proyecto antiguo se ha modificado. No hay autorización implícita para dominio, despliegue, cobros o publicidad de operación real.

## 8. Decisión de implementación

Usar el proyecto Pro como **referencia de arquitectura y calidad**, el proyecto Prime como **referencia visual controlada**, y la suite App como **referencia de roles**. Implementar únicamente en `M0-coder/DESSET` y no trasladar automáticamente código o medios propietarios hasta validar permisos, identidad y coherencia con las decisiones vigentes.
