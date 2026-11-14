# DESSET-WEB-03 — Acabado editorial V2.1

**Mandato:** perfeccionar presentación, jerarquía de lectura, carácter y legibilidad sin rediseñar el Bento existente.  
**Rama exclusiva:** `feat/editorial-finish-v2-1`.  
**Base exacta:** `896678787054ea7ff6aa5142be93cdf3f67ccd2f` (V2).  
**V1 publicada:** `release/bento-v1-approved@ca3832c1cdfb2740b988c5cf318cd369d094375e`, protegida y sin modificar.

## Cambios controlados
- Hero: SVG y PNG de marca originales sin editar; leve gradiente de lectura, barra editorial fina con azules/rojos/amarillo ya documentados y rótulo discreto «DA — VISIÓN 01» solo en pantallas grandes. Conservar lema existente del perfil aportado por el fundador.
- Titular y tarjetas: mayor distinción de pesos y espaciado, sin importar fuentes externas.
- Contacto: «CANALES OFICIALES» + «En preparación» en lugar del mensaje provisional repetido en tamaño de titular; el modal sigue aclarando que no hay canal verificado.
- Tarjeta «Modelo comercial»: reemplazada visualmente por «HUACHO. PUNTO DE PARTIDA.» para dar anclaje institucional sin aparentar ventas; la sede permanece «prevista». Identificador interno `model` conservado para no romper navegabilidad/contratos existentes.
- Accesibilidad móvil: tipografía mínima corregida en etiquetas, llamada a acción y caption para la pantalla compacta de 320×568, sujeta a regresión real.
- Interacciones: flechas y ligero zoom de imagen únicamente al hover/focus, desactivables por `prefers-reduced-motion`; no hay vídeo, audio ni movimiento continuo.

## Lo que no se cambia
- Grid de 12 columnas en desktop y 6 en móvil/tableta, áreas CSS, dimensiones base, márgenes exteriores 0, modalidad cero scroll, logo, imagen conceptual y sus SHA.
- No se habilitan operaciones de comercio en web, enlaces de pago ni captación de datos.
- V1 y V2 no son sobreescritas; promoción de V2.1 requiere aprobación explícita.

## Aceptación
- Pruebas Node del repositorio y navegador Chrome en diez tamaños, incluyendo ambas vistas móviles.
- Sin recortes ni scroll en matriz actual.
- Revisar manualmente capturas y contraste frente a V2 antes de entregar una vista previa separada.
- Pendientes ajenos a esta iteración: identidad/cesiones, accesibilidad con zoom 200–400%, SAST y cobertura/mutación robusta; no declarar lista para publicación oficial.
