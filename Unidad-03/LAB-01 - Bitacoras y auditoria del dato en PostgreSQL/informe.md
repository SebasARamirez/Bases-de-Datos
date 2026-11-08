# LAB-01 — Bitácoras y auditoría del dato en PostgreSQL

## 1. Introducción

En este laboratorio trabajé con las bitácoras y los mecanismos de auditoría de PostgreSQL para aprender a identificar quién se conecta a una base de datos, qué operaciones realiza y qué información se modifica.

El objetivo principal fue investigar cambios realizados sobre los datos de clientes, especialmente el RFC de María García, y comprobar qué información podemos recuperar cuando contamos con registros de auditoría.

También realicé pruebas de accesos fallidos, modificaciones de permisos, errores, sesiones activas y manipulación del sistema de auditoría.

## 2. Despliegue y situación inicial

Para realizar las actividades utilicé PostgreSQL 16 instalado localmente en Windows 11, junto con pgAdmin 4 y PowerShell.

Trabajé con la base de datos `comercial`, que contenía una tabla llamada `clientes` con cinco registros ficticios.

También utilicé los siguientes usuarios:

- `postgres`: administrador de la base de datos.
- `app_ventas`: usuario con permisos para consultar y modificar clientes.
- `soporte_ana`: usuario con permisos de consulta.

Al revisar la configuración inicial, encontré que `logging_collector` ya estaba activado, pero `log_connections` y `log_disconnections` estaban desactivados y `log_statement` tenía el valor `none`.

Esto significaba que el servidor podía guardar mensajes y errores, pero no estaba preparado para registrar las modificaciones normales de los datos.

Durante la Actividad 3, cambié el RFC de María García utilizando `app_ventas`. Aunque la operación funcionó, no encontré la sentencia UPDATE en la bitácora.

Por eso, con la configuración inicial no era posible demostrar mediante los registros quién había realizado ese cambio.

## 3. Configuración aplicada

Para mejorar el registro de eventos, configuré los siguientes parámetros:

| Parámetro | Valor | Aplicación |
|---|---|---|
| logging_collector | on | Ya estaba activado. Cambiarlo requeriría reiniciar el servidor. |
| log_connections | on | Recarga de configuración; las sesiones nuevas reflejan el cambio. |
| log_disconnections | on | Recarga de configuración; las sesiones nuevas reflejan el cambio. |
| log_line_prefix | %m [%p] user=%u db=%d app=%a client=%h | Recarga de configuración. |
| log_statement | ddl, posteriormente mod | Recarga de configuración. |

Para aplicar los cambios utilicé `pg_reload_conf()`.

El prefijo de línea fue importante porque permitió mostrar la fecha y hora, el PID, el usuario, la base de datos, la aplicación y la dirección del cliente.

También creé el esquema `dba` y la vista `dba.bitacora` para consultar los archivos de registro desde SQL.

Tuve un problema de codificación al intentar leer el archivo de bitácora en Windows. Lo resolví utilizando `pg_read_binary_file()` junto con `convert_from()` y la codificación `WIN1252`.

## 4. Eventos observados

Durante las prácticas encontré diferentes tipos de eventos en la bitácora.

| Tipo | Ejemplo observado | Interpretación |
|---|---|---|
| Acceso exitoso | `app_ventas` consultó la cantidad de clientes. | El usuario consiguió autenticarse y ejecutar su consulta. |
| Acceso fallido | Intento de conexión con contraseña incorrecta. | PostgreSQL rechazó la autenticación. |
| Privilegios | `GRANT UPDATE ON clientes TO app_ventas` | Se concedió un permiso de modificación. |
| Estructura | `ALTER TABLE clientes ADD COLUMN segmento` | Se modificó la estructura de la tabla. |
| Datos | Actualización del teléfono de María García. | Quedó registrada la sentencia UPDATE. |
| Error | `soporte_ana` intentó eliminar un cliente. | La operación fue rechazada por falta de permisos. |
| Sesión | Ejecución de `pg_sleep(90)`. | Se pudo observar una sesión activa y después su desconexión. |

Una diferencia importante fue que `log_statement = 'ddl'` registraba cambios de estructura y permisos, pero no las modificaciones normales de datos.

Al cambiarlo a `mod`, pude identificar instrucciones UPDATE. Sin embargo, las consultas SELECT continuaron sin registrarse.

## 5. Auditoría del dato

En la segunda parte del laboratorio creé el esquema `auditoria` y la tabla `auditoria.cambios_clientes`.

Esta tabla contiene información como el identificador del evento, momento, usuario, aplicación, dirección IP, operación realizada, cliente afectado y valores anteriores y nuevos.

Para automatizar el registro creé la función `auditoria.registrar_cambio_cliente()` y el disparador `trg_auditoria_clientes`.

El disparador se ejecuta después de cada operación INSERT, UPDATE o DELETE sobre la tabla `clientes`.

La función utiliza `SECURITY DEFINER`, lo que permite registrar los cambios con los privilegios del propietario de la función, sin dar acceso directo a la tabla de auditoría a los usuarios comunes.

También fue importante guardar `session_user`, porque identifica el usuario que inició la sesión. En cambio, `current_user` dentro de la función mostraba `postgres`, debido a los privilegios con los que se ejecutaba.

### Resultado del incidente auditado

En la Actividad 12, `app_ventas` modificó nuevamente el RFC de María García.

La auditoría guardó lo siguiente:

| Dato | Resultado |
|---|---|
| Usuario | app_ventas |
| Operación | UPDATE |
| Cliente | ID 3, María García |
| RFC anterior | GAMA780912XYZ |
| RFC nuevo | GAMA780912ZZZ |
| IP | 127.0.0.1 |

Esta vez sí fue posible conocer tanto el valor anterior como el nuevo.

También comprobé que `app_ventas` no podía consultar directamente la tabla de auditoría.

## 6. Limitaciones encontradas

Durante las actividades identifiqué tres limitaciones importantes.

**Lecturas de datos:** el disparador no registra consultas SELECT y `log_statement = 'mod'` tampoco. Por eso, la consulta de datos sensibles realizada por `soporte_ana` no quedó registrada como lectura.

**Volumen de información:** al actualizar el segmento de cinco clientes mediante una sola sentencia SQL, la bitácora registró una sentencia, mientras que el disparador generó cinco eventos. En una tabla con muchos registros, esto podría consumir bastante almacenamiento.

**Control del administrador:** comprobé que `postgres` podía desactivar el disparador, modificar el RFC y volver a activarlo. Esa modificación no generó un evento en la tabla de auditoría, aunque las instrucciones sí quedaron registradas en la bitácora del servidor.

Esto demuestra que ningún mecanismo de auditoría controlado completamente por el mismo administrador garantiza una protección absoluta.

## 7. Riesgos y conservación de la bitácora

Una bitácora puede contener información sensible, como nombres de usuarios, direcciones IP, instrucciones SQL e incluso contraseñas escritas directamente en las sentencias.

Durante la práctica encontré que la contraseña utilizada para crear un rol temporal había quedado registrada en texto claro.

Por eso, al exportar el archivo `bitacora-lab01.log`, sustituí esa contraseña por `<REDACTED>`.

Después calculé un resumen SHA-256 y lo guardé en `bitacora-lab01.sha256`.

Este resumen permite comprobar si el contenido del archivo cambió respecto a la copia utilizada para calcularlo, pero no impide que alguien modifique la bitácora.

También es importante proteger los archivos contra accesos no autorizados y guardar copias fuera del servidor que los produce.

Como propuesta para esta práctica, conservaría las bitácoras durante 90 días para consulta operativa y hasta un año en un almacenamiento protegido, siempre que las necesidades del negocio y las políticas aplicables lo justifiquen.

El periodo definitivo tendría que establecerse mediante una política formal de retención.

## 8. Cronología del incidente

Para reconstruir los acontecimientos utilicé dos fuentes:

- La bitácora del servidor PostgreSQL.
- La tabla `auditoria.cambios_clientes`.

Con ambas fuentes pude identificar accesos fallidos, cambios de permisos, modificaciones de estructura, operaciones sobre los clientes y acciones relacionadas con la desactivación del disparador.

La cronología detallada, con las fechas, usuarios y fuentes, se encuentra en `evidencias/15-cronologia.md`.

La principal conclusión fue que **no todos los cambios pueden reconstruirse con el mismo nivel de detalle**.

Los cambios realizados cuando no existía un registro adecuado no pueden demostrarse completamente mediante la bitácora.

En cambio, el incidente de la Actividad 12 sí quedó documentado con el usuario y los valores anteriores y nuevos del RFC.

## 9. Preguntas de la Actividad 16

### 1. ¿Un resumen SHA-256 impide que alguien modifique la bitácora? ¿Qué permite demostrar?

No impide las modificaciones. Su función es permitir comprobar la integridad del archivo.

Si calculamos nuevamente el hash y obtenemos un valor diferente al original, significa que el contenido del archivo cambió.

### 2. ¿Dónde debería guardarse el hash?

En un lugar separado y protegido, donde las mismas personas que pueden modificar la bitácora no puedan alterar fácilmente el hash de referencia.

Por ejemplo, podría conservarse en un sistema de evidencias administrado por el área de seguridad.

### 3. ¿Qué riesgos tiene conservar la bitácora solamente en el servidor que la produce?

Si el servidor falla, se reinstala o alguien elimina los registros, podríamos perder la evidencia.

Además, un administrador con control total del servidor podría modificar o borrar los archivos.

Por eso conviene mantener copias protegidas en otro sistema.

### 4. ¿Durante cuánto tiempo conservarías esta bitácora?

Para este caso propongo conservarla 90 días para consultas frecuentes y hasta un año en un archivo protegido.

Esto permitiría investigar incidentes detectados posteriormente, sin guardar información indefinidamente.

El periodo tendría que revisarse según las necesidades del negocio y las obligaciones de privacidad.

## 10. Preguntas de reflexión

### 1. ¿Por qué la auditoría no puede configurarse después de un incidente para investigarlo?

Porque PostgreSQL no puede recuperar automáticamente eventos que nunca registró.

Esto lo comprobé cuando cambié el RFC durante la Actividad 3 y no encontré la sentencia UPDATE en la bitácora.

### 2. ¿Por qué conviene que la bitácora la administre el propio servidor y no el mecanismo de despliegue?

Porque PostgreSQL puede generar y administrar sus archivos de registro de una manera más consistente.

También permite configurar qué eventos registrar y consultar su ubicación.

Sin embargo, es necesario respaldar esos archivos y no depender únicamente del almacenamiento local.

### 3. ¿Por qué el prefijo de línea es tan importante como el nivel de log_statement?

Porque `log_statement` determina qué sentencias se registran, pero el prefijo permite saber cuándo ocurrieron y con qué usuario, aplicación y conexión se relacionan.

Sin esa información sería más difícil investigar los eventos.

### 4. ¿Qué diferencia práctica hay entre registrar la sentencia y registrar el cambio en el dato?

Registrar una sentencia permite saber qué instrucción SQL se ejecutó.

Registrar el cambio en el dato permite conocer qué información tenía un registro antes y cómo quedó después.

La tabla de auditoría ofrece más detalle para investigar y restaurar modificaciones.

### 5. ¿Qué evidencia ofrece pg_stat_activity que no ofrece la bitácora, y viceversa?

`pg_stat_activity` permite observar las sesiones activas y las consultas que están ejecutándose en ese momento.

La bitácora permite revisar eventos anteriores, como conexiones, errores y sentencias registradas, incluso después de que las sesiones hayan terminado.

Ambas herramientas se complementan.

### 6. Si el administrador puede cambiar log_statement a none y desactivar el disparador, ¿quién audita al administrador?

Lo más conveniente sería que una persona o área independiente de seguridad revisara sus actividades.

También sería importante enviar las bitácoras a un sistema externo, donde el administrador de la base de datos no pudiera modificarlas libremente.

Esto se relaciona con la separación de funciones, porque no debería depender todo el control de una sola persona.

## 11. Conclusión general

Este laboratorio me ayudó a comprender por qué es importante contar con bitácoras y mecanismos de auditoría en una base de datos.

Al principio podía modificar información, pero no tenía suficiente evidencia para investigar quién había realizado los cambios.

Después de configurar los registros y crear el disparador, pude identificar usuarios, operaciones y valores anteriores y nuevos.

También aprendí que la auditoría tiene limitaciones: algunas consultas no quedan registradas, las modificaciones masivas generan muchos eventos y los administradores pueden tener suficiente control para alterar los mecanismos de registro.

Por eso considero que una buena auditoría necesita tanto herramientas técnicas como políticas de seguridad, respaldo de evidencias y separación de responsabilidades.