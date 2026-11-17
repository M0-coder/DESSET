# DESSET V10 — primera tarjeta: tipografía original, piloto aislado

**Decisión del fundador (2026-11-17): mantener exclusivamente la tipografía original.**
Las propuestas de tipografías alternativas dejan de formar parte del plan V10.
**No se comprarán, incorporarán ni cargarán fuentes adicionales.**

## Baseline y límites

- Repositorio `M0-coder/DESSET`, base aprobada `main@2022820443e9ed2edbccd7235edac893d7dacb0f`.
- Rama aislada `design/v10-hero-pilot-no-deploy`; PR #46 en borrador.
- El CSS original conserva la declaración `font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace` en `body`.
- V10 **no altera** `font-family`, `font-size`, `font-weight`, `line-height`, ni `letter-spacing`. Hereda todas las métricas de la versión aprobada.
- El HTML de la tarjeta y de las otras nueve tarjetas, los diálogos, el script, el diseño responsive compacto, el logotipo, el SVG de cuatro roles, el GIF y su imagen estática reducida permanecen sin cambios.
- El GIF `assets/desset-eye.gif` conserva más de un fotograma y su hash aprobado; la imagen estática se utiliza solo bajo `prefers-reduced-motion: reduce`.
- Ni el manifiesto `config/visual-baseline-approved.json` ni los controles de publicación se modifican.

## Cambio propuesto

El candidato **solo añade a `styles.css`** una variación de acabado para `.tile--intro`: superficie cálida de color `#F0EEEA`, textura de puntos por `radial-gradient`, borde interior y cruz roja pixelada decorativa con `::after` y `pointer-events:none`. Para modo oscuro se elimina la textura y se mantiene la variable de superficie existente.

No se introducen recursos externos, bibliotecas, fuentes web, nuevos iconos descargados, textos, supuestos registros marcarios ni servicios de comercio que no existen.

## Evidencia e interpretación correcta

- `tests/hero-v10-preview.test.mjs` comprueba que los bytes aprobados del CSS base no cambian, que las reglas V10 no cambian la tipografía, que las diez tarjetas y activos HTML/JS/PNG/SVG siguen idénticos, y que el GIF posee varios fotogramas.
- El workflow `.github/workflows/v10-hero-preview.yml` ejecuta las pruebas del candidato sin las dos aserciones que exigen identidad exacta con V9, verifica expresamente que el gate oficial **falla cerrado** y realiza auditoría Chrome en 13 resoluciones. No toca secretos ni producción.
- El workflow oficial `ci.yml` **debe mantener el gate rojo** mientras `styles.css` no tenga un manifiesto nuevo con autorización real del propietario. No reemplazarlo ni considerarlo incidencia a ocultar.
- El mutation smoke del repo solo cubre mutaciones contractuales de los cuatro roles; la cobertura de código reportada es parcial, no una métrica de mutation testing integral.
- Cada revisión de candidato necesita nuevas capturas de escritorio, móvil, modo oscuro y preferencia de movimiento reducido; ninguna captura PNG demuestra animación por sí sola.

## Condiciones para promoción (no autorizada)

1. Evidencias de auditoría de navegador y pruebas del HEAD exacto.
2. Revisión de contraste, recortes y accesibilidad de la composición sin modificar la tipografía.
3. Comparativa de capturas `main` vs. candidato, con cambios confinados a la primera tarjeta.
4. Manifiesto de identidad visual nuevo, digest SHA-256 de la propuesta y comentario de aprobación de la cuenta propietaria en GitHub, según `docs/VISUAL-CHANGE-01.md`.
5. Revisión posterior del PR y **autorizaciones independientes** de merge y publicación manual.

**Estado: piloto exclusivamente visual, no aprobado para integración ni despliegue.**
