# Actividad 7 — Modificaciones de datos: ddl frente a mod

## Objetivo

Comparar los niveles de registro `ddl` y `mod` de PostgreSQL para comprobar cuáles permiten identificar las modificaciones realizadas en los datos de una tabla.

## 1. Procedimiento realizado

### Primera prueba: log_statement = 'ddl'

Primero, con el nivel `ddl` activado, utilicé el usuario `app_ventas` para modificar el RFC de María García:

```sql
UPDATE clientes SET rfc = 'GAMA780912XYZ' WHERE id = 3;
```

La operación se ejecutó correctamente y modificó un registro.

Después consulté la bitácora y encontré información sobre la conexión y desconexión del usuario `app_ventas`, pero no apareció la sentencia `UPDATE`.

Esto ocurrió porque el nivel `ddl` registra principalmente instrucciones de definición de datos y administración de permisos, pero no las modificaciones normales de registros.

### Segunda prueba: log_statement = 'mod'

Posteriormente, como administrador, cambié el nivel de registro:

```sql
ALTER SYSTEM SET log_statement = 'mod';
SELECT pg_reload_conf();
```

Después volví a utilizar `app_ventas` para ejecutar una modificación y una consulta:

```sql
UPDATE clientes SET telefono = '6679990000' WHERE id = 3;

SELECT nombre, rfc FROM clientes WHERE id = 3;
```

Ambas instrucciones se ejecutaron correctamente.

## 2. Resultados obtenidos

Al revisar nuevamente la bitácora, encontré que PostgreSQL había registrado la instrucción utilizada para modificar el teléfono:

```sql
UPDATE clientes SET telefono = '6679990000' WHERE id = 3;
```

También aparecieron datos que permiten identificar:

- La fecha y hora de ejecución.
- El usuario `app_ventas`.
- La base de datos `comercial`.
- La aplicación `app-ventas-web`.
- La dirección del cliente `127.0.0.1`.
- La sentencia SQL ejecutada.

Sin embargo, la instrucción `SELECT` no apareció registrada.

Esto demuestra que el nivel `mod` registra modificaciones como `INSERT`, `UPDATE` y `DELETE`, pero no las consultas normales de lectura.

También comprobé que el cambio de configuración a `log_statement = 'mod'` quedó registrado porque anteriormente estaba activo el nivel `ddl`.

## 3. Preguntas

### 1. ¿Qué nivel habría registrado la lectura del RFC? ¿Qué costo tendría en un servidor con miles de consultas por minuto?

El nivel `log_statement = 'all'` habría registrado también la consulta `SELECT` utilizada para leer el RFC.

Sin embargo, en un servidor con miles de consultas por minuto esto podría generar una gran cantidad de registros.

Como consecuencia, aumentaría el espacio de almacenamiento necesario, el trabajo de escritura de la bitácora y el tiempo requerido para revisar los eventos.

Por eso es importante elegir el nivel de registro de acuerdo con las necesidades de seguridad y rendimiento del sistema.

### 2. ¿Qué le falta a esta bitácora para revertir el cambio con certeza?

La bitácora registra la sentencia SQL utilizada para modificar el teléfono, pero no conserva automáticamente el valor anterior del campo.

Por lo tanto, aunque sabemos que el teléfono cambió a `6679990000`, no podemos determinar únicamente con esa sentencia cuál era el valor anterior.

Para revertir el cambio con certeza necesitaríamos guardar tanto el valor anterior como el nuevo.

Esto se puede conseguir mediante una tabla de auditoría y un disparador que registre los cambios realizados, como implementamos posteriormente en la Parte B del laboratorio.

## 4. Evidencias

- `07-actualizacion-ddl.png`: muestra la modificación del RFC cuando estaba configurado el nivel `ddl`.
- `07-modificacion-y-consulta.png`: muestra la modificación del teléfono y la consulta posterior.
- `07-registro-mod.png`: muestra que la bitácora registró la modificación del teléfono con el nivel `mod`.

## Conclusión

En esta actividad comprobé que el nivel `ddl` no es suficiente para registrar las modificaciones normales de los datos.

Al cambiar a `mod`, PostgreSQL comenzó a registrar las instrucciones `UPDATE`, lo que permitió identificar el usuario, la aplicación y la sentencia ejecutada.

Sin embargo, también observé que este registro no guarda automáticamente los valores anteriores de los campos modificados.

Por eso, aunque la bitácora ayuda a investigar los cambios, es necesario complementarla con una auditoría de datos para conocer exactamente qué información cambió.