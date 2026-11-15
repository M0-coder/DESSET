# DESSET — Prepublicación segura (PRELAUNCH-02)
**Base inmutable:** `audit/prelaunch-01-locked@229242d79c75fc382e5843e2f69abacc06807e8d`.
**Prohibición:** no modificar el Bento, la narrativa, las figuras, los colores, las fuentes de marca, los módulos de app o el contenido institucional aprobado.

## Qué queda listo
- Metadatos Open Graph neutros en HEAD, sin imagen ni URL inventada.
- `vercel.json` para CSP en cabecera HTTP, no frame, no sniff, referrer y permisos de hardware desactivados; cabe comprobar el despliegue efectivo.
- CodeQL JavaScript/TypeScript reusando acciones con SHA fijado y auditadas en repo histórico, sin inferir que sus resultados ya son nuestros.
- Nuevo gate de integridad SHA de logo, SVG, JS, CSS y cuerpo HTML; protege la narrativa y render aprobado ante cambios accidentales.
- Auditoría de activación de controles con teclado en Chrome y CI.
- Empaquetador `npm run release:package`: falla sin doble autorización `DESSET_RELEASE_APPROVED=YES` y `DESSET_OFFICIAL_ORIGIN=https://<dominio-comprado>`. Solo construye `dist` local, no publica; elimina `noindex`, genera `canonical`, `robots.txt`, `sitemap.xml` y `og:url` **únicamente en el paquete**, sin alterar el HTML fuente.

## Pendientes materiales externos al código
- Dominio: comprobación Namecheap 2026-11-14: `deliverassets.pe`, `desset.pe`, `desset.app` disponibles; `deliverassets.com` y `desset.com` no disponibles. Precios instantáneos no reservas. **No hay compra registrada**.
- Marca DESSET/DELIVER ASSETS, logo y cesión: `https://app.notion.com/p/413eb559c05c815b96e4f921cbab6b32` mantiene cierre pendiente; Figma Starter no permite más lecturas actualmente. No simular licencia.
- Constitución: `https://app.notion.com/p/413eb559c05c8121a80dc5f2d57803bb` no acredita inscripción. Continuar rótulos preconstitutivos.
- Auditoría zoom 200/400 %, lector de pantalla y rendimiento: evidencia por obtener; el cero scroll ordinario no implica cumplimiento WCAG.
- Hosting: cabeceras en Vercel verificables, pero **GitHub Pages sigue publicando V1**, no se ha tomado decisión de migración; el `vercel.json` no tiene efecto sobre GitHub Pages.

## Política de promoción
Solo después de derechos de activos, dominio realmente adquirido, accesibilidad, CI y validación visual por SHA: crear tag/release de candidato, conservar rollback, pedir autorización explícita de publicación. Nunca auto-merge.
