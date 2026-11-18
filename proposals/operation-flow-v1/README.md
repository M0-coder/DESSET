# DESSET · OPERATION-FLOW-V1 · vista previa aislada

**Origen congelado:** `main@9f48d62cdadb43135fc9c2072cdc9e31f695c9ab` (18/11/2026).

## Objetivo editorial y visual
Reemplazar la explicación redundante de cuatro roles en la tarjeta superior por una secuencia logística legible: **01 Pedido → 02 Comercio → 03 Reparto → 04 Entrega**. CONTROL pasa a ser una capa secundaria de supervisión, no un quinto paso. La tarjeta inferior cambia a **«DESSET PARA TU NEGOCIO»** con capacidades *previstas*, no funcionalidades anunciadas como disponibles.

La ilustración usa el mismo azul, amarillo, negro y rojo de DESSET; dos SVG locales animados (escritorio y móvil), sin scripts, red ni fuentes externas. Detiene el movimiento con `prefers-reduced-motion: reduce`. La ciudad dibujada es geométrica, **no un mapa real de Huacho** ni seguimiento real de pedidos.

## Uso local, sin producción
```bash
node proposals/operation-flow-v1/build-preview.mjs
python3 -m http.server 8080 --directory reports/operation-flow-v1
```
Abrir `http://localhost:8080/`. Las pruebas de contrato se ejecutan con `node --test tests/operation-flow-v1-preview.test.mjs` y con `npm test`.

El generador crea contenido solo en `reports/operation-flow-v1` (ignorado por Git); no modifica los archivos aprobados `index.html`, `styles.css`, `src/content.mjs`, el SVG histórico ni el manifiesto. La web pública permanece intacta.

## Condiciones de aprobación futura
- Comparar capturas reales en Chrome, escritorio/tableta/móvil y reducción de movimiento. La vista previa por sí sola **no acredita** el QA visual.
- Revisar legibilidad en 320/390/768/1440 px; contrastes, lectores de pantalla, zoom 200/400 %, rendimiento y ausencia de recortes.
- Para promover el candidato, abrir un **PR de implementación independiente**. Adaptar contratos de contenido, visuales y navegador; empaquetado, hashes y firma de `config/visual-baseline-approved.json` según `docs/VISUAL-CHANGE-01.md`. No debilitar ningún gate.
- Exigir CI, CodeQL, revisión visual, comentario de aprobación SHA-256 del propietario, autorización explícita de integración y autorización **separada** para publicar.

**NO-GO:** no auto-merge, no deploy, no cambios DNS, no borrar ramas, no tocar otras tarjetas y no habilitar pedidos, pagos ni métricas no demostradas.
