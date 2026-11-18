# DESSET FINAL-BENTO-V3 — implementación funcional aislada

**Referencia:** imagen de escritorio aprobada en la conversación del 18/11/2026, con tarjetas Bento claras, escena de repartidor negra y roja con teléfono, lema «PIDE · MIRA · RECIBE» y panel «PARA TU NEGOCIO».

## Qué se ha codificado
- HTML generado a partir del **sitio actual** `index.html`, conservando todos los botones, modales, navegación INICIO/EXPLORAR, canales y semántica.
- CSS acumulativo `final.css` delimitado al candidato; colores, titular principal, superficies marfil, contraste, tamaños, acentos rojos, bandas azul/amarillo/rojo, tarjetas de evidencia, estado, modo oscuro y negocios.
- Dos ilustraciones **SVG locales** creadas como aproximación vectorial de la imagen: ruta urbana con repartidor y teléfono; laptop Business con barras y gráfico circular. Son **editoriales**, no capturas reales de pedidos o datos empresariales. No se incrusta toda la captura como una página muerta.
- Animaciones de ruta y datos discretas; CSS `prefers-reduced-motion`.
- Texto introductorio revisado, diálogo de «PIDE · MIRA · RECIBE» y diálogo Business con funciones previstas documentadas. Sin disponibilidad ficticia de apps, pedidos, cobros ni cobertura.

## Ejecución
```bash
node proposals/final-bento-v3/build-preview.mjs
node --test tests/final-bento-v3.test.mjs
python3 -m http.server 8080 --directory reports/final-bento-v3
```
Abrir `http://localhost:8080`. El generador crea una **web estática funcional** en `reports/final-bento-v3`, no una imagen plana. `src/app.mjs` original sigue manejando los controles y `src/content.mjs` contiene textos de esta candidata.

## Alcance y seguridad
- Base oficial congelada: `main@9f48d62cdadb43135fc9c2072cdc9e31f695c9ab`.
- La vista previa **no modifica** `index.html`, `styles.css`, `src/app.mjs`, `src/content.mjs` ni el manifiesto visual aprobado, por lo que los flujos actuales de producción no cambian.
- Reutiliza los assets aprobados de la web, con conservación del GIF y de la versión estática del ojo.
- No hay fuentes, scripts, imágenes o referencias externas; no hay cambios DNS ni Cloudflare.
- La CSP, noindex y restricciones de seguridad de la fuente permanecen.

## Gates de promoción
- **Arquitectura:** comparar la fuente generada con producción y verificar dependencias.
- **Compilación:** No hay transpiling; build en Node con copia local reproducible.
- **Pruebas unitarias:** ejecutar el test de esta propuesta y los del proyecto.
- **Instrumentadas:** recorrer la candidata en Chromium para desktop 1440×900, 1280×800, tablet 768×1024 y móvil 390×844, 320×640; modo oscuro, lectores de pantalla y zoom; verificar modal y cambio móvil.
- **Cobertura:** diagnosticar; no presumir 100 %.
- **Análisis estático y seguridad:** mantener CodeQL y pruebas de código/SVG sin HTML inyectado.
- **CI:** documentar Web Checks y CodeQL por HEAD.
- **Reproducibilidad:** los archivos se reconstruyen desde un commit, sin descargas externas.
- **Mutation testing:** ejecutar mutation-smoke existente, no presumir score completo.
- **Deuda técnica:** eliminar CSS obsoleto **solo después** de comparar diffs y actualizar los contratos.
- **Evidencia de ejecución:** guardar capturas, hashes y resumen por SHA.

**Requisito de gobernanza:** esta propuesta NO autoriza automáticamente merge ni deploy. La promoción necesita modificar los archivos oficiales, el manifiesto visual y contratos en un PR distinto; luego un comentario real del propietario en GitHub con el SHA-256 exacto del diseño, aprobado por el gate actual. Sin bypass, sin auto-merge, sin borrar ramas ni DNS.
