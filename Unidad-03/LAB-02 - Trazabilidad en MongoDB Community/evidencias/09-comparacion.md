# Actividad 9 — Comparar los tres escenarios

## 1. Objetivo

Comparar las capacidades de auditoría y trazabilidad de PostgreSQL, MongoDB Community y MongoDB Enterprise/Atlas, tomando como referencia las actividades realizadas y la documentación oficial.

## 2. Tabla comparativa

| Evento auditable | PostgreSQL (bitácora + disparador) | MongoDB Community (perfilador + bitácora) | MongoDB Enterprise/Atlas (auditoría nativa) |
|---|---|---|---|
| Acceso exitoso | Sí. Se registraron conexiones y autenticaciones exitosas. | Sí. La bitácora registró `Successfully authenticated`. | Documentado, no practicado. |
| Acceso fallido | Sí. Se registraron intentos con contraseña incorrecta y usuarios inexistentes. | Sí. La bitácora registró `Failed to authenticate`. | Documentado, no practicado. |
| Cambio de privilegios | Sí. Se registraron operaciones GRANT y REVOKE. | Parcial. Las instantáneas detectaron el cambio de roles, pero no identificaron quién lo realizó ni el momento exacto. | Documentado, no practicado. |
| Cambio de estructura | Sí. Se registró una operación ALTER TABLE. | No. No se obtuvo evidencia de cambios de estructura durante la práctica. | Documentado, no practicado. |
| Modificación de datos | Sí. El disparador registró operaciones UPDATE, INSERT y DELETE. | Sí. El perfilador registró operaciones query, update y remove, identificando usuario, aplicación y momento. | Documentado, no practicado. |
| Valor anterior del dato | Sí. El disparador conservó el valor anterior y el nuevo. | No. El perfilador muestra la operación y los cambios solicitados, pero no conserva el valor anterior del documento. | No. La auditoría nativa registra eventos y sus parámetros, pero no sustituye un historial de valores anteriores y nuevos. |
| Lectura de datos sensibles | No. Se realizaron consultas SELECT, pero no quedaron registradas con `log_statement = mod`. La parte opcional de pgaudit no se completó. | Parcial. El perfilador registró consultas, pero no se obtuvo evidencia de una lectura de RFC y el filtro posterior excluyó las operaciones query. | Documentado, no practicado. Requiere habilitar `auditAuthorizationSuccess: true` para registrar lecturas exitosas. |
| Cambio de configuración del registro | Sí. La bitácora registró cambios de parámetros de configuración. | Sí. Se registró `Profiler settings changed` y se relacionó la conexión con el usuario admin. | No. La referencia no garantiza un registro general de cualquier modificación de la configuración del mecanismo de auditoría. |

## 3. Análisis de los resultados

### PostgreSQL

PostgreSQL permitió obtener evidencia de conexiones exitosas y fallidas, cambios de privilegios, modificaciones de estructura y operaciones sobre los datos.

Una de sus principales ventajas fue el uso de un disparador que conservó tanto el valor anterior como el nuevo de los registros modificados.

Sin embargo, con la configuración aplicada mediante `log_statement = mod`, las consultas SELECT no quedaron registradas. La extensión pgaudit era una actividad opcional que no se realizó.

### MongoDB Community

MongoDB Community permitió registrar conexiones, autenticaciones y operaciones sobre los documentos mediante la bitácora de mongod y el perfilador.

También se comprobó que las instantáneas de privilegios permiten identificar diferencias entre dos momentos, aunque no sustituyen una auditoría que identifique directamente al responsable del cambio.

Su principal limitación es que no dispone de auditoría nativa y tampoco proporciona, mediante el perfilador utilizado, un historial completo de los valores anteriores de los documentos.

### MongoDB Enterprise/Atlas

De acuerdo con la documentación oficial, estas ediciones cuentan con auditoría nativa para registrar eventos de autenticación, autorización, cambios de esquema y operaciones CRUD.

Para registrar operaciones CRUD exitosas es necesario habilitar `auditAuthorizationSuccess: true`.

Esta funcionalidad proporciona una trazabilidad más amplia que la disponible en MongoDB Community. Sin embargo, no se practicó durante el laboratorio porque se trabajó con la edición Community.

## 4. Conclusión

Después de comparar los tres escenarios, considero que PostgreSQL ofrece una buena capacidad de trazabilidad cuando se combina la bitácora del servidor con disparadores que conservan los valores anteriores y nuevos.

MongoDB Community permite identificar algunas operaciones y accesos, pero presenta limitaciones importantes, especialmente cuando se necesita conocer quién realizó un cambio de privilegios o recuperar el valor anterior de un documento.

Por otro lado, MongoDB Enterprise y Atlas ofrecen auditoría nativa con mayor cobertura de eventos de seguridad, aunque requieren habilitar y configurar correctamente sus mecanismos.

En conclusión, cada motor tiene diferentes capacidades y limitaciones. Lo más importante es elegir los mecanismos de auditoría adecuados según la información que se necesita conservar y demostrar.

## 5. Referencias

- LAB-01 — Bitácoras y auditoría del dato en PostgreSQL.
- LAB-02 — Trazabilidad en MongoDB Community.
- MongoDB, Inc. — MongoDB Manual, Auditing (REF-U3-04): https://www.mongodb.com/docs/manual/core/auditing/
- MongoDB, Inc. — MongoDB Manual, Database Profiler (REF-U3-05): https://www.mongodb.com/docs/manual/tutorial/manage-the-database-profiler/