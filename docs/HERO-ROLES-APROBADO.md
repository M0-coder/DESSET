# DESSET — Hero geométrico de cuatro roles (boceto aprobado)

## Alcance autorizado
Incorporar a la tarjeta visual el boceto geométrico que el fundador eligió en este chat, con su única corrección posterior: **CONTROL rojo** y **RIDER negro**. Las siluetas, posiciones, textos y colores de CUSTOMER (azul) y BUSINESS (amarillo) no cambian respecto al boceto.

## Bloqueo de cambios
- Mantener sin modificaciones la narrativa escrita de Bento V2: «NO SOLO ENTREGAMOS. MOVEMOS LA CIUDAD.», «MOVIMIENTO / SISTEMA», la portada «COMERCIO Y LOGÍSTICA. UNA MISMA VISIÓN», «COBRO POR ENVÍO» y el resto de tarjetas.
- No alterar el logo ni el `city-network.svg` previo; variante nueva `assets/roles-geometry-v2.svg`.
- El SVG reproduce las cuatro figuras planas del boceto, sin nuevas fotos, motos, rutas luminosas o efectos futuristas.
- CSS exclusivo de imagen para asegurar `object-fit:contain` y respetar el dibujo completo en el área Bento.
- Ninguna habilitación de compras web, captura de datos o backend.

## Aceptación
CI: `npm run check` y `npm run browser:audit`; inspección visual de 1440×900, 390×844 y 320×568. Los tests de navegador ya existentes controlan no-scroll, carga de imágenes, diálogos, tema y vistas móviles. El arte móvil muy pequeño debe inspeccionarse como limitación del contenedor Bento, sin ocultar contenido operativo.

**Rama de trabajo:** `feat/hero-four-roles-approved-v2`; **base:** `feat/brand-character-v2@896678787054ea7ff6aa5142be93cdf3f67ccd2f`. No fusionar ni sustituir Pages sin revisión del fundador.
