# Informe — LAB-02: Trazabilidad en MongoDB Community

## 1. Despliegue, edición y limitación

Para realizar este laboratorio utilicé Docker Desktop en Windows 11, con la imagen oficial `mongo:7`.

El contenedor se creó con el nombre `dba-u3-mongo`, utilizando el puerto local 27018 y un volumen llamado `dba-u3-mongo-data` para conservar los datos.

Se habilitó la autenticación mediante la opción `--auth` y se crearon dos usuarios:

- `admin`: usuario administrador con privilegios root.
- `app_ventas`: usuario de aplicación con permisos de lectura y escritura sobre la base de datos `comercial`.

La versión del servidor fue MongoDB 7.0.45 y la versión de mongosh fue 2.14.1.

Durante la práctica se comprobó que esta instalación utiliza MongoDB Community. La consulta `db.adminCommand({ buildInfo: 1 }).modules` devolvió un arreglo vacío (`[]`).

Una de las principales limitaciones de esta edición es que no cuenta con auditoría nativa. Por lo tanto, fue necesario utilizar el perfilador, la bitácora de mongod y las instantáneas de privilegios como mecanismos complementarios de trazabilidad.

## 2. Perfilador

Se utilizó el perfilador de MongoDB para registrar las operaciones realizadas sobre la base de datos `comercial`.

Inicialmente se encontraba desactivado, por lo que se habilitó temporalmente en nivel 2:

```javascript
db.setProfilingLevel(2)
```

Este nivel permitió registrar las operaciones realizadas, incluyendo consultas y modificaciones.

Posteriormente se configuró el nivel 1 con un filtro para registrar operaciones de inserción, actualización y eliminación:

```javascript
db.setProfilingLevel(1, {
  filter: {
    op: { $in: ["insert", "update", "remove"] }
  }
})
```

Entre los registros obtenidos se identificaron operaciones realizadas por `app_ventas@comercial`, desde la aplicación `app-ventas-web` y el cliente `172.17.0.1`.

Se identificaron operaciones `insert`, `query`, `update` y `remove`. También se comprobó que el perfilador permite consultar información como el momento de ejecución, la colección afectada y la cantidad de documentos examinados.

Una limitación importante es que el perfilador no conserva automáticamente el valor anterior de un documento. Además, los filtros de perfilado pueden excluir operaciones, por lo que no se debe asumir que registra absolutamente todo lo que sucede.

El nivel 2 también puede generar demasiados registros y almacenar información sensible incluida en las consultas. Por esta razón, se utilizó solamente durante las pruebas y después se restauró el nivel 1 con el filtro correspondiente.

## 3. Bitácora de mongod

Se consultó la bitácora global mediante:

```javascript
db.adminCommand({ getLog: "global" })
```

En ella se encontraron eventos de autenticación exitosa y fallida, así como cambios en la configuración del perfilador.

Entre los resultados se identificaron:

- Intentos fallidos de autenticación de `app_ventas`.
- Un intento de autenticación con un usuario inexistente.
- Autenticaciones exitosas de `admin` y `app_ventas`.
- Cambios en la configuración del perfilador.

También se identificó que el controlador de registros de Docker era `json-file`, mediante el comando `docker inspect`.

La ubicación del registro del contenedor se obtuvo con la propiedad `LogPath`. Esto permitió distinguir entre la bitácora global consultada mediante `getLog` y los registros de salida administrados por Docker.

Se comprobó que `getLog` no debe considerarse un mecanismo permanente de conservación, porque solamente mantiene los eventos recientes en memoria y su contenido cambia después de reiniciar el servidor.

También se correlacionaron los cambios de configuración del perfilador con las conexiones del usuario administrador mediante el identificador `ctx`.

Se identificó que las conexiones `conn41` y `conn51` se autenticaron correctamente como `admin`. Los eventos de modificación de la configuración aparecieron asociados a esos mismos identificadores.

Esto permitió relacionar los cambios de configuración con una sesión autenticada del administrador.

## 4. Privilegios

Durante la práctica se creó el usuario `app_ventas` con el rol `readWrite` sobre la base de datos `comercial`.

Posteriormente se realizó una prueba en la que se agregó temporalmente el rol `dbAdmin`.

Para identificar el cambio se guardaron dos instantáneas de privilegios en la colección `auditoria.instantaneas_privilegios`.

La primera instantánea mostró que el usuario solamente tenía `readWrite`, mientras que la segunda mostró los roles `readWrite` y `dbAdmin`.

Esto permitió detectar que hubo una modificación de privilegios.

Sin embargo, las consultas realizadas al perfilador y a la bitácora no encontraron un evento directo de `grantRolesToUser`. Por lo tanto, no fue posible identificar con certeza quién realizó el cambio ni el momento exacto.

Finalmente, se revocó el rol adicional `dbAdmin` y se comprobó que el usuario volviera a tener únicamente `readWrite`.

Este procedimiento funcionó como un control compensatorio, aunque no sustituye una auditoría nativa.

Las instantáneas se realizaron en los siguientes momentos:

- Primera: 8 de noviembre de 2026, 05:15:56.959 UTC. El usuario tenía únicamente `readWrite`.
- Segunda: 8 de noviembre de 2026, 05:22:29.268 UTC. El usuario tenía `readWrite` y `dbAdmin`.

Por lo tanto, se comprobó que el cambio de privilegios ocurrió entre ambas instantáneas, aunque no fue posible identificar el momento exacto ni al responsable.

## 5. Conservación de evidencias

Se exportaron los registros del perfilador y la bitácora global a archivos externos:

- `system-profile.json`
- `bitacora-mongod.log`

También se generó el archivo `hashes.sha256` con las huellas digitales SHA-256 de ambas exportaciones.

Antes del reinicio se obtuvieron 665 eventos en la bitácora global. Después del reinicio se encontraron 83 eventos nuevos.

En cuanto al perfilador, su configuración volvió al nivel 0 después del reinicio, mientras que la colección `system.profile` conservó dos registros.

Posteriormente se realizaron nuevas operaciones controladas con `app_ventas` para completar la exportación del perfilador. Se incluyeron operaciones de inserción, consulta, actualización y eliminación utilizando un cliente temporal de prueba.

Después se recalcularon y guardaron los hashes SHA-256 correspondientes a las versiones finales de los archivos exportados.

Esta actividad permitió comprender que no basta con generar registros: también es necesario exportarlos y conservarlos para evitar perder evidencia importante.

## 6. Comparación con PostgreSQL y MongoDB Enterprise/Atlas

Durante el LAB-01 se trabajó con PostgreSQL utilizando la bitácora del servidor y un disparador para registrar cambios en los datos.

Una de sus ventajas fue conservar los valores anteriores y nuevos de los registros modificados. También se pudieron identificar accesos, cambios de privilegios, modificaciones de estructura y errores.

Sin embargo, las lecturas de datos sensibles no quedaron registradas con la configuración aplicada. La extensión pgaudit correspondía a una parte opcional que no se practicó.

En MongoDB Community se logró identificar operaciones y accesos mediante el perfilador y la bitácora, pero no se obtuvo una auditoría completa de los cambios de privilegios ni un historial automático de valores anteriores.

Por otro lado, MongoDB Enterprise y Atlas cuentan con auditoría nativa, de acuerdo con la documentación oficial. Esta permite registrar eventos relacionados con autenticación, autorización y operaciones de la base de datos, dependiendo de su configuración.

Esta última alternativa se investigó mediante documentación, pero no se instaló ni se practicó durante el laboratorio.

## 7. Recomendación para una organización

Si una organización necesita auditar cambios de privilegios y operaciones realizadas en MongoDB, recomendaría utilizar MongoDB Enterprise o un servicio de Atlas que incluya las capacidades de auditoría necesarias.

La razón es que la auditoría nativa ofrece mecanismos específicos para registrar eventos de seguridad, mientras que el perfilador de Community está pensado principalmente para analizar operaciones y rendimiento.

También recomendaría almacenar las evidencias en un sistema externo, mantener respaldos periódicos y separar las responsabilidades de administración y auditoría.

Es importante aclarar que durante este laboratorio solamente se comprobó el funcionamiento de MongoDB Community. Las capacidades de Enterprise y Atlas se consultaron en documentación y no se probaron directamente.

## 8. Preguntas de reflexión

### ¿Por qué el perfilador no debe presentarse como un mecanismo de auditoría de seguridad?

Porque su objetivo principal es registrar y analizar operaciones para conocer su comportamiento y rendimiento. No proporciona una auditoría completa de todos los eventos de seguridad, como los cambios de privilegios.

### ¿Por qué el perfilador sí aporta trazabilidad aunque no sea auditoría?

Porque permite conocer qué operaciones se realizaron, sobre qué colección, en qué momento y desde qué usuario o aplicación. Esta información ayuda a reconstruir parte de lo que ocurrió en la base de datos.

### ¿Qué riesgo introduce el nivel 2 al registrar filtros de consultas que pueden contener datos personales?

Puede almacenar información sensible que aparece dentro de las consultas, como nombres, RFC o correos electrónicos. Además, genera una mayor cantidad de registros y puede afectar el rendimiento y el almacenamiento.

### ¿Qué diferencia hay entre detectar un cambio y atribuirlo a alguien?

Detectar un cambio significa comprobar que una información o configuración fue modificada. Atribuirlo significa identificar quién realizó la operación, cuándo y desde dónde. Las instantáneas permitieron detectar el cambio de privilegios, pero no identificar directamente al responsable.

### ¿Por qué reconocer una limitación técnica es parte del trabajo profesional del DBA?

Porque permite explicar con honestidad qué información puede demostrar el sistema y qué cosas no puede comprobar. También ayuda a identificar riesgos y proponer mecanismos adicionales para mejorar la seguridad y la trazabilidad.

## 9. Conclusión general

Con este laboratorio pude comprobar las capacidades y limitaciones de MongoDB Community para registrar operaciones y conservar evidencias.

Aprendí a configurar el perfilador, interpretar la bitácora de mongod, identificar accesos exitosos y fallidos, revisar privilegios y utilizar instantáneas como un control compensatorio.

También comprobé que algunos registros pueden perderse después de un reinicio, por lo que es importante exportar la información y generar hashes para verificar su integridad.

Finalmente, comprendí que el perfilador y la bitácora ayudan a reconstruir lo ocurrido, pero no sustituyen un mecanismo de auditoría completo. Para una organización que necesita mayor trazabilidad, es necesario considerar soluciones de auditoría nativa y almacenamiento externo de evidencias.

## 10. Referencias

- MongoDB, Inc. — MongoDB Manual, Auditing: https://www.mongodb.com/docs/manual/core/auditing/
- MongoDB, Inc. — MongoDB Manual, Database Profiler: https://www.mongodb.com/docs/manual/tutorial/manage-the-database-profiler/
- MongoDB, Inc. — MongoDB Manual, Database Profiler Output: https://www.mongodb.com/docs/manual/reference/database-profiler/
- MongoDB, Inc. — MongoDB Manual, Log Messages: https://www.mongodb.com/docs/manual/reference/log-messages/
- MongoDB, Inc. — MongoDB Manual, getLog: https://www.mongodb.com/docs/manual/reference/command/getLog/
- LAB-01 — Bitácoras y auditoría del dato en PostgreSQL.
- LAB-02 — Trazabilidad en MongoDB Community.