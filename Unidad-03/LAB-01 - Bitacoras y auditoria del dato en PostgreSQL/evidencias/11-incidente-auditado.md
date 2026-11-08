# Actividad 12 — El incidente auditado

## Objetivo

Comprobar que el disparador de auditoría registra los cambios realizados en la tabla `clientes`, incluyendo el usuario responsable, los valores anteriores y nuevos, y otros datos relacionados con la operación.

## 1. Procedimiento realizado

Primero utilicé el usuario `app_ventas` para modificar nuevamente el RFC de María García:

```sql
UPDATE clientes SET rfc = 'GAMA780912ZZZ' WHERE id = 3;
```

La operación se ejecutó correctamente y devolvió `UPDATE 1`.

Después intenté consultar directamente la tabla de auditoría utilizando ese mismo usuario:

```sql
SELECT * FROM auditoria.cambios_clientes;
```

PostgreSQL rechazó la consulta porque `app_ventas` no tenía permisos para acceder al esquema `auditoria`.

Finalmente, utilizando el usuario administrador `postgres`, revisé los eventos registrados en la tabla de auditoría.

## 2. Resultados obtenidos

La tabla `auditoria.cambios_clientes` contenía un evento correspondiente a la modificación realizada.

Los datos principales fueron:

| Campo | Valor |
|---|---|
| id_evento | 1 |
| usuario_sesion | app_ventas |
| usuario_efectivo | postgres |
| aplicacion | app-ventas-web |
| ip_cliente | 127.0.0.1 |
| operacion | UPDATE |
| id_cliente | 3 |

Al comparar los valores anteriores y nuevos, encontré lo siguiente:

| Campo modificado | Valor anterior | Valor nuevo |
|---|---|---|
| rfc | GAMA780912XYZ | GAMA780912ZZZ |

Esto confirmó que el disparador había guardado correctamente los dos valores del RFC.

También comprobé que `usuario_sesion` conservaba el nombre de `app_ventas`, mientras que `usuario_efectivo` mostraba `postgres`.

Esto ocurrió porque la función de auditoría utiliza `SECURITY DEFINER`, por lo que se ejecuta con los privilegios de su propietario.

## 3. Preguntas

### 1. Compara tu hipótesis de la Actividad 11 con este resultado.

Mi hipótesis era que, sin `SECURITY DEFINER`, el disparador podría fallar cuando `app_ventas` intentara modificar un cliente, porque este usuario no tiene permisos para insertar registros en la tabla de auditoría.

Con el resultado obtenido comprobé que `SECURITY DEFINER` permite que la función registre el cambio utilizando los privilegios de su propietario, aunque el usuario que realizó la modificación no tenga acceso directo al esquema `auditoria`.

Además, el campo `usuario_sesion` permite identificar quién inició la operación, evitando que todos los cambios aparezcan únicamente como realizados por `postgres`.

### 2. Escribe la sentencia UPDATE que restauraría el valor anterior.

Para restaurar el RFC que tenía María García antes de la modificación de esta actividad, utilizaría:

```sql
UPDATE clientes
SET rfc = 'GAMA780912XYZ'
WHERE id = 3;
```

Esta instrucción permitiría recuperar el valor anterior que quedó registrado en la tabla de auditoría.

No fue necesario ejecutarla durante esta actividad; solamente se plantea como una posible forma de restaurar el dato.

### 3. ¿Qué columna conserva más valor para una investigación: aplicacion o ip_cliente? ¿Cuál puede falsificar el cliente con más facilidad?

Considero que `ip_cliente` proporciona información más útil sobre el origen de una conexión, porque permite identificar la dirección desde la que se conectó el usuario.

Por otro lado, `aplicacion` permite saber qué nombre de aplicación declaró el cliente al establecer la conexión.

Sin embargo, ese nombre puede modificarse fácilmente utilizando el parámetro `application_name`, por lo que no es una prueba segura de identidad.

Aunque la dirección IP también tiene limitaciones, resulta útil para complementar una investigación junto con el usuario, la fecha y los demás registros.

## 4. Evidencias

- `12-modificacion-rfc.png`: muestra la modificación del RFC realizada por `app_ventas`.
- `12-acceso-auditoria-denegado.png`: muestra que el usuario no tenía permisos para consultar la auditoría.
- `12-registro-auditoria.png`: muestra el evento registrado por el disparador.
- `12-valores-antes-despues.png`: muestra la comparación del RFC anterior y el nuevo.

## Conclusión

En esta actividad comprobé que el disparador permite conocer con mayor detalle los cambios realizados en los datos.

A diferencia de la bitácora normal, la tabla de auditoría conservó el RFC anterior y el nuevo, junto con el usuario y la información de la conexión.

También comprobé que `SECURITY DEFINER` permite registrar las modificaciones sin dar acceso directo a la tabla de auditoría a los usuarios comunes.

Esto facilita investigar cambios incorrectos y recuperar información anterior cuando sea necesario.