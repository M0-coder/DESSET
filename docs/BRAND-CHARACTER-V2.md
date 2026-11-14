# DESSET-WEB-02 — Carácter visual institucional V2

**Estado:** propuesta implementada en `feat/brand-character-v2`, no aprobada para sustituir V1.
**Base inalterada:** `release/bento-v1-approved@ca3832c1cdfb2740b988c5cf318cd369d094375e`.
**Origen:** instrucciones del fundador sobre web institucional sin compras y su captura del perfil DESSET en X (lema «No solo entregamos. Movemos la ciudad»). Documentos previos de la identidad en `docs/AUDITORIA-REUTILIZACION-2026-11-14.md`.

## Componentes intervenidos

1. **Cabecera de identidad:** símbolo PNG original sin alterar; una sola palabra azul (**LOGÍSTICA**) en el titular; texto secundario institucional, no transaccional.
2. **Hero central:** el mismo archivo `assets/city-network.svg` (sin edición). Solo se retiró el filtro de escala de grises; la imagen vuelve a mostrar su azul, rojo y amarillo originales. El lema aportado por el fundador aparece en una cápsula oscura superior (oculta en el hero móvil pequeño por legibilidad). Pie «MOVIMIENTO / SISTEMA».
3. **Estado:** se mantiene «EN DESARROLLO» y su punto de estado. No inventar operatividad.
4. **Modo oscuro:** misma función, texto más corto y acento azul claro discreto.
5. **Servicios:** rótulo existente y frase de contexto que indica «prevista»; se oculta el texto auxiliar en alturas donde cause recortes.
6. **Empresa:** título «IDENTIDAD.» en lugar de «SOBRE NOSOTROS.».
7. **Documentación:** solo el bloque 02 recibe azul tenue y el 03 un borde amarillo.
8. **Modelo:** aclaración de que la operativa corresponde a la aplicación; la web no vende ni cobra.
9. **Ecosistema:** chips Customer gris, Business azul tenue, Rider rojo tenue y Control oscuro/amarillo, sin reestructurar la tarjeta.
10. **Accesibilidad de controles:** colores de hover/focus y navegación móvil identificable sin apoyarse solo en el color (flecha y estado activo visibles).

## Tokens contrastados

- Azul `#1551D8`, rojo `#FF3328`, amarillo `#FFC62F`, en documentos de diseño del repositorio Pro. La **dosificación 85/10/4/1 es una regla conceptual**, no una métrica verificada del render.
- Fondos, contraste general, tipografía monoespaciada, dimensiones, grid y cero scroll: intactos respecto a V1.
- No se sustituye el logo ni se incorporan imágenes sintéticas.

## Gates

- `npm run check` para contenido, arquitectura, seguridad y CSS.
- `npm run browser:audit` para 10 resoluciones, ausencia de scroll y recortes, diálogos, modos y capturas.
- Comparación visual humana de V1 vs V2 antes de cualquier cambio en la fuente de Pages.
- **Pendiente:** validación definitiva de propiedad intelectual/identidad, análisis WCAG de zoom y teclado, SAST/cobertura/mutación/SEO para lanzamiento.

**Despliegue:** GitHub Pages sigue unido a `release/bento-v1-approved`. Este cambio no crea un sitio de compras ni modifica el código publicado.
