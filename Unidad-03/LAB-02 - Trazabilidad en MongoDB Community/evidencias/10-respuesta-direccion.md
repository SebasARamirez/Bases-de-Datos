# Actividad 10 — Respuesta a Dirección

## 1. ¿Quién cambió el RFC de María García en la Actividad 2? ¿Y en la Actividad 3?

**Actividad 2:** No hay evidencia con esta edición. El perfilador estaba desactivado y la bitácora de mongod únicamente mostró conexiones y autenticaciones, pero no registró la modificación del RFC.

**Actividad 3:** El cambio fue ejecutado por el usuario `app_ventas@comercial`, según el registro de `system.profile`.

## 2. ¿Cuándo y desde qué aplicación?

En la Actividad 2 no se pudo determinar el momento exacto ni atribuir la modificación a una aplicación mediante evidencia de la operación.

En la Actividad 3 se registró lo siguiente:

- Fecha y hora: 8 de noviembre de 2026, 04:16:50.959 UTC.
- Usuario: `app_ventas@comercial`.
- Aplicación: `app-ventas-web`.
- Cliente: `172.17.0.1`.

Estos datos se obtuvieron del documento de tipo `update` almacenado en `system.profile`.

## 3. ¿Qué valor tenía antes?

El perfilador de MongoDB Community no conserva automáticamente una copia del valor anterior de los documentos.

En la Actividad 2 se estableció el RFC `GAMA780912XXX` y en la Actividad 3 se modificó a `GAMA780912XYZ`. Por la secuencia de operaciones, el valor anterior a la segunda modificación era `GAMA780912XXX`, aunque no se conserva como un historial independiente dentro de `system.profile`.

Respecto al valor anterior a la Actividad 2, no hay evidencia de auditoría que permita demostrarlo.

## 4. ¿Cambió alguien los privilegios de app_ventas?

Sí. Las instantáneas de privilegios demostraron que se agregó el rol `dbAdmin` al usuario `app_ventas`, además del rol `readWrite` que ya tenía.

Las evidencias muestran:

- Primera instantánea: 8 de noviembre de 2026, 05:15:56.959 UTC. El usuario tenía únicamente `readWrite`.
- Segunda instantánea: 8 de noviembre de 2026, 05:22:29.268 UTC. El usuario tenía `readWrite` y `dbAdmin`.

Posteriormente, el rol adicional `dbAdmin` fue revocado y se verificó que el usuario conservara únicamente `readWrite`.

Sin embargo, no hay evidencia con esta edición que permita identificar quién realizó el cambio ni el momento exacto. Las instantáneas solamente permiten establecer que ocurrió entre las dos consultas.

## 5. Conclusión

Este incidente demuestra que MongoDB Community tiene limitaciones importantes para realizar auditorías de seguridad. Aunque el perfilador permitió identificar quién realizó una modificación, desde qué aplicación y cuándo, no permitió recuperar el valor anterior del documento.

Asimismo, las instantáneas de privilegios permitieron detectar que se agregó un rol, pero no identificar al responsable. Por eso, una organización que necesite una trazabilidad más completa debería considerar mecanismos de auditoría adicionales, como MongoDB Enterprise o Atlas.