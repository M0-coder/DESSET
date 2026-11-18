# DESSET · HERITAGE-REUSE-V2 · Auditoría y propuesta ejecutable

**NO MERGE · NO DEPLOY · NO DNS · NO ALTERAR LA WEB APROBADA.**

## Alcance
Se inspeccionaron cinco repositorios históricos/evolutivos de la misma cuenta, frente al actual `M0-coder/DESSET` (base `main@9f48d62cdadb43135fc9c2072cdc9e31f695c9ab`):

| Repositorio | Evidencia relevante | Decisión |
|---|---|---|
| `M0-coder/DELIVER-ASESSET-prime` | `assets/rider-ops-v2.svg`, `assets/business-ops-v2.svg`, `figma-night.css`, variaciones Figma PNG y `CONTENT-PARITY.md` | Recuperar escenas **reales del legado** y la historia «PIDE · MIRA · RECIBE». No copiar tiempos, tarifas simuladas ni textos de seguimiento como hechos. |
| `M0-coder/DELIVER-ASESSET-pro` | `docs/DESIGN-SYSTEM.md`, `docs/BRAND-SOURCE.md`, `public/brand/city-network.svg` | Preservar los tokens y el logo canónico existentes. `city-network.svg` es una referencia valiosa, pero repetiría el diagrama de roles: **no incorporarlo como segundo organigrama**. |
| `M0-coder/DELIVER-ASSETS` | `MOTION_SYSTEM.md`, `src/App.tsx`, `src/styles.css` | Reutilizar principios de movimiento, sin importar React/Vite ni el extenso CSS experimental a la web institucional estática. |
| `M0-coder/DELIVER-ASSETS-app` | `apps/customer`, `business`, `rider`, `control` y sus respectivos README | Usar flujos reales del prototipo como **fuente de contenido**, sin declarar que estén activos para el público. |
| `M0-coder/app-DELIVER-ASSETS` | Repositorio Git vacío | Nada que importar. |

Los archivos Prime y Pro son propietarios (all rights reserved). El usuario afirma ser titular del trabajo; aun así, antes de una publicación nueva deben revisarse derechos de materiales derivados de Figma o terceros. No copiar contenido de procedencia no aclarada.

## Reutilización concreta

**Tarjeta superior:** se adapta `assets/rider-ops-v2.svg` de Prime. Conservar la escena del repartidor y teléfono (no otro mapa genérico), modificar solo el rótulo «RUTA ACTIVA» → «RUTA PREVISTA», la etiqueta de marca «DA» → «DESSET» y añadir una animación de desplazamiento de la línea de ruta con alternativa `prefers-reduced-motion`. El pie dice **PIDE · MIRA · RECIBE**, narrativa histórica documentada por Prime.

**Tarjeta inferior:** usar **sin modificar un solo byte** `assets/business-ops-v2.svg`, pantalla editorial de gestión. Cambiar «CUATRO ROLES. UNA ARQUITECTURA» a **PARA TU NEGOCIO**, con una explicación de catálogo, pedidos y gestión.

No se conservan cifras de 12 minutos, restaurantes simulados, promesas de seguimiento en vivo, cobertura inexistente ni paneles reales. Un SVG conceptual no acredita operación comercial.

## Construcción offline

```bash
node proposals/heritage-reuse-v2/build-preview.mjs
node --test tests/heritage-reuse-v2.test.mjs
python3 -m http.server 8080 --directory reports/heritage-reuse-v2
```

Abrir `http://localhost:8080`. El generador escribe exclusivamente en `reports/heritage-reuse-v2/` ignorado por Git. La web oficial, el SVG original, el CSS y los textos aprobados **permanecen byte por byte intactos**.

## Evidencia, alcance y deuda

- **Arquitectura:** propuesta de dos tarjetas y dos diálogos; no backend ni cambios de aplicaciones.
- **Compilación y reproducibilidad:** Node 22 y generador local con fuentes Git SHA fijos, sin dependencias nuevas.
- **Pruebas unitarias:** contrato de origen SHA-1 del asset Business, no mutación de los recursos oficiales, preservación de funcionalidades Bento y semántica editorial.
- **Pruebas instrumentadas:** necesarias en el candidato **real**, escritorio/tableta/móvil, tema claro/oscuro, zoom, foco, clics, animación reducida, recursos HTTP, recortes y responsive. Pasar CI de la rama con la fuente original no demuestra todavía estas pruebas del candidato.
- **Cobertura:** diagnóstica, sin umbral de cobertura del arte dinámico.
- **SAST y seguridad:** revisar SVG sin scripts ni referencias externas, CSP y headers al preparar implementación. No bypass.
- **Mutation testing:** smoke del repositorio original se mantiene; no hay mutation score completo del candidato.
- **Deuda técnica:** puede ser necesario un tratamiento móvil específico de encuadre y mejoras de contraste; no publicar antes de validar.
- **CI:** pruebas de integridad y seguridad sobre la rama; gate de baseline intencionalmente intacto.
- **Autorización:** para promoción, nuevo PR de implementación con actualización de `config/visual-baseline-approved.json`, tests, navegación y allowlist de archivos; aprobación SHA-256 verificable del fundador; merge autorizado y **despliegue independiente** autorizado.

Esta propuesta sustituye conceptualmente al trabajo visual de OPERATION-FLOW-V1 sin eliminar PR, ramas ni archivos históricos.
