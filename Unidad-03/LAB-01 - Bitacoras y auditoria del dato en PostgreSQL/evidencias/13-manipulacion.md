# Actividad 14 — Intentar manipular la auditoría

## Objetivo

Comprobar si un usuario común puede modificar los registros de auditoría o desactivar el disparador, y analizar qué sucede cuando el administrador realiza estas operaciones.

## 1. Procedimiento realizado

### Primer intento: eliminar registros de auditoría

Primero utilicé el usuario `app_ventas` para intentar eliminar los registros de auditoría:

```sql
DELETE FROM auditoria.cambios_clientes;
```

PostgreSQL rechazó la operación porque el usuario no tenía permisos para acceder al esquema `auditoria`.

### Segundo intento: desactivar el disparador

Después intenté desactivar el disparador utilizando el mismo usuario:

```sql
ALTER TABLE clientes DISABLE TRIGGER trg_auditoria_clientes;
```

La operación también fue rechazada porque `app_ventas` no era el propietario de la tabla `clientes`.

### Tercer intento: desactivar el disparador como administrador

Posteriormente, utilizando el usuario `postgres`, ejecuté:

```sql
ALTER TABLE clientes DISABLE TRIGGER trg_auditoria_clientes;

UPDATE clientes SET rfc = 'GAMA780912GHI' WHERE id = 3;

ALTER TABLE clientes ENABLE TRIGGER trg_auditoria_clientes;
```

Primero desactivé el disparador, después modifiqué el RFC de María García y finalmente volví a activarlo.

Al revisar la tabla de auditoría, comprobé que seguía teniendo tres eventos. Esto significa que la modificación realizada mientras el disparador estaba desactivado no generó un nuevo registro.

También verifiqué que el disparador había quedado activado nuevamente.

## 2. Resultados obtenidos

Los resultados fueron los siguientes:

| Operación | Usuario | Resultado |
|---|---|---|
| Eliminar registros de auditoría | app_ventas | Rechazado |
| Desactivar el disparador | app_ventas | Rechazado |
| Desactivar el disparador | postgres | Exitoso |
| Modificar el RFC con el disparador desactivado | postgres | Exitoso, sin registro en la tabla de auditoría |
| Reactivar el disparador | postgres | Exitoso |

Aunque el cambio realizado por el administrador no apareció en `auditoria.cambios_clientes`, la bitácora del servidor sí conservó las instrucciones relacionadas con la desactivación, modificación y reactivación del disparador.

Esto demuestra que ambos mecanismos de registro se complementan.

## 3. Preguntas

### 1. ¿Qué evidencia permite detectar que hubo un cambio sin auditar?

La bitácora del servidor.

En ella encontramos las instrucciones utilizadas por `postgres` para desactivar el disparador, modificar el RFC y volver a activarlo.

Sin embargo, en la tabla de auditoría no apareció un nuevo evento correspondiente a esa modificación.

Al comparar ambas fuentes podemos identificar que se realizó un cambio mientras la auditoría estaba desactivada.

### 2. ¿Qué control administrativo (no técnico) reduciría este riesgo?

Una medida sería establecer un procedimiento de autorización para modificar o desactivar los mecanismos de auditoría.

Por ejemplo, el administrador tendría que solicitar autorización y justificar el motivo antes de desactivar un disparador.

También sería conveniente que otra persona o área revisara estas acciones periódicamente para detectar cambios que no estén justificados.

### 3. Relaciona esta actividad con el principio de separación de funciones de la Unidad II.

El principio de separación de funciones consiste en distribuir las responsabilidades entre diferentes personas para evitar que una sola tenga control sobre todo.

En esta actividad comprobé que el administrador podía desactivar el disparador y modificar información sin dejar un registro en la tabla de auditoría.

Por eso, sería más seguro que la persona encargada de administrar la base de datos no fuera la misma que controla y conserva todas las evidencias de auditoría.

Así, otra área podría revisar los cambios realizados por los administradores y detectar posibles irregularidades.

## 4. Evidencias

- `14-eliminacion-auditoria-denegada.png`: muestra que `app_ventas` no pudo eliminar los registros de auditoría.
- `14-desactivar-trigger-denegado.png`: muestra que `app_ventas` no pudo desactivar el disparador.
- `14-trigger-reactivado.png`: confirma que el disparador volvió a quedar habilitado.
- `14-cambio-sin-auditoria.png`: muestra que la modificación no generó un nuevo evento en la tabla de auditoría.
- `14-manipulacion-bitacora.png`: muestra las instrucciones registradas en la bitácora del servidor