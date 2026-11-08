# Actividad 3 — El incidente sin bitácora

## Objetivo

Simular la modificación del RFC de una clienta y comprobar si PostgreSQL permite identificar quién realizó el cambio cuando todavía no está configurado para registrar las sentencias SQL.

## 1. Procedimiento realizado

Me conecté a la base de datos `comercial` utilizando el usuario `app_ventas` y ejecuté la siguiente instrucción:

```sql
UPDATE clientes SET rfc = 'GAMA780912XXX' WHERE id = 3;
```

El resultado fue `UPDATE 1`, lo que confirmó que el RFC de María García se modificó correctamente.

Después, desde pgAdmin y utilizando el usuario administrador `postgres`, busqué información relacionada con la modificación en la bitácora:

```sql
SELECT linea FROM dba.bitacora
WHERE linea ILIKE '%update%' OR linea LIKE '%app_ventas%';
```

La consulta devolvió un registro relacionado con un intento fallido de autenticación de `app_ventas`, pero no encontró la sentencia `UPDATE` que habíamos ejecutado.

Esto ocurrió porque todavía teníamos `log_statement = none` y `log_connections = off`.

## 2. Preguntas

### 1. ¿Puedes demostrar quién modificó el RFC?

No. Aunque durante la práctica sabemos que utilizamos `app_ventas`, la bitácora no registró la sentencia `UPDATE`, por lo que no tenemos evidencia histórica suficiente para demostrar quién realizó la modificación.

### 2. ¿Puedes demostrar que el cambio no lo hizo soporte_ana?

No directamente con la bitácora, porque no quedó registrado quién realizó el cambio.

Sin embargo, sabemos que `soporte_ana` solamente tenía permiso `SELECT`, así que no podía modificar normalmente la tabla `clientes` utilizando sus propios privilegios.

### 3. Los privilegios de la Unidad II, ¿impidieron el cambio? ¿Debían impedirlo?

No impidieron el cambio, porque `app_ventas` tenía permiso `UPDATE` sobre la tabla `clientes`.

Tampoco debían impedirlo, ya que ese permiso era necesario para que la aplicación de ventas pudiera actualizar información.

El problema no fue que el usuario tuviera acceso, sino que no existía un registro suficiente para comprobar posteriormente lo que había hecho.

### 4. ¿Qué tendría que haber estado configurado antes del incidente?

Debíamos tener activado el registro de conexiones y un nivel de `log_statement` que incluyera las modificaciones, como `mod`.

También sería conveniente contar con una tabla de auditoría y un disparador para guardar los valores anteriores y nuevos de cada modificación.

## 3. Evidencias

- `03-modificacion-rfc.png`: muestra que la instrucción UPDATE se ejecutó correctamente.
- `03-incidente-sin-bitacora.png`: muestra que no encontramos la modificación en la bitácora.

## Conclusión

En esta actividad comprobé que tener permisos bien configurados no significa que podamos saber todo lo que ocurre en la base de datos.

Aunque el usuario `app_ventas` modificó correctamente el RFC de María García, no quedó un registro de esa sentencia en la bitácora.

Esto demuestra la importancia de configurar la auditoría antes de que ocurra un incidente, porque los eventos que no fueron registrados no pueden recuperarse posteriormente mediante la bitácora.