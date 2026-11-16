# DESSET — Ojo en la tarjeta principal (propuesta local)

Fecha: 16/11/2026. Base de trabajo: 137f09bf1105b8e3220d6bb8ddfc9aaefd3ea3cb.
Producción observada, sin modificar: c29ec7a7-806a-4a92-b326-e1a42c7dc1fe, SHA 841fb1d5ba44022237fe1534926c6c3a5ab564f5.

Solicitud: colocar el GIF entregado por el fundador a la derecha del texto dentro de la tarjeta introductoria, siguiendo su referencia, sin desorden ni deformación.

Cambios: index.html añade dos columnas internas; styles.css limita los ajustes a la tarjeta introductoria; assets/desset-eye.gif conserva los bytes originales; assets/desset-eye-still.png es el primer fotograma extraído con FFmpeg para prefers-reduced-motion. No se editan otras tarjetas, contenido textual, logo original, JavaScript ni CSP. Se preparan localmente las listas de empaquetado y el conteo del workflow para los dos activos nuevos; ningún workflow remoto fue modificado.

GIF SHA-256: db8d22a99751463d8f32c11d4b35be723278818ccc933031ad98ad25b8d0d410. Tamaño: 863115 bytes; 496 × 499; seis fotogramas. Imagen completa mediante object-fit:contain, sin posición absoluta ni recorte. Se reduce la escala del titular dentro de la tarjeta para reservar una columna real al ojo.

## Verificación

- Navegador: 14 tamaños, desde 320×256 hasta 1920×1080; sin solapamiento entre texto y ojo, sin solapamiento con cabecera/pie, sin texto cortado ni desbordamiento horizontal. Relación de aspecto conservada dentro del redondeo subpíxel. Estas comprobaciones no equivalen a una auditoría de accesibilidad completa.
- Botón del proyecto: abre y cierra el diálogo. Modo oscuro/claro: funcional.
- Seguridad estática: PASS.
- npm run check: 58/61 pruebas pasan. Las tres restantes rechazan la diferencia respecto al manifiesto visual antiguo. Resultado esperado para una propuesta, pero NO se declara CI aprobada.
- Arquitectura: estática sin nuevas dependencias ni JavaScript. Cobertura y mutation testing integrales no ejecutados para este ajuste. Auditoría instrumentada: geometría en navegador y comprobaciones funcionales anteriores.
- Compilación/paquete local: PASS, trece archivos exactos con ambos activos. Paquete staging: PASS, doce archivos. Controles negativos: 6/6 + 5/5 + 5/5 contextos indebidos rechazados. Se ajustó únicamente el conteo de archivos del workflow local a trece; disparo manual y aprobaciones intactos.
- Preferencia de movimiento reducido: declarada con picture/source y fotograma fijo; no se emuló en este navegador. La animación original sigue en bucle en modo normal; una auditoría WCAG completa y un control de pausa quedan fuera de esta validación.

## Bloqueantes de publicación, sin ocultarlos

1. Registrar la aprobación de esta nueva identidad visual. scripts/visual-approval.mjs exige un comentario real del propietario en una issue de GitHub que contenga el digest exacto del nuevo manifiesto. El mandato autoriza preparar el cambio, pero no se fabricó ese comentario ni se desactivó el control.
2. Registrar el manifiesto visual nuevo con ambos activos, el commit candidato y la evidencia real de aprobación. El empaquetado local y sus controles de archivos permitidos ya están preparados y comprobados.
3. Ejecutar CI y verificar el candidato exacto antes de merge o despacho manual autorizado. Main contiene cambios posteriores a la producción; su publicación conjunta requiere revisar ese alcance.

Estado: GO de encaje visual local. NO-GO de publicación hasta resolver los puntos anteriores. Sin push, PR, merge, despliegue, cambios DNS ni alteración de respaldos.
