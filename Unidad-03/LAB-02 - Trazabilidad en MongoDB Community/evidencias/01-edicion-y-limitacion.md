# Actividad 1 — Lo que no existe en esta edición

## 1. Edición utilizada

Se utilizó MongoDB Community 7.0.45. La consulta `db.adminCommand({ buildInfo: 1 }).modules` devolvió un arreglo vacío (`[]`), lo que confirma que no se está utilizando la edición Enterprise.

MongoDB Community no cuenta con auditoría nativa.

## 2. Ubicación de la bitácora

Se identificó el mecanismo de registro mediante Docker:

- Controlador: `json-file`.
- Archivo de registro: `/var/lib/docker/containers/0bbe3672fd0d214f56049cab9b90b6424799230a3891014179397d2cbcfc188c/0bbe3672fd0d214f56049cab9b90b6424799230a3891014179397d2cbcfc188c-json.log`.

También se consultaron los eventos recientes mediante `db.adminCommand({ getLog: "global" })`.

## 3. Eventos que registra la auditoría nativa

Según la documentación de MongoDB Enterprise y Atlas, la auditoría nativa puede registrar cuatro categorías principales:

- Cambios de esquema (DDL).
- Eventos de conjuntos de réplicas y clústeres fragmentados.
- Autenticación y autorización.
- Operaciones CRUD, cuando se habilita `auditAuthorizationSuccess: true`.

## 4. ¿Qué debería evaluar una organización antes de contratar Enterprise o migrar a Atlas?

Considero que una organización debería evaluar principalmente el costo de las licencias, sus necesidades de auditoría, los requisitos de seguridad y cumplimiento, el almacenamiento de los registros y la infraestructura que necesita mantener.

También debería analizar si realmente necesita auditoría nativa o si puede cubrir sus necesidades mediante mecanismos complementarios.

La decisión debe considerar tanto el costo como la importancia de poder identificar quién realizó una operación y cuándo ocurrió.

## 5. Conclusión

Esta actividad permitió comprobar que MongoDB Community tiene limitaciones en materia de auditoría. Aunque dispone de herramientas como el perfilador y la bitácora del servidor, estas no sustituyen la auditoría nativa disponible en Enterprise y Atlas.