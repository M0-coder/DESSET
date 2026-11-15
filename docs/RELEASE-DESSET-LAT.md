# DESSET.lat — Plan de migración sin regresiones

**Decisión del fundador (14/11/2026):** abandonar Bento V1 y continuar exclusivamente con la última versión auditada. Dominio canónico objetivo: **https://desset.lat/**, adquisición **en curso**, no acreditada.

## Estado confirmado
- Última versión técnica: `audit/prelaunch-02-final-gates`, PR #7, del repo único `M0-coder/DESSET`.
- Versión publicada antigua: GitHub Pages apunta a `release/bento-v1-approved@ca3832c1cdfb2740b988c5cf318cd369d094375e`; queda **descartada como candidata**, pero su URL puede seguir accesible.
- El respaldo histórico no se borra durante migración. De lo contrario, no existiría rollback fiable.
- `desset.lat`: Namecheap muestra disponibilidad, compra sin confirmar. El equipo Vercel aún no reconoce el dominio como suyo ni enlazado.
- Solo la vista previa privada del último commit sirve para revisión. No conectar ni publicar antes del gate legal/técnico.

## Procedimiento de corte
1. Verificar correo/recibo de compra en Namecheap y control del dominio en cuenta; revisar coste de **renovación**, expiración, bloqueo y recuperación de acceso.
2. Validar derechos de marca, logotipo y tipografía en expediente Notion. No declarar marca registrada sin constancia.
3. Verificar accesibilidad con zoom y teclado/lector y seguridad HTTP, rendimiento y capturas SHA.
4. Asociar `desset.lat` al proyecto institucional en Vercel solo cuando haya propiedad verificada; configurar DNS siguiendo instrucciones verificadas del proveedor. No colocar registros inventados.
5. Construir y comparar **paquete de producción** de solo lectura: canonical, sitemap, robots y Open Graph con `https://desset.lat/`; confirmar que no se filtraron scripts ni contenidos comerciales.
6. Ejecutar despliegue controlado; comprobar HTTPS, dominio canónico, cabeceras, 200 y ausencia de 404; confirmar su indexabilidad **solo** en producción.
7. Retirar/redirigir la URL histórica GitHub Pages para que no compita con el dominio nuevo. No borrar la rama de respaldo.
8. Registrar commit, captura, DNS, fecha de corte y reversión de emergencia.

## Regla de no regresión
El cuerpo HTML, CSS, SVG, logo y aplicación JS están protegidos por `scripts/approved-baseline-gate.mjs`. La incorporación de un dominio solo afecta a metadatos de publicación y documentación. Las referencias anteriores a V1 en documentos históricos son evidencia de trazabilidad, no una segunda versión activa.

## Restricciones operativas
No se ha pagado el dominio, ni modificado DNS, ni fusionado PR, ni activado publicación. `DESSET_RELEASE_APPROVED=YES` en CI es la bandera **de prueba de generación local**, no la autorización real de release. No declarar GO hasta evidencias externas completas.
