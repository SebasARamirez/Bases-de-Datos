# Actividad 4 — Configurar la bitácora

## Objetivo

Configurar PostgreSQL para registrar las conexiones, desconexiones y sentencias SQL importantes, con el fin de contar con información que permita identificar lo que ocurre dentro del servidor.

## 1. Procedimiento realizado

En la base de datos `comercial`, utilizando el usuario administrador `postgres`, ejecuté las siguientes instrucciones:

```sql
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_line_prefix = '%m [%p] user=%u db=%d app=%a client=%h ';
ALTER SYSTEM SET log_statement = 'ddl';
```

Después recargué la configuración del servidor:

```sql
SELECT pg_reload_conf();
```

Esta instrucción permitió aplicar los cambios sin necesidad de reiniciar PostgreSQL.

## 2. Resultados obtenidos

Para comprobar la configuración ejecuté:

```sql
SELECT name, setting, source
FROM pg_settings
WHERE name IN (
    'log_connections',
    'log_disconnections',
    'log_line_prefix',
    'log_statement'
)
ORDER BY name;
```

Los resultados finales fueron:

| Parámetro | Valor |
|---|---|
| log_connections | on |
| log_disconnections | on |
| log_line_prefix | %m [%p] user=%u db=%d app=%a client=%h |
| log_statement | ddl |

Los cuatro parámetros mostraron `configuration file` como origen.

Al principio, `log_connections` y `log_disconnections` seguían apareciendo como `off` en el Query Tool que ya tenía abierto. Después de abrir una conexión nueva en pgAdmin, comprobé que ambos estaban activados correctamente.

También consulté las últimas líneas de `dba.bitacora` y encontré registros de conexiones recibidas, autenticadas, autorizadas y desconexiones.

Además, encontré una sentencia `ALTER SYSTEM SET log_connections = on` registrada después de haber activado el nivel `ddl`.

## 3. Preguntas

### 1. ¿Por qué el proceso que registra el cambio es el principal y no tu sesión?

Porque la sesión del administrador solicita la modificación de la configuración, pero es el servidor PostgreSQL el que aplica los nuevos parámetros durante la recarga.

Por eso, los mensajes relacionados con los cambios de configuración pueden aparecer asociados al proceso principal del servidor.

### 2. ¿Qué pasaría si alguien ejecutara ALTER SYSTEM SET log_statement = 'none'? ¿Quedaría rastro?

Sí, podría quedar evidencia de esa instrucción si se ejecuta mientras `log_statement` todavía está configurado en `ddl` o `mod`.

También puede registrarse el cambio del parámetro al recargar la configuración.

Sin embargo, después de aplicar `none`, PostgreSQL dejaría de registrar las sentencias SQL normales mediante `log_statement`. Por eso es importante proteger la configuración y conservar las bitácoras.

### 3. ¿Por qué no se recomienda editar postgresql.auto.conf a mano?

Porque este archivo es administrado por PostgreSQL mediante `ALTER SYSTEM`.

Modificarlo manualmente puede provocar errores de configuración o conflictos con los valores establecidos por el servidor.

Es preferible utilizar `ALTER SYSTEM` y después comprobar los resultados desde PostgreSQL.

## 4. Evidencias

Las capturas correspondientes a esta actividad son:

- `04-configuracion-bitacora.png`: muestra los cuatro parámetros configurados correctamente.
- `04-conexiones-registradas.png`: muestra los eventos de conexión y desconexión registrados.
- `04-cambio-configuracion.png`: muestra una instrucción de cambio de configuración registrada en la bitácora.

## Conclusión

En esta actividad configuré PostgreSQL para registrar conexiones, desconexiones y cambios importantes relacionados con la estructura y los permisos de la base de datos.

También comprobé que algunos parámetros requieren abrir una sesión nueva para observar sus valores actualizados.

Con esta configuración, la bitácora ofrece información más útil para identificar usuarios, revisar conexiones y detectar cambios realizados en el servidor.