# Actividad 9 — Sesiones activas con pg_stat_activity

## Objetivo

Comprobar cómo podemos identificar las sesiones que están conectadas a PostgreSQL utilizando `pg_stat_activity` y relacionarlas con los registros de la bitácora.

## 1. Procedimiento realizado

Primero me conecté a la base de datos `comercial` utilizando el usuario `soporte_ana` y ejecuté una consulta que tardaba 90 segundos en terminar:

```sql
SELECT pg_sleep(90);
```

La intención era simular un reporte que permaneciera ejecutándose durante un tiempo considerable.

Mientras la consulta estaba en ejecución, abrí pgAdmin con el usuario administrador `postgres` y ejecuté:

```sql
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    backend_start,
    state,
    left(query, 30) AS query
FROM pg_stat_activity
WHERE backend_type = 'client backend';
```

## 2. Resultados obtenidos

La consulta permitió identificar la sesión de `soporte_ana` con los siguientes datos:

- **PID:** 16164.
- **Usuario:** soporte_ana.
- **Aplicación:** reporte-mensual.
- **Dirección del cliente:** 127.0.0.1.
- **Estado:** active.
- **Consulta ejecutada:** SELECT pg_sleep(90).

Después busqué ese mismo PID en la bitácora:

```sql
SELECT num, linea
FROM dba.bitacora
WHERE linea LIKE '%[16164]%'
ORDER BY num;
```

Encontré registros relacionados con la conexión del usuario.

Una vez que terminó la consulta de 90 segundos, también apareció su desconexión en la bitácora.

Finalmente, volví a consultar `pg_stat_activity` y comprobé que la sesión con PID 16164 ya no aparecía entre las conexiones activas.

Esto demostró que `pg_stat_activity` muestra información sobre las sesiones actuales, mientras que la bitácora permite consultar registros de sesiones que ya finalizaron.

## 3. Preguntas

### 1. ¿Qué columna permite relacionar una sesión con sus líneas de bitácora?

La columna `pid`, que identifica al proceso de PostgreSQL asociado con una sesión.

En nuestro caso, la sesión tenía el PID `16164`, por lo que pudimos buscar ese número dentro de la bitácora y encontrar los registros correspondientes.

Esto es posible porque configuramos `log_line_prefix` para incluir el PID mediante `%p`.

### 2. Después de que termina el reporte, ¿qué fuente conserva evidencia de que existió?

La bitácora de PostgreSQL.

Cuando terminó el reporte, la sesión dejó de aparecer en `pg_stat_activity`, pero sus registros de conexión y desconexión permanecieron en el archivo de bitácora.

Por eso, `pg_stat_activity` sirve para observar lo que está ocurriendo en ese momento, mientras que la bitácora permite revisar acontecimientos anteriores.

### 3. ¿Por qué client_addr aparece vacío en la sesión del administrador?

Porque la columna `client_addr` puede aparecer vacía cuando la conexión se realiza mediante un mecanismo local que no utiliza una dirección IP TCP.

En PostgreSQL, esto sucede, por ejemplo, con las conexiones realizadas mediante sockets locales.

En cambio, la sesión de `soporte_ana` se conectó por TCP utilizando `127.0.0.1`, por lo que esa dirección sí apareció registrada.

## 4. Evidencias

- `09-sesion-activa.png`: muestra la sesión de soporte mientras se ejecutaba el reporte.
- `09-bitacora-pid.png`: muestra los registros asociados con el PID 161