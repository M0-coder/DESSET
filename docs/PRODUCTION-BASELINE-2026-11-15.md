# DESSET — Línea base de producción institucional (15/11/2026)

> **Registro operativo, no autorización de publicación.** Se basa en lecturas de GitHub, Cloudflare Pages y DNS el 15 de noviembre de 2026. Conservar esta referencia antes de cambiar infraestructura, diseño o pipeline.

## 1. Identidad y alcance aprobado

- Web institucional: **https://desset.lat/**; sitio estático de DELIVER ASSETS / DESSET, sin pedidos, pagos, autenticación ni procesamiento de datos personales mediante formulario propio.
- Dominio `desset.lat` y `www.desset.lat`: asociados a Pages y activos en Cloudflare. Zona Cloudflare autoritativa activa.
- Proyecto Cloudflare Pages: `desset-institucional`.
- **Versión pública aprobada:** deployment `c29ec7a7-806a-4a92-b326-e1a42c7dc1fe`, entorno production, status `success`, `uses_functions=false`, `commit_dirty=false`.
- **SHA de código con que se publicó esa versión:** `841fb1d5ba44022237fe1534926c6c3a5ab564f5`.
- **SHA vigente de `main` durante este registro:** `f7e6f14e9254df587b2c72f6d122c2079014cbb0`. La diferencia se debe al PR #23 de limpieza de Chrome, sin cambios en los siete archivos visuales aprobados.
- Respaldo estático anterior: `089e9ed3-502c-451e-8da7-8906670e469d`, `success`. Respaldo histórico con Functions: `313b15bc-4621-48f6-910b-00ffe2be0d54`, `success`.
- Publicación únicamente a través de `.github/workflows/cloudflare-pages-production.yml`, disparo manual `workflow_dispatch` desde `main`, confirmación `PUBLICAR_DESSET`, entorno `desset-production`. **No hay autorización para reejecutar ni publicar desde esta documentación.**

## 2. Referencia inmutable del diseño (Git blob SHA-1)

Los siguientes blobs son idénticos en el SHA publicado y en el `main` indicado:

| Archivo protegido | SHA de blob Git |
| --- | --- |
| `index.html` | `9814476426ea5ae2d684f077d5f10ba415bf27b5` |
| `styles.css` | `12290dd8da8c4ba4296a7926696ca684dd5c699f` |
| `styles-compact.css` | `9168641a76a22a00af9c7051875a0c21dffb0cf9` |
| `src/app.mjs` | `52866fb6588bd7eb5a22e3917a82e28781a97319` |
| `src/content.mjs` | `5af6215a9f3a9e5d3ed3c146731b70a25a8124ac` |
| `assets/deliver-assets-mark.png` | `fa6cb4ea5c5331c4cf47dfd157214e972f809356` |
| `assets/roles-geometry-v2.svg` | `71401c4d0f93eeefcde393f18e82e165e50d8f90` |

**Nota:** estos son identificadores de blobs Git, no las huellas SHA-256 del artefacto publicado. Los hashes SHA-256 y el manifiesto de 11 archivos se conservaron como artefacto del workflow de publicación; consultar esa evidencia antes de declarar equivalencia binaria del paquete descargado de Cloudflare.

## 3. Evidencia de publicación y pruebas

- [GitHub Actions publicación, segundo intento aprobado](https://github.com/M0-coder/DESSET/actions/runs/43751936396): código de `main` en el momento de la publicación y verificación HTTP de dominio, `www`, favicon/logotipo, robots, sitemap, CSP y HTTP 404.
- **Artefacto `desset-cloudflare-release-evidence`**: ID `14175933962`, ZIP SHA-256 `60aee4ca950ead51f5f71fc7241ffec72c9dc98ae04bfa63d98f824e5977b3ae`, `expired=false` al consultar GitHub. Contiene evidencia de empaquetado, hashes SHA-256 y capturas (no se afirma haber vuelto a analizar el ZIP en este registro).
- **Artefacto `desset-wrangler-toolchain-evidence`**: ID `14175963992`, ZIP SHA-256 `e9fe05874f848223f1af6ae5c5d6e69b3128564fa5d9de13836b74859ae61d5d`, `expired=false` en la misma consulta.
- **Riesgo de conservación:** GitHub Actions configura `retention-days: 30` para ambos. **Antes de su vencimiento**, exportar los ZIP a almacenamiento duradero controlado por el titular y comprobar sus digest, sin publicar secretos ni volverlos públicos. El historial Git y los IDs de Pages **no reemplazan las capturas ni los hashes de build**.

- [CI `verify` del `main` vigente](https://github.com/M0-coder/DESSET/actions/runs/43754359391): PASS.
- [CI `analyze` del `main` vigente](https://github.com/M0-coder/DESSET/actions/runs/43754359378): PASS.
- [PR #23](https://github.com/M0-coder/DESSET/pull/23): corrección de apagado de Chrome, sin alterar HTML/CSS/JS públicos ni activos gráficos.
- Fuente de repositorio `index.html` contiene `noindex,nofollow` para evitar publicaciones accidentales de prototipos; el empaquetado oficial genera canonical `https://desset.lat/` y retira `noindex`. No «corregir» el archivo fuente sin comprender esa separación.

## 4. Política de recuperación y cambios

1. Antes de cambios: verificar `main` protegido, checks verdes, árbol Git limpio, despliegue actual, dominios, seguridad y respaldo `089e9ed3-502c-451e-8da7-8906670e469d` accesible.
2. Todo ajuste de código o CI va en PR aislado, con pruebas y revisión. **No auto-merge, no borrado de ramas, no auto-deploy.**
3. Cualquier nueva publicación exige autorización independiente, manifest de 11 archivos, comparación del diseño, HTTPS, 200/404, CSP, logotipo exacto, `commit_dirty=false`, `uses_functions=false` y SHA correcto.
4. Si hay regresión de producción: detener, examinar el alcance e iniciar restauración del deployment anterior desde Cloudflare Pages por procedimiento controlado. **No existe rollback automático garantizado.**
5. Mantener el historial: los respaldos Git y Cloudflare no se eliminan durante limpieza documental.

## 5. Pendientes no resueltos por esta referencia

- GitHub [#14](https://github.com/M0-coder/DESSET/issues/14): inventario de DNS y correo corporativo. Cloudflare tiene solo dos CNAME, no hay MX/SPF/DKIM/DMARC; el correo `@desset.lat` no está acreditado.
- GitHub [#15](https://github.com/M0-coder/DESSET/issues/15): cierre de auditoría ampliada, monitoreo continuo, accesibilidad real y reconciliación documental.
- GitHub [#22](https://github.com/M0-coder/DESSET/issues/22): observar reincidencia de `ENOTEMPTY` aunque el correctivo Chrome esté integrado.
- Notion [DESSET-IP-01](https://app.notion.com/p/413eb559c05c815b96e4f921cbab6b32): cadena de propiedad/licencias de marca, software y diseño sin cierre acreditado en la página consultada (última edición 09/11/2026). **No confundir publicación técnica con autorización legal final.**
- Google Search Console: inclusión/indexación del dominio **no acreditada** mediante la conexión disponible. Verificación pendiente; no inferir que «HTTP 200 + canonical» equivale a indexación.

**Dictamen de esta línea base:** web institucional `GO`, sin cambio en producción. Cierre legal, de SEO y de fiabilidad ampliada **pendiente de evidencia**.
