# DESSET — Web oficial de DELIVER ASSETS

> **ESTADO VIGENTE VERIFICADO — 15/11/2026:** https://desset.lat/ está publicado como sitio **institucional estático** en Cloudflare Pages, deployment `c29ec7a7-806a-4a92-b326-e1a42c7dc1fe` (SUCCESS, `uses_functions=false`, `commit_dirty=false`). El commit público es `841fb1d5ba44022237fe1534926c6c3a5ab564f5`; `main` avanzó a `f7e6f14e9254df587b2c72f6d122c2079014cbb0` únicamente por pruebas de Chrome, sin cambiar los archivos Bento. **Línea base y rollback:** [PRODUCTION-BASELINE-2026-11-15.md](docs/PRODUCTION-BASELINE-2026-11-15.md). El PR #7 y otras ramas son historial, no fuente de verdad actual.


**Estado:** web institucional publicada y operativa; el negocio, aplicaciones, cobros y pedidos siguen **sin lanzamiento comercial acreditado**.  
**Repositorio exclusivo de implementación:** `M0-coder/DESSET`.  

## Cambios visuales autorizados

La publicación actual es una **referencia aprobada**, no una prohibición permanente de rediseño. El gate de identidad carga ahora los hashes desde \`config/visual-baseline-approved.json\` y mantiene el Bento vigente protegido.

Para experimentar en una rama sin alterar producción, ejecutar \`npm run visual:propose\`: el comando **solo informa** diferencias y hashes; no aprueba ni publica. Tras revisión visual y **autorización expresa del fundador**, actualizar el manifiesto versionado y los contratos de diseño necesarios mediante PR; exigir CI/CodeQL y publicar solo mediante autorización aparte. Véase [VISUAL-CHANGE-01](docs/VISUAL-CHANGE-01.md).

**Advertencia:** añadir fotografías o nuevos recursos también requiere actualizar el empaquetado allowlist, las auditorías de navegador y los tests específicos del diseño. El comando de propuestas por sí solo no resuelve esos contratos.

## Bento Grid — v0.1

Diseño inspirado en la **estructura** de la referencia gráfica proporcionada por el fundador: tarjetas monocromáticas, separación negra, radios amplios y **cero desplazamiento horizontal o vertical**. El contenido se muestra con un diálogo accesible, y en móvil mediante dos vistas sin scroll. Las tarjetas son interactivas; no procesan pedidos ni datos personales.

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
- WhatsApp: canal inicial previsto; sin contacto oficial habilitado aquí.
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
