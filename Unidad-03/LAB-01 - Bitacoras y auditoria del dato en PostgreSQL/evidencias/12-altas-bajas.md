# Actividad 13 — Altas y bajas

## Objetivo

Comprobar que la tabla de auditoría registra las operaciones INSERT y DELETE, conservando los datos de un cliente incluso después de que sea eliminado de la tabla original.

## 1. Procedimiento realizado

Primero, utilizando el usuario administrador `postgres`, registré un cliente nuevo en la tabla `clientes`:

```sql
INSERT INTO clientes (nombre, correo, rfc, edad, ciudad, codigo_postal)
VALUES ('Pedro Ruiz', 'pedro.ruiz@example.test', 'RUPE950101AAA', 30, 'Guasave', '81000');
```

La operación se ejecutó correctamente y agregó un registro.

Después eliminé ese mismo cliente:

```sql
DELETE FROM clientes WHERE nombre = 'Pedro Ruiz';
```

Finalmente, consulté la tabla `auditoria.cambios_clientes` para comprobar si ambas operaciones habían quedado registradas.

## 2. Resultados obtenidos

La tabla de auditoría mostró dos eventos nuevos:

| Campo | Evento 2 | Evento 3 |
|---|---|---|
| id_evento | 2 | 3 |
| usuario_sesion | postgres | postgres |
| operacion | INSERT | DELETE |
| id_cliente | 6 | 6 |
| rfc_antes | NULL | RUPE950101AAA |
| rfc_despues | RUPE950101AAA | NULL |

En el evento INSERT, el campo `valores_antes` estaba vacío porque el cliente todavía no existía.

En el evento DELETE, el campo `valores_despues` estaba vacío porque el cliente había sido eliminado.

Aunque Pedro Ruiz ya no estaba en la tabla `clientes`, sus datos continuaban disponibles en el historial de auditoría.

## 3. Preguntas

### 1. El cliente Pedro Ruiz ya no existe en clientes. ¿Dónde queda evidencia de que existió y de sus datos?

La evidencia permanece en la tabla `auditoria.cambios_clientes`.

Los eventos 2 y 3 registraron la inserción y eliminación de Pedro Ruiz, incluyendo su identificador, RFC y los demás datos almacenados.

Esto permite comprobar que el cliente existió, aunque posteriormente haya sido eliminado de la tabla original.

### 2. ¿Por qué ip_cliente está vacía en los eventos 2 y 3?

Porque las operaciones fueron realizadas por el administrador mediante una conexión local que no proporcionó una dirección IP TCP.

La función `inet_client_addr()` devuelve NULL cuando la conexión utiliza un mecanismo local sin dirección IP de cliente.

Por eso, el campo `ip_cliente` puede estar vacío en algunos eventos.

### 3. La política de retención de la Unidad II pedía eliminar datos cuando ya no fueran necesarios. ¿Qué conflicto aparece? ¿Quién debe resolverlo?

El conflicto es que, aunque eliminemos los datos personales de la tabla principal, pueden seguir almacenados en la tabla de auditoría.

Esto ayuda a investigar incidentes, pero también puede provocar que conservemos información personal durante más tiempo del necesario.

Para resolverlo, se necesita una política de retención que indique cuánto tiempo deben conservarse los registros de auditoría y cuándo deben eliminarse o anonimizarse.

Esta decisión debe tomarse entre los responsables de la información, las áreas de seguridad y privacidad y los administradores de la base de datos, considerando las obligaciones legales y las necesidades del negocio.

## 4. Evidencia

- `13-altas-bajas.png`: muestra las operaciones de inserción y eliminación del cliente Pedro Ruiz.

## Conclusión

En esta actividad comprobé que el disparador registra correctamente las operaciones INSERT y DELETE.

También aprendí que una tabla de auditoría permite conservar evidencia de registros que ya fueron eliminados de la tabla original.

Sin embargo, esto implica una responsabilidad adicional, porque los datos personales también deben protegerse dentro del historial y eliminarse cuando ya no sea necesario conservarlos.