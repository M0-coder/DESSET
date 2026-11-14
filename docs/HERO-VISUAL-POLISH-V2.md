# DESSET-WEB-04 — Pulido de la tarjeta gráfica V2

**Objetivo autorizado:** mejorar la claridad del gráfico central de la V2 y su integración con el Bento, sin tocar la narrativa.

**Base inalterada:** `feat/brand-character-v2@896678787054ea7ff6aa5142be93cdf3f67ccd2f`.
**Rama de intervención:** `feat/hero-visual-polish-v2`. V1 permanece protegida y publicada.

## Intervención acotada

- Original `assets/city-network.svg`: **conservado intacto**. Se creó una variante independiente `assets/city-network-refined.svg`.
- Fondo y patrón del diagrama: reducción de ruido (textura del papel de 0.34 a 0.12 y puntos de 0.28 a 0.18) y ejes urbanos más finos/claro.
- Edificios: misma geometría y azul `#1551D8`, menos opacidad.
- Ruta roja: misma geometría `path d`, grosor 12→10; nodos 18→16 y contorno 8→6 para acabado preciso.
- Etiqueta Customer: reposicionada **dentro del SVG** a y=360 para evitar ocultación por el pie editorial. Texto exacto conservado.
- Bloques Business, Rider, Control y wordmark: dimensiones, coordenadas, textos, colores y radios intactos.
- Manifiesto y caption: **mismas palabras**. Solo se refinó opacidad, sombra, borde y espaciado de cajas superpuestas.
- No cambiar ninguna tarjeta externa, ruta, descripción corporativa, modelo comercial, lema, logotipo, márgenes ni breakpoints.
- No se añadieron imágenes externas, fuentes o scripts.

## Validación obligatoria

`npm run check` + `npm run browser:audit` en 10 resoluciones, revisión manual de capturas 320px y desktop, comprobación de lista de textos SVG y ruta idénticas. No publicar en la V1 ni sobreescribir el preview previo de V2 sin aprobación.

**Restricciones:** no autorizar compras, pagos, formularios, operaciones reales ni cambios de marca. La validez legal de la imagen heredada permanece pendiente de cierre documental.
