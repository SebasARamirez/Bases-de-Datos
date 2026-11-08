# Actividad 17 — Reconstrucción de la cronología

## Objetivo

Reconstruir los eventos ocurridos en la base de datos `comercial` utilizando la bitácora de PostgreSQL y la tabla `auditoria.cambios_clientes`, para identificar accesos, modificaciones y errores.

## 1. Cronología de los eventos

Las fechas y horas corresponden a los registros del servidor PostgreSQL, en la zona horaria CST (UTC-6).

| # | Fecha y hora | Usuario | Cliente | Tipo de evento | Qué ocurrió | ¿Exitoso? | Fuente |
|---|---|---|---|---|---|---|---|
| 1 | 07/11/2026 16:36:03 | app_ventas | — | Acceso | Intento de conexión con contraseña incorrecta. | No | Bitácora, línea 18 |
| 2 | 07/11/2026 16:52:59 | usuario_inexistente | — | Acceso | Intento de conexión de un usuario que no existe. | No | Bitácora, línea 37 |
| 3 | 07/11/2026 16:56:21 | postgres | — | Privilegios | Se otorgó el permiso UPDATE sobre clientes a app_ventas. | Sí | Bitácora, línea 45 |
| 4 | 07/11/2026 16:56:24 | postgres | — | Estructura | Se agregó la columna segmento a la tabla clientes. | Sí | Bitácora, línea 46 |
| 5 | 07/11/2026 17:23:56 | postgres | — | Configuración | Se cambió log_statement al nivel mod. | Sí | Bitácora, línea 57 |
| 6 | 07/11/2026 17:25:12 | app_ventas | María García | Datos | Se actualizó el teléfono del cliente con ID 3. | Sí | Bitácora, UPDATE del teléfono |
| 7 | 07/11/2026 17:29:13 | soporte_ana | Cliente ID 5 | Error | Intentó eliminar un cliente sin tener permiso. | No | Bitácora, error de permisos |
| 8 | 07/11/2026 17:51:07 | app_ventas | María García | Datos | Se modificó el RFC de GAMA780912XYZ a GAMA780912ZZZ. | Sí | Auditoría, evento 1 |
| 9 | 07/11/2026 17:56:11 | postgres | Pedro Ruiz | Datos | Se insertó un cliente nuevo. | Sí | Auditoría, evento 2 |
| 10 | 07/11/2026 17:56:37 | postgres | Pedro Ruiz | Datos | Se eliminó al cliente que se había registrado. | Sí | Auditoría, evento 3 |
| 11 | 07/11/2026 18:01:54 | postgres | María García | Manipulación | Se desactivó el trigger, se modificó el RFC y después se volvió a activar. | Sí | Bitácora, líneas 313–317 |
| 12 | 07/11/2026 18:08:16 | postgres | Cinco clientes | Datos | Se actualizó la columna segmento de todos los clientes. | Sí | Auditoría, eventos 4–8 |

## 2. Respuestas a Dirección

### 1. ¿Quién modificó el RFC de María García?

En la Actividad 3 realizamos el primer cambio utilizando `app_ventas`, pero todavía no estaban configuradas las bitácoras para registrar las modificaciones. Por lo tanto, **no hay evidencia histórica suficiente en el servidor para atribuir ese primer cambio**.

En la Actividad 7 también realizamos una modificación del RFC con `app_ventas`, pero el nivel `ddl` no registraba las operaciones UPDATE normales.

En la Actividad 12 sí quedó demostrado que `app_ventas` modificó el RFC, gracias al evento 1 de la tabla de auditoría.

Finalmente, en la Actividad 14 encontramos que `postgres` modificó el RFC mientras el trigger estaba desactivado. La instrucción quedó en la bitácora, pero no se generó un nuevo evento en la tabla de auditoría.

### 2. ¿Cuándo ocurrieron las modificaciones?

La modificación auditada de la Actividad 12 ocurrió el 7 de noviembre de 2026 a las 17:51:07, según el registro del servidor.

La manipulación de la Actividad 14 ocurrió aproximadamente a las 18:01:54 del mismo día, según la bitácora.

Para el primer incidente no existe un registro histórico de la modificación con fecha y hora exactas. No debemos inventarlas.

### 3. ¿Desde qué aplicación o equipo se realizaron los cambios?

En la Actividad 12, la auditoría registró la aplicación `psql` y la dirección IP `127.0.0.1`, que corresponde a una conexión local.

En la Actividad 14, la modificación se realizó desde pgAdmin con el usuario administrador `postgres`.

El nombre de la aplicación ayuda a identificar el origen de una operación, aunque no demuestra por sí solo la identidad de una persona.

### 4. ¿Hubo intentos de acceso fallidos?

Sí. Encontramos intentos de autenticación fallidos de `postgres`, `app_ventas`, `soporte_ana` y `usuario_inexistente`.

En las pruebas realizadas durante el laboratorio se observaron conexiones desde `127.0.0.1`, que corresponde al propio equipo.

Estos eventos quedaron registrados como errores `FATAL` en la bitácora de PostgreSQL.

### 5. ¿Qué valor tenía el RFC antes de cada cambio?

Al inicio del laboratorio, María García tenía el RFC `GAMA780912GHI`.

Durante las pruebas se realizaron las siguientes modificaciones:

- **Actividad 3:** de `GAMA780912GHI` a `GAMA780912XXX`. El cambio se observó durante la ejecución, pero no quedó registrado como sentencia en la bitácora.
- **Actividad 7:** de `GAMA780912XXX` a `GAMA780912XYZ`. No quedó un historial automático de valores anteriores y nuevos.
- **Actividad 12:** de `GAMA780912XYZ` a `GAMA780912ZZZ`. Ambos valores quedaron registrados en la tabla de auditoría.
- **Actividad 14:** de `GAMA780912ZZZ` a `GAMA780912GHI`. La bitácora registró la instrucción, pero el trigger estaba desactivado y no guardó los valores anteriores y nuevos.

La Actividad 12 proporciona la evidencia más completa, porque permite consultar directamente el valor anterior y el nuevo.

### 6. ¿Quién modificó el teléfono de María García?

El usuario `app_ventas` modificó el teléfono de María García a `6679990000`.

La instrucción UPDATE quedó registrada en la bitácora cuando teníamos activado `log_statement = 'mod'`.

## 3. Conclusión

Con este laboratorio comprobé que los permisos de acceso no son suficientes para saber qué ocurrió dentro de una base de datos.

La bitácora de PostgreSQL permite revisar conexiones, errores y sentencias ejecutadas, mientras que la tabla de auditoría conserva información más detallada sobre los cambios realizados.

También comprobé que existen limitaciones importantes. Si una modificación ocurre antes de activar los registros, no se puede reconstruir completamente. Además, un administrador puede desactivar el disparador y realizar cambios sin generar nuevos eventos en la tabla de auditoría.

Por eso, es importante mantener la auditoría activada, proteger las bitácoras y conservar las evidencias en un lugar seguro.