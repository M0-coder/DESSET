# DESSET CONTACT-V12 — Propuesta editorial de «CANALES OFICIALES»

**SOLO PROPUESTA VISUAL — NO MERGE — NO DEPLOY.** Autorización del fundador: crear PR DRAFT, sin publicar ni alterar V11.

## Referencia y objetivo
La imagen aportada por el fundador muestra una tarjeta marfil con borde fino, titular negro sans grueso a la izquierda, una cruz roja pixelada y un computador CRT vintage con histograma verde a la derecha, más el botón de flecha enmarcado. El fundador exige suprimir `CONTACTO / 01`, por redundante.

Esta propuesta mantiene la acción interactiva del botón `data-detail="contact"` y su diálogo oficial. La computadora se interpreta en SVG vectorial local con píxeles y tonos originales; no se añade una imagen completa como fondo, lo que preserva texto real, accesibilidad y escalado.

## Archivos de la propuesta (no conectados a la web actual)
- `retro-terminal.svg`: CRT, gráfico verde, teclado y textura hechos en SVG estático local, sin recursos externos.
- `contact-preview.css`: reglas limitadas a `.tile--contact`, soporte de modo oscuro, pantallas compactas y móvil.
- `build-preview.mjs`: crea 2 copias aisladas, baseline firmado V11 y candidato de contacto V12. Cambia solamente el botón de la tarjeta de contacto más un link a CSS local; no edita `index.html` ni `styles.css` originales.
- `capture-evidence.mjs`: audita 13 resoluciones y captura 26 imágenes (baseline/candidato), con pruebas de no clipping, SVG cargado y diálogo funcional.
- `tests/contact-v12-preview.test.mjs`: comprueba identidad, SHA de archivos V11, ausencia de cambios en las otras nueve tarjetas y del rótulo redundante, seguridad del SVG y construcción local.
- `.github/workflows/contact-v12-preview.yml`: read-only; sin Wrangler, DNS, secretos de Cloudflare ni deploy.

## Uso

    node proposals/contact-v12/build-preview.mjs --out reports/contact-v12-preview
    node proposals/contact-v12/capture-evidence.mjs

El artefacto CI contiene 26 PNG, las dos copias y manifest de evidencias. La vista en móvil requiere EXPLORAR, porque el contacto está en la segunda pantalla del Bento.

## Condiciones de aprobación
- V11 preservado por hashes Git y `scripts/approved-baseline-gate.mjs` sin modificaciones.
- CI general, CodeQL, contrato de SVG, Chrome 13 tamaños, 404/seguridad y mutation smoke contractual.
- Texto, cruz, computadora y flecha sin recortes ni superposición en las resoluciones de prueba.
- No afirmar pixel-perfect: la referencia es una imagen raster y la nueva ilustración es vectorial; revisión visual final por el fundador.
- Si se aprueba visualmente, PR de implementación posterior, nuevo manifiesto de identidad con consentimiento SHA-256 verificable, merge por HEAD y publicación por SHA, todos separados.

**Riesgo aceptado:** el SVG es una reinterpretación fiel de la escena retro, no un recorte exacto de la imagen. No se reemplazan recursos originales ni se introduce el símbolo ®.
