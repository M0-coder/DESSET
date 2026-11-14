# DESSET — Web oficial de DELIVER ASSETS

**Estado:** prototipo visual en desarrollo; NO es un servicio comercial publicado.  
**Repositorio exclusivo de implementación:** `M0-coder/DESSET`.  

## Bento Grid — v0.1

Diseño inspirado en la **estructura** de la referencia gráfica proporcionada por el fundador: tarjetas monocromáticas, separación negra, radios amplios y **cero desplazamiento horizontal o vertical**. El contenido se muestra con un diálogo accesible, y en móvil mediante dos vistas sin scroll. Las tarjetas son interactivas; no procesan pedidos ni datos personales.

La identidad reutilizada tiene procedencia rastreable: `assets/deliver-assets-mark.png` procede del commit `f3a075b...` del repo previo `DELIVER-ASESSET-pro`, ruta `public/brand/deliver-assets-mark.png` (nodo de Figma documentado `277:5`). `assets/city-network.svg` procede del mismo commit y directorio. **La aprobación legal y gráfica definitiva de esos activos todavía necesita reconciliarse con Notion.** No están autorizados para campañas o publicación oficial sin cierre del gate de marca.

## Ejecución local

Necesita Node 22 o superior; no hay dependencias npm externas.

```bash
npm ci --ignore-scripts --no-audit
npm run check
python3 -m http.server 8080
```

Abrir `http://localhost:8080`. No es necesario compilar: se distribuyen archivos estáticos. Las pruebas verifican estructura, datos y restricciones del primer prototipo. **No equivalen a prueba instrumentada en navegadores, cobertura de interacciones ni auditoría de seguridad completa.**

## Contratos

- Empresa: DELIVER ASSETS E.I.R.L. (denominación prevista, sin inscripción acreditada).
- Marca: DESSET (signo comercial propuesto, no asumir registro).
- Sede propuesta: Huacho, Huaura, Perú.
- Modelo: cobro por envío como fuente principal prevista.
- WhatsApp: canal inicial previsto; sin contacto oficial habilitado aquí.
- No se hacen afirmaciones de cobertura, tiempos, flota, clientes o seguridad demostrada.

## Pendiente antes de publicación

Verificación Figma y titularidad; pruebas visuales y de teclado con Chrome en escritorio/móvil; auditoría de accesibilidad y dispositivos de poca altura; análisis estático ampliado, CI verde, tests de mutación donde existan unidades de lógica suficientes, análisis de licencias/seguridad, metas SEO y privacidad, datos legales revisados, dominio y aprobación explícita del fundador. No activar auto-merge ni despliegues automáticos.

[Inventario y auditoría fundacional](docs/AUDITORIA-REUTILIZACION-2026-11-14.md).

## Desarrollo visual full-bleed y auditoría E2E
- El contenedor no conserva márgenes, padding ni ancho máximo. Pantalla completa (100dvh) y fondo negro.
- Las **tarjetas interiores no se redistribuyen** en desktop/tablet; el móvil conserva las vistas.
- `npm run check`: pruebas de unidad/estructura y contratos de seguridad del prototipo.
- `npm run browser:audit`: Chrome headless instrumentado (DevTools Protocol) en 7 tamaños, comprueba margen cero, scroll inexistente, recortes de texto, carga de PNG/SVG, diálogos, modo oscuro y vistas móviles. Guarda capturas en `reports/browser/`.
- El CI ejecuta ambas verificaciones y adjunta las capturas para inspección humana. **Aprobar el CI no sustituye revisión visual, legal ni pruebas exhaustivas de accesibilidad.**

## DESSET · Carácter visual V2 (propuesta sin publicar)

La V2 concentra la identidad donde aporta significado sin alterar la cuadrícula Bento V1: se conserva el PNG de logotipo y el SVG del ecosistema sin editar, se elimina el filtro monocromático **solo** de la tarjeta visual, se resalta «LOGÍSTICA» con azul documentado, se utiliza la frase «No solo entregamos. Movemos la ciudad» del perfil DESSET aportado por el fundador, y se reservan los acentos rojo/azul/amarillo para detalles funcionales o roles. El contenido marca expresamente el carácter institucional de la web, sin pedidos ni compras.

**Rama de publicación protegida:** `release/bento-v1-approved` permanece intacta. La V2 se prueba mediante CI y capturas antes de cualquier promoción.
