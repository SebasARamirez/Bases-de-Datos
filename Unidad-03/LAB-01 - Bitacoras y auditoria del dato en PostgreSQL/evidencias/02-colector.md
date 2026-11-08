# Actividad 2 — Que el servidor administre su propia bitácora

## Objetivo

Comprobar que PostgreSQL tenga activado el colector de bitácoras y que podamos consultar los registros del servidor desde SQL.

## 1. Configuración del colector

Primero revisé el parámetro `logging_collector` y obtuve los siguientes resultados:

- **logging_collector:** on
- **source:** configuration file

Esto significa que el colector ya estaba activado desde la configuración inicial, por lo que no fue necesario modificar el parámetro ni reiniciar PostgreSQL.

Después ejecuté:

```sql
SELECT pg_current_logfile();
```

El resultado fue:

`log/postgresql-2026-11-07_000000.log`

Con esto comprobé que PostgreSQL estaba utilizando un archivo de bitácora.

## 2. Lectura de la bitácora

Al intentar leer el archivo con `pg_read_file()`, apareció un error relacionado con la codificación UTF-8.

Para solucionarlo, utilicé una consulta adaptada a Windows:

```sql
SELECT linea
FROM regexp_split_to_table(
    convert_from(pg_read_binary_file(pg_current_logfile()), 'WIN1252'),
    E'\n'
) AS linea
LIMIT 20;
```

La consulta funcionó y mostró registros de conexiones fallidas, errores y eventos internos del servidor.

Después creé el esquema `dba` y la vista `dba.bitacora`, utilizando la misma adaptación de codificación.

Finalmente comprobé que la vista funcionaba con esta consulta:

```sql
SELECT num, linea
FROM dba.bitacora
ORDER BY num DESC
LIMIT 10;
```

La consulta devolvió las últimas diez líneas de la bitácora correctamente.

## 3. Preguntas

### 1. ¿Por qué logging_collector requiere reinicio y log_statement solo recarga?

Porque `logging_collector` controla cómo PostgreSQL administra los archivos de registro desde que inicia el servidor, así que necesita un reinicio para aplicar cambios.

En cambio, `log_statement` permite cambiar qué instrucciones se registran y puede actualizarse mediante una recarga de configuración, sin reiniciar el servidor.

### 2. ¿Qué ventaja tiene que la bitácora se lea con SQL y no con una herramienta del sistema operativo o del contenedor? ¿Qué riesgo introduce?

La ventaja es que podemos consultar y filtrar los registros directamente desde PostgreSQL, sin tener que abrir manualmente los archivos del servidor.

El riesgo es que, si damos acceso a personas que no deberían tenerlo, podrían consultar información sensible como usuarios, direcciones IP, rutas o instrucciones SQL que quedaron registradas.

### 3. ¿Quién debería poder consultar dba.bitacora?

Solamente el administrador de la base de datos y las personas autorizadas para realizar auditorías o revisiones de seguridad.

Los usuarios comunes, como `app_ventas` y `soporte_ana`, no deberían tener acceso porque podrían consultar información que no necesitan para realizar su trabajo.

## 4. Evidencias

Las capturas correspondientes a esta actividad son:

- `02-colector-activado.png`
- `02-archivo-bitacora.png`
- `02-lectura-bitacora.png`
- `02-vista-bitacora.png`

## Conclusión

En esta actividad comprobé que PostgreSQL ya tenía activado el colector de bitácoras y estaba guardando los registros en un archivo.

También pude consultar esos registros desde SQL mediante una vista. Aunque tuve que adaptar la lectura por un problema de codificación en Windows, al final funcionó correctamente.

Esto facilita la revisión de los eventos del servidor, pero también demuestra por qué es importante restringir el acceso a las bitácoras.