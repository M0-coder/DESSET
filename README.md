# DESSET — Web oficial de DELIVER ASSETS

> **CORTE DE AUDITORÍA — 17/11/2026 (instantánea, no estado permanente):** https://desset.lat/ corresponde al sitio institucional estático de Cloudflare Pages, proyecto `desset-institucional`. La API de Cloudflare registra como despliegue de producción `b118e080-24c8-412a-8ae7-ab52af7506f3` (SUCCESS, `uses_functions=false`, `commit_dirty=false`), código `c27b11586ba7dfbd6a02a65087299a261d5173d0`. El `main` comprobado fue `0f7fda9568de3749e5bd2b38d74ee4ce798f4991`; la comparación con producción solo incluye el workflow de publicación y sus pruebas de regresión, sin cambios de Bento. El [workflow de publicación](https://github.com/M0-coder/DESSET/actions/runs/44155968989) terminó **FAIL en el smoke HTTP final** (`curl` exit 23) aunque el despliegue y la comprobación de SHA en Cloudflare fueron SUCCESS; la corrección posterior está en `main`, **no está acreditada una nueva ejecución del smoke público**. No inferir caída de la web ni certificación completa de HTTP/SEO desde ese resultado. **Referencia histórica del 15/11:** [PRODUCTION-BASELINE-2026-11-15.md](docs/PRODUCTION-BASELINE-2026-11-15.md). Consultar Cloudflare/GitHub nuevamente antes de cualquier decisión.


**Estado:** web institucional publicada, con contenido visible en un navegador conectado y despliegue identificado en Cloudflare; **verificación HTTP pública independiente todavía pendiente**. El negocio, las aplicaciones, los cobros y los pedidos siguen **sin lanzamiento comercial acreditado**.  
**Repositorio exclusivo de implementación:** `M0-coder/DESSET`.  

## Cambios visuales autorizados

La publicación actual es una **referencia aprobada**, no una prohibición permanente de rediseño. El gate de identidad carga ahora los hashes desde `config/visual-baseline-approved.json` y mantiene el Bento vigente protegido.

Para experimentar en una rama sin alterar producción, ejecutar `npm run visual:propose`: el comando **solo informa** diferencias y hashes; no aprueba ni publica. Tras revisión visual, **la aprobación de futuras versiones exige un comentario verificable del propietario `M0-coder` en un issue GitHub que incluya el SHA-256 exacto del diseño**. La comprobación es obligatoria en CI y publicación; la referencia actual se acepta por su hash histórico. Actualizar el manifiesto y los contratos necesarios mediante PR, exigir CI/CodeQL y publicar solo mediante autorización aparte. Véase [VISUAL-CHANGE-01](docs/VISUAL-CHANGE-01.md).

**Advertencia:** añadir fotografías o nuevos recursos también requiere actualizar el empaquetado allowlist, las auditorías de navegador y los tests específicos del diseño. El comando de propuestas por sí solo no resuelve esos contratos.

## Bento Grid — v0.1

Diseño inspirado en la **estructura** de la referencia gráfica proporcionada por el fundador: tarjetas monocromáticas, separación negra y radios amplios. En los tamaños habituales conserva el tablero sin desplazamiento; **la excepción `styles-compact.css` permite scroll vertical con alturas de 400 px o menos** para no perder contenido. En móvil existen dos vistas; los diálogos recuperan contenido mediante scroll. Las tarjetas son interactivas; no procesan pedidos ni datos personales.

La identidad reutilizada tiene procedencia rastreable: `assets/deliver-assets-mark.png` procede del commit `f3a075b...` del repo previo `DELIVER-ASESSET-pro`, ruta `public/brand/deliver-assets-mark.png` (nodo de Figma documentado `277:5`). El gráfico histórico `assets/city-network.svg` procedía del mismo commit, pero se conserva únicamente en el historial Git por no ser utilizado en el diseño aprobado. **La aprobación legal y gráfica definitiva de esos activos todavía necesita reconciliarse con Notion.** No están autorizados para campañas o publicación oficial sin cierre del gate de marca.

## Ejecución local

Necesita Node 22 o superior; no hay dependencias npm externas.

```bash
npm ci --ignore-scripts --no-audit
npm run check
python3 -m http.server 8080
```

Abrir `http://localhost:8080`. No es necesario compilar: se distribuyen archivos estáticos. Las pruebas verifican estructura, datos y restricciones del primer prototipo. **No equivalen por sí solas a auditoría de seguridad o accesibilidad completa.** GitHub Actions también ejecuta pruebas instrumentadas de Chrome en 13 tamaños y genera capturas.

## Contratos

- Empresa: DELIVER ASSETS E.I.R.L. (denominación prevista, sin inscripción acreditada).
- Marca: DESSET (signo comercial propuesto, no asumir registro).
- Sede propuesta: Huacho, Huaura, Perú.
- Modelo: cobro por envío como fuente principal prevista.
- WhatsApp: posible canal operativo de las futuras aplicaciones, **no habilitado para pedidos en esta web**. La sección institucional CANALES OFICIALES muestra cinco redes sociales proporcionadas por el fundador; esos enlaces no constituyen compras, contratación ni cobros.
- No se hacen afirmaciones de cobertura, tiempos, flota, clientes o seguridad demostrada.

## Pendiente para cierre institucional y eventual lanzamiento comercial

Pendiente de evidencia adicional: titularidad y licencias de activos Figma/PNG/SVG/código, análisis marcario y constitución, correo empresarial, indexación en Google, monitoreo continuo, lectores de pantalla, zoom 200/400 % y pruebas de accesibilidad avanzadas. La infraestructura pública y el dominio ya están activos; **no confundir publicación web con apertura comercial**. No activar auto-merge ni despliegues automáticos.

[Inventario y auditoría fundacional](docs/AUDITORIA-REUTILIZACION-2026-11-14.md).

## Desarrollo visual full-bleed y auditoría E2E
- El contenedor no conserva márgenes, padding ni ancho máximo. Pantalla completa (100dvh) y fondo negro.
- Las **tarjetas interiores no se redistribuyen** en desktop/tablet; el móvil conserva las vistas.
- `npm run check`: pruebas de unidad/estructura y contratos de seguridad del prototipo.
- `npm run browser:audit`: Chrome headless instrumentado (DevTools Protocol) en 13 tamaños, comprueba margen cero, scroll inexistente, recortes de texto, carga de PNG/SVG, diálogos, modo oscuro y vistas móviles. Guarda capturas en `reports/browser/`.
- El CI ejecuta ambas verificaciones y adjunta las capturas para inspección humana. **Aprobar el CI no sustituye revisión visual, legal ni pruebas exhaustivas de accesibilidad.**

## Archivo histórico · evolución del diseño V2 (no representa el estado actual)

> Esta sección documenta una propuesta y la ruta de revisión de 2026. **No** significa que la web actual esté pendiente de publicación ni autoriza reemplazar el Bento aprobado.

La V2 concentra la identidad donde aporta significado sin alterar la cuadrícula Bento V1: se conserva el PNG de logotipo y el SVG del ecosistema sin editar, se elimina el filtro monocromático **solo** de la tarjeta visual, se resalta «LOGÍSTICA» con azul documentado, se utiliza la frase «No solo entregamos. Movemos la ciudad» del perfil DESSET aportado por el fundador, y se reservan los acentos rojo/azul/amarillo para detalles funcionales o roles. El contenido marca expresamente el carácter institucional de la web, sin pedidos ni compras.

**Rama de publicación protegida:** `release/bento-v1-approved` permanece intacta. La V2 se prueba mediante CI y capturas antes de cualquier promoción.

## Archivo histórico · PRELAUNCH-01 · Gate de cierre previo a la publicación

Correcciones aisladas en `audit/prelaunch-01-locked`, con origen exacto `c441d5896182`. Detalle en [docs/PRELAUNCH-01.md](docs/PRELAUNCH-01.md). El prototipo conserva `noindex,nofollow`; **quitarlo solo al publicar oficialmente** tras verificar identidad, dominio y SHA. La documentación de derechos pendientes permanece vigente.
