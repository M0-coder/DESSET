# DESSET — HERO-V11 / Solo propuesta visual

**ESTADO: DRAFT / NO-GO para merge y publicación.** Referencia enviada por el fundador el 17/11/2026 (11:45). No constituye autorización de sustituir V10.

## Problema visual
V10 utiliza mono-espaciado y un tamaño máximo de 29 px en la primera tarjeta. La referencia utiliza COMERCIO Y / LOGÍSTICA. en sans negrita y UNA MISMA VISIÓN. en serif cursiva. La jerarquía visual se ha perdido; una de las cruces también queda oculta por la imagen.

## Cambios de la vista previa (solo copia offline)
1. H1 en dos registros, peso sans alto y lema serif cursivo, con saltos de línea como la referencia.
2. Tamaños responsive mediante unidades `cqw` exclusivamente en la tarjeta institucional.
3. Eliminar en la COPIA el desplazamiento rígido `translateY(-38px)` y ajustar la ciudad sin escalados fijos.
4. Conservar GIF original, `picture` y PNG alternativo para movimiento reducido.
5. Cruz roja y amarilla sobre el fondo y sin tapar contenido, ocultas para ventanas muy bajas.
6. No añadir ®: no se presume protección registral de marca.

## Uso local sin modificar ni desplegar la web
Desde el repositorio:

    node proposals/hero-v11/build-preview.mjs --out reports/hero-v11-preview

Genera dos sitios independientes: `reports/hero-v11-preview/baseline/` y `candidate/`. Ambos copian los recursos actuales. Solo `candidate/` incorpora una variante del H1 y el CSS de propuesta.

Para capturas:

    node proposals/hero-v11/capture-evidence.mjs

El workflow **DESSET HERO V11 - Preview Offline Only** adjunta capturas de baseline/candidate en 1440×900, 1024×768, 390×844 y 320×568. Sin token de publicación, sin Wrangler, sin permisos de escritura y sin deploy.

## Barreras de aceptación
- Los archivos oficiales `index.html`, `styles.css`, `styles-compact.css`, los assets, la política de Cloudflare y el manifiesto `config/visual-baseline-approved.json` quedan sin cambios ni bypass.
- CI, baseline gate, CodeQL, pruebas unitarias, seguridad, browser-audit y preview-only workflow deben terminar con éxito.
- Revisar las capturas con la referencia; NO-GO ante recortes de texto, ojo deformado, ciudad sobre el pie o scroll nuevo.
- Revisión visual del fundador obligatoria. Integración real del diseño exigiría PR y aprobación del nuevo baseline; publicación exige autorización distinta por SHA exacto.

## Límite
Es una propuesta para comparar, no una implementación publicada. El artefacto no demuestra ninguna validación de producción y no sustituye V10.
