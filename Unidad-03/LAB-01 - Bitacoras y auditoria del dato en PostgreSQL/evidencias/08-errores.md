# Actividad 8 — Errores y operaciones rechazadas

## Objetivo

Comprobar cómo PostgreSQL registra las operaciones que son rechazadas por falta de permisos y los errores relacionados con la administración de roles.

## 1. Procedimiento realizado

### Primer intento: eliminar un cliente sin permiso

Utilicé el usuario `soporte_ana` para intentar eliminar un registro de la tabla `clientes`:

```sql
DELETE FROM clientes WHERE id = 5;
```

PostgreSQL rechazó la operación porque `soporte_ana` solamente tenía permiso para consultar los datos, no para eliminarlos.

El resultado fue un error de permisos sobre la tabla `clientes`.

### Segundo intento: eliminar un rol con dependencias

Después, utilizando el usuario administrador `postgres`, intenté eliminar el rol `soporte_ana`:

```sql
DROP ROLE soporte_ana;
```

PostgreSQL también rechazó esta operación porque el rol todavía tenía privilegios asociados con la tabla `clientes`.

## 2. Resultados obtenidos

Al consultar la vista `dba.bitacora`, encontré registros relacionados con ambos errores.

En el primer caso, la bitácora permitió identificar al usuario `soporte_ana` y la instrucción `DELETE` que había intentado ejecutar.

En el segundo caso, mostró que el administrador intentó eliminar el rol y que la operación falló debido a las dependencias existentes.

Esto demuestra que PostgreSQL puede registrar operaciones rechazadas, incluso cuando no llegan a modificar los datos.

También comprobé que estos errores se registran gracias a la configuración `log_min_error_statement = error`, independientemente del nivel utilizado en `log_statement`.

## 3. Preguntas

### 1. ¿El intento de soporte_ana causó algún daño? ¿Por qué debe auditarse de todos modos?

No, porque PostgreSQL rechazó la instrucción y no se eliminó ningún cliente.

Sin embargo, es importante registrar este tipo de intentos porque pueden indicar que un usuario está tratando de realizar operaciones que no le corresponden.

Aunque una operación falle, la información puede servir para investigar errores de configuración, problemas de uso o posibles intentos de acceso indebido.

### 2. ¿Qué diferencia hay entre un error de autorización (esta actividad) y uno de autenticación (Actividad 5)?

Un error de autenticación ocurre cuando PostgreSQL no permite que alguien inicie sesión porque las credenciales son incorrectas o el usuario no existe.

En cambio, un error de autorización ocurre cuando un usuario sí puede conectarse, pero intenta ejecutar una operación para la que no tiene permisos.

En nuestro caso, `soporte_ana` logró conectarse a la base de datos, pero no tenía autorización para eliminar registros.

### 3. ¿Qué indica el error de DROP ROLE sobre el orden correcto para dar de baja a un usuario?

Indica que, antes de eliminar un rol, debemos revisar los permisos y dependencias que tiene dentro de la base de datos.

El procedimiento correcto sería retirar o reasignar los privilegios y objetos que dependan de ese rol y después eliminarlo.

De esta manera evitamos errores y mantenemos un mejor control sobre los accesos.

## 4. Evidencias

- `08-error-permisos.png`: muestra el intento fallido de eliminar un cliente utilizando `soporte_ana`.
- `08-error-eliminar-rol.png`: muestra el error al intentar eliminar un rol con dependencias.
- `08-errores-bitacora.png`: muestra los registros de ambos errores en la bitácora.

## Conclusión

En esta actividad comprobé que PostgreSQL no solamente registra operaciones exitosas, sino también errores y acciones rechazadas.

El intento de eliminar un cliente no provocó cambios porque los permisos estaban configurados correctamente.

También aprendí que, para eliminar un usuario, primero debemos revisar sus privilegios y dependencias.

Estos registros son importantes porque permiten investigar acciones sospechosas y comprobar que las restricciones de seguridad están funcionando.