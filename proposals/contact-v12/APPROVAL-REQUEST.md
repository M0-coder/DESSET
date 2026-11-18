# DESSET CONTACT-V12 — Expediente de autorización visual (PROPUESTA)
  
**NO-GO / NO MERGE / NO DEPLOY.** Este documento NO registra una autorización ni modifica la línea base V11 de producción.

- PR de implementación: https://github.com/M0-coder/DESSET/pull/57
- Commit que fija únicamente el código del diseño: `9e766cb38f1ffd9f4b3460f5e6a46fa914d4edb9`
- Despliegue V11 en producción, consultado en Cloudflare: `6d864aac-84a2-4492-acb1-f869105c709f`, correspondiente a `beed9943f3dbaf834a3201233f6c9006abe0407f`
- Capturas instrumentadas de 13 resoluciones × modos claro y oscuro: https://github.com/M0-coder/DESSET/actions/runs/44224794464
- Artefacto de capturas del mismo commit: `14392870757` (GitHub Actions, retención limitada).
- Metadatos de propuesta: `proposals/contact-v12/approval-proposal.json`.

## Lo que sí se verificó

- La única tarjeta modificada es CONTACTO: se quita «CONTACTO / 01», se mantiene «CANALES OFICIALES.», computadora CRT vectorial, cruz roja y flecha.
- Las nueve tarjetas restantes mantienen exactamente los bytes del HTML previo; el CSS anterior permanece byte a byte intacto (tests de integridad).
- Los 26 escenarios instrumentados de Chrome pasaron en el commit de diseño indicado, sin recortes ni superposiciones detectadas y con acceso a los cinco canales.
- CodeQL y análisis estático del candidato terminaron correctamente.

La ilustración es una reinterpretación SVG: **no se afirma pixel-perfect**. Revisar capturas originales y accesibilidad antes de otorgar aprobación.

## Firma opcional de aprobación, SOLO si el propietario acepta la referencia visual

Digest SHA-256 calculado con `visualApprovalDigest` sobre un manifiesto hipotético con `status:"approved"` (no se escribe al manifiesto vigente):

```
19e9497ce3f9d825b19469e265b9fb316476a838ec20d1f87136c0f8b0577ad2
```

Cadena EXACTA que debería publicar **únicamente el propietario del repositorio** `M0-coder` en un comentario de issue GitHub:

```
AUTORIZO DISENO VISUAL DESSET SHA256 19e9497ce3f9d825b19469e265b9fb316476a838ec20d1f87136c0f8b0577ad2
```

**Este texto es una solicitud de aprobación, no una aprobación efectiva.** El titular puede solicitar ajustes o rechazarlo. Nunca escribir el comentario automáticamente.

## Secuencia sin riesgos

1. Revisar visualmente la tarjeta en la evidencia del PR y la comparación con la imagen de referencia del fundador.
2. Si se acepta el diseño, el propietario escribe el comentario exacto de aprobación en un issue GitHub específico y comparte el enlace al comentario.
3. En un commit posterior, actualizar `config/visual-baseline-approved.json` con los hashes del candidato, BODY FNV64, `status:"approved"`, URL del comentario real y el commit del diseño.
4. Adaptar los tests **históricos V11** para distinguir la evidencia inmutable de V11 del nuevo baseline V12, sin borrarlos, desactivarlos ni cambiar la verificación criptográfica del gate.
5. Ejecutar PR CI completo, cobertura, mutation smoke, CodeQL, Chrome fuente y paquete, 200/404 y seguridad. Resolver los fallos reales.
6. Solo después de todas las pruebas y revisión, solicitar autorización separada para merge del PR por su HEAD SHA; otra autorización independiente por SHA para publicación.
7. Verificar `desset.lat`, `www.desset.lat`, indexación, assets y disponibilidad de rollback. Sin tocar DNS, habilitar auto-merge, ni destruir ramas.

La firma visual **no autoriza merge ni publicación**; estas etapas requieren nuevas decisiones explícitas.
