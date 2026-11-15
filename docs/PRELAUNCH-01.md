# DESSET-PRELAUNCH-01 — Corrección controlada sin alterar Bento

**Fecha:** 14 de noviembre de 2026 (Perú). **Base:** `c441d5896182ab25ea87c8d3f39ca3e2c9057927`. **Rama:** `audit/prelaunch-01-locked`. **Regla:** no modificar el original de V1, la V2 aprobada, sus mensajes, fuentes de identidad, colores de superficies, cuadrícula ni despliegues existentes.

## Cambios permitidos que se ejecutan
- Conserva los cuatro polígonos del SVG (Customer azul, Business amarillo, Rider negro y Control rojo); SOLO el texto interno de Control cambia de blanco/amarillo a negro `#111111` para alcanzar ~5,18:1 sobre rojo `#FF3328` sin tocar el fondo.
- Añade debajo de la misma ilustración una **leyenda duplicada solo en móvil** con nombres exactos, en una cuadrícula de 2×2; no altera textos empresariales y se oculta de lector de pantalla porque la descripción SVG y el panel ya comunican los roles. Se valida no solapamiento con el caption.
- Corrige la regex del verificador SVG para bloquear atributos `on...` y etiquetas activas.
- Añade controles estáticos de seguridad sin dependencias, un smoke test de mutación de colores y reporte parcial de cobertura Node.
- Refuerza browser-audit en los cuatro tamaños móviles para detectar recortes/solapamiento de nueva leyenda.

## Criterios de aceptación y pruebas
- `npm ci --ignore-scripts --no-audit --no-fund`
- `npm run check`
- `npm run security:audit`
- `npm run mutation:smoke`
- `npm run test:coverage`
- `npm run browser:audit`, con capturas para inspección humana.
- Comparación de SHA: ramas publicadas V1/V2 intactas, commit base inmutable, y PR Draft sin merge.
- **No** afirma WCAG AA completo: revisar zoom 200–400 %, tamaño de texto restante de 8 px, lectores de pantalla y contraste de todos los controles.
- **No** afirma SAST completo: scanner especializado y cabeceras HTTP de producción pendientes.
- **No** afirma cobertura de UI: cobertura Node solo de módulos cargados por Node, distinta de la app DOM en Chrome.
- **No** ejecuta DAST, performance/Lighthouse ni mutación integral; smoke test no equivale a mutation score.

## Gates que no se cierran por código
1. **Derechos de marca y logo**: `https://app.notion.com/p/413eb559c05c815b96e4f921cbab6b32` sigue indicando ausencia de cesión/licencias acreditadas y análisis de similitud pendiente.
2. **Identidad societaria**: `https://app.notion.com/p/413eb559c05c8121a80dc5f2d57803bb` mantiene la E.I.R.L. preconstitutiva, no inscrita. Mensajes públicos actuales describen esa condición.
3. **Dominio/SEO/hosting**: no eliminar `noindex,nofollow`, no configurar canonical ni cambiar proveedor antes de decidir dominio y mecanismo de cabeceras. GitHub Pages no ofrece control de respuesta HTTP equivalente a un hosting configurable.
4. **Publicación**: no promover ni fusionar nada sin autorización y revalidación por SHA/rollback.

**Dictamen previsto:** GO para seguir probando en preview, NO-GO para declaración de web corporativa definitiva hasta cerrar gates de derechos, accesibilidad y producción.
