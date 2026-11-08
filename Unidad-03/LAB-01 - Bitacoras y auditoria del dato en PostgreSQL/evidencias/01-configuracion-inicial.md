# Actividad 1 — Configuración inicial de registro

**Estudiante:** Sebastian Ramirez Alvarez

## Objetivo

Revisar la configuración inicial de las bitácoras de PostgreSQL para identificar qué eventos se registran y cuáles no.

## Comando utilizado

```sql
SELECT name, setting, source
FROM pg_settings
WHERE name IN ('log_destination', 'logging_collector', 'log_directory', 'log_filename',
               'log_connections', 'log_disconnections', 'log_line_prefix',
               'log_statement', 'log_min_error_statement', 'log_timezone')
ORDER BY name;
```

## Resultados obtenidos

- `log_connections`: off
- `log_disconnections`: off
- `log_statement`: none
- `log_line_prefix`: %m [%p]
- `logging_collector`: on
- `log_destination`: stderr
- `log_directory`: log
- `log_timezone`: America/Chihuahua

La consulta también confirmó que `log_min_error_statement` tiene el valor `error`.

**Evidencia:** `01-configuracion-inicial.png`

## Preguntas

**1. Con esta configuración, ¿se registra quién se conecta?**

No se registran todas las conexiones porque `log_connections` está desactivado. Sin embargo, algunos intentos fallidos pueden aparecer como errores en la bitácora.

**2. ¿Se registran las sentencias UPDATE?**

No, porque `log_statement` tiene el valor `none`, por lo que las modificaciones normales no se registran como sentencias ejecutadas.

**3. ¿La línea de bitácora incluye el usuario o la dirección IP del cliente?**

No directamente, porque el prefijo `%m [%p]` solamente incluye la fecha, la hora y el identificador del proceso. Algunos mensajes pueden contener información adicional, pero no está incluida en el prefijo.

**4. ¿En qué zona horaria se registran los eventos? ¿Por qué importa al reconstruir una cronología?**

Se utiliza `America/Chihuahua`. Es importante conocer la zona horaria para ordenar correctamente los eventos y comparar registros de distintos sistemas sin confundir las horas.

**5. Con logging_collector = off, ¿quién decide dónde termina la bitácora: PostgreSQL o el mecanismo con que se desplegó el servidor?**

Si estuviera desactivado, el destino dependería del mecanismo con el que se inició el servidor. En nuestro caso está activado, por lo que PostgreSQL utiliza su propio colector para guardar la bitácora en archivos.

## Conclusión

La configuración inicial no registra todas las conexiones ni las modificaciones realizadas en la base de datos. Aunque el colector ya está activado, necesitamos configurar otros parámetros para obtener información suficiente durante una auditoría.