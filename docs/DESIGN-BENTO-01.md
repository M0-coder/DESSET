# DESSET-WEB-01 · Contrato visual y gate inicial

- **Referencia entregada por el fundador:** captura de portafolio Bento monocromático con borde negro grueso, tarjetas grises y sin scroll.
- **Decisión expresa:** sin scroll horizontal ni vertical; responsive; se permite navegación por vistas/modal.
- **Implementación:** grid CSS de 12 columnas escritorio; de 6 columnas en tablet y teléfono; dos vistas por botón en teléfono; altura de viewport dinámico \`100dvh\`.
- **Estado:** prototipo visual de sitio corporativo informativo; no marketplace productivo.
- **Logo existente:** versión PNG de \`DELIVER-ASESSET-pro\` (commit \`f3a075b...\`, Figma \`277:5\` documentado). Fuente exacta conservada, no redibujada. Se exige confirmar aprobación actual y derechos antes de uso comercial público.
- **Gráfico complementario:** \`city-network.svg\` del mismo repositorio, monocromatizado solo por CSS para adecuarlo a la referencia, archivo original intacto.
- **Contenido:** redactado exclusivamente como plan/propuesta o estado pendiente; no se generan cifras operativas.
- **Seguridad:** sin backend, red, formularios, claves ni cookies. CSP restrictiva y noindex hasta aprobación.
- **Límites conocidos:** no se han ejecutado en esta versión pruebas instrumentadas en navegador; no hay auditoría a11y completa, cobertura ni mutation score. Las pruebas Node validan invariantes de fuentes, no sustituyen QA visual.
- **Gates siguientes:** inspección render en Chrome de 320, 390, 768, 1440 px y distintas alturas; corrección de text overflow; validación visual con fundador; autorización de activos; política legal/privacidad; dominio y hosting.

Nunca transformar una implementación de referencia en una afirmación de operación real.
