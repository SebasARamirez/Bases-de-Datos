# Actividad 6 — Cambios de privilegios y de estructura

## Objetivo

Comprobar cómo PostgreSQL registra las modificaciones de permisos, los cambios en la estructura de las tablas y la creación o eliminación de roles cuando `log_statement` está configurado en `ddl`.

## 1. Procedimiento realizado

Primero ejecuté las siguientes instrucciones como administrador de la base de datos `comercial`:

```sql
REVOKE UPDATE ON clientes FROM soporte_ana;

GRANT UPDATE ON clientes TO app_ventas;

ALTER TABLE clientes ADD COLUMN segmento VARCHAR(20);
```

La primera instrucción revocó el permiso de modificación a `soporte_ana`, aunque este usuario ya tenía únicamente permisos de consulta.

La segunda otorgó el permiso `UPDATE` a `app_ventas`.

La tercera agregó una columna llamada `segmento` a la tabla `clientes`.

Después creé un rol temporal con contraseña y lo eliminé para comprobar si esas instrucciones también aparecían en la bitácora.

## 2. Resultados obtenidos

Al consultar `dba.bitacora`, encontré registros de las instrucciones ejecutadas:

- `REVOKE UPDATE ON clientes FROM soporte_ana`
- `GRANT UPDATE ON clientes TO app_ventas`
- `ALTER TABLE clientes ADD COLUMN segmento VARCHAR(20)`
- `CREATE ROLE rol_temporal`
- `DROP ROLE rol_temporal`

Esto confirmó que PostgreSQL estaba registrando las modificaciones relacionadas con permisos, estructura y roles.

También observé un riesgo importante: la instrucción utilizada para crear el rol temporal quedó registrada con su contraseña en texto claro en la bitácora original.

Aunque posteriormente eliminé el rol, ese registro permaneció en el archivo.

Al exportar la bitácora en la Actividad 16, sustituí la contraseña temporal por `<REDACTED>` para evitar exponerla en la copia de evidencia.

## 3. Preguntas

### 1. ¿Qué tipo de evento es cada una de las tres primeras sentencias (privilegio o estructura)?

- **REVOKE UPDATE:** evento de privilegios, porque retira un permiso sobre una tabla.
- **GRANT UPDATE:** evento de privilegios, porque concede un permiso sobre una tabla.
- **ALTER TABLE:** evento de estructura, porque modifica la definición de una tabla al agregar una columna.

### 2. ¿Por qué GRANT y REVOKE quedan registrados con log_statement = 'ddl'?

Porque PostgreSQL incluye las instrucciones de administración de privilegios, como `GRANT` y `REVOKE`, dentro de las sentencias que registra el nivel `ddl`.

Por lo tanto, no es necesario activar `log_statement = 'all'` para registrar estos cambios.

### 3. Si la bitácora contiene contraseñas, ¿quién debería poder leerla? Relaciónalo con la gestión de secretos de la Unidad II.

Solamente el administrador del servidor y las personas autorizadas para realizar auditorías de seguridad deberían poder consultar la bitácora.

Esto se relaciona con lo visto en la Unidad II, porque las contraseñas y otras credenciales deben protegerse para evitar accesos no autorizados.

Si una contraseña aparece en una instrucción SQL registrada, cualquier persona que tenga acceso al archivo podría conocerla.

Por eso es importante evitar escribir contraseñas directamente en las sentencias cuando sea posible, utilizar mecanismos seguros de administración de credenciales y restringir los permisos de lectura sobre las bitácoras.

Por ejemplo, el comando `\password` de `psql` permite cambiar una contraseña sin enviar una sentencia SQL que contenga la contraseña en texto claro.

También es necesario revisar y censurar los secretos antes de compartir o publicar archivos de registro.

## 4. Evidencia

- `06-privilegios-estructura.png`: muestra las instrucciones de permisos, estructura y roles registradas en la bitácora, con la contraseña censurada en la presentación.

## Conclusión

En esta actividad comprobé que el nivel `ddl` registra cambios importantes en los permisos y la estructura de la base de datos.

También aprendí que una