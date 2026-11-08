# Actividad 15 — Límites: lecturas y volumen

## Objetivo

Comprobar las limitaciones de la bitácora y del disparador de auditoría al realizar consultas de datos sensibles y modificaciones masivas en la tabla `clientes`.

## 1. Procedimiento realizado

### Primera prueba: lectura de datos sensibles

Utilicé el usuario `soporte_ana` para consultar los datos de María García:

```sql
SELECT nombre, rfc, telefono
FROM clientes
WHERE id = 3;
```

La consulta se ejecutó correctamente y mostró el RFC `GAMA780912GHI` y el teléfono `6679990000`.

Después revisé la bitácora para comprobar si había quedado registrada la consulta.

### Segunda prueba: actualización masiva

Utilizando el usuario administrador `postgres`, ejecuté:

```sql
UPDATE clientes SET segmento = 'regular';
```

La instrucción modificó los cinco registros existentes en la tabla `clientes`.

Posteriormente consulté tanto la bitácora del servidor como la tabla de auditoría para comparar los resultados.

## 2. Resultados obtenidos

Los resultados fueron los siguientes:

| Comprobación | Resultado |
|---|---|
| Líneas de bitácora de la actualización masiva | 1 |
| Eventos DELETE en la tabla de auditoría | 1 |
| Eventos INSERT en la tabla de auditoría | 1 |
| Eventos UPDATE en la tabla de auditoría | 6 |
| Lecturas de soporte registradas en la bitácora | 0 |

La actualización masiva generó una sola línea en la bitácora porque se ejecutó mediante una única sentencia SQL.

Sin embargo, el disparador creó cinco eventos nuevos porque está configurado para ejecutarse por cada fila modificada.

Los seis eventos UPDATE acumulados corresponden al cambio de RFC registrado en la Actividad 12 y a las cinco filas actualizadas en esta actividad.

También comprobé que la lectura del RFC realizada por `soporte_ana` no quedó registrada, porque `log_statement = 'mod'` no registra consultas SELECT y el disparador no se ejecuta durante las lecturas.

## 3. Preguntas

### 1. Si clientes tuviera un millón de registros, ¿qué ocurriría con la auditoría tras un UPDATE sin WHERE?

Si ejecutáramos un UPDATE sin WHERE que afectara un millón de registros, el disparador generaría un millón de eventos en la tabla de auditoría.

Esto provocaría un crecimiento considerable del almacenamiento utilizado y podría aumentar el tiempo necesario para completar la actualización.

Por eso es importante controlar las modificaciones masivas y considerar el impacto que pueden tener sobre el rendimiento y el tamaño de la auditoría.

### 2. Propón quién podría autorizar la depuración de auditoria.cambios_clientes.

Considero que la depuración debería ser autorizada por el responsable de los datos, con la participación del área de seguridad o privacidad.

El administrador de la base de datos podría encargarse de ejecutar la eliminación de registros, pero no debería decidir por su cuenta qué evidencias borrar.

También sería necesario comprobar que los registros hayan cumplido su periodo de conservación y que no estén relacionados con alguna investigación pendiente.

### 3. ¿Por qué log_statement = 'all' puede convertir la bitácora en un nuevo depósito de datos sensibles?

Porque este nivel registra todas las sentencias SQL, incluyendo las consultas SELECT.

Algunas instrucciones pueden contener RFC, correos electrónicos, teléfonos, contraseñas u otra información sensible escrita directamente en el SQL.

Si todas esas consultas quedan almacenadas en la bitácora, el archivo podría acumular información personal que también necesitaría protección.

Además, registrar todas las sentencias produciría una mayor cantidad de información y aumentaría el espacio necesario para conservarla.

## 4. Evidencias

- `15-consulta-datos-sensibles.png`: muestra la consulta realizada por `soporte_ana`.
- `15-actualizacion-bitacora.png`: muestra la actualización masiva registrada en la bitácora.
- `15-volumen-auditoria.png`: muestra la cantidad de eventos registrados por operación.
- `15-lecturas-no-registradas.png`: confirma que no encontramos la consulta de lectura en la bitácora.

## Conclusión

En esta actividad comprobé que la bitácora y el disparador de auditoría registran información diferente.

La bitácora guarda las sentencias ejecutadas, mientras que el disparador conserva un evento por cada registro modificado.

También aprendí que nuestro sistema de auditoría no registra las consultas de lectura y que una actualización masiva puede generar una gran cantidad de eventos.

Por eso es importante elegir los mecanismos de auditoría considerando tanto la seguridad de la información como el rendimiento del servidor.