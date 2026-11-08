# Actividad 5 — Accesos exitosos y fallidos

## Objetivo

Comprobar cómo PostgreSQL registra los intentos de conexión exitosos y fallidos, para identificar usuarios, direcciones de origen y posibles problemas de seguridad.

## 1. Procedimiento realizado

Realicé tres pruebas de conexión a la base de datos `comercial` utilizando PostgreSQL desde PowerShell.

**Primer intento: contraseña incorrecta**

Intenté conectarme con el usuario `app_ventas`, pero utilizando una contraseña incorrecta.

PostgreSQL rechazó la conexión y mostró un error `FATAL` de autenticación.

**Segundo intento: usuario inexistente**

Intenté conectarme utilizando el usuario `usuario_inexistente`.

La conexión también fue rechazada porque ese rol no existe en PostgreSQL.

**Tercer intento: acceso correcto**

Finalmente, me conecté con las credenciales correctas de `app_ventas` y ejecuté:

```sql
SELECT count(*) FROM clientes;
```

La consulta devolvió **5 registros**, lo que confirmó que la conexión se realizó correctamente.

## 2. Revisión de la bitácora

Para identificar los registros de estas pruebas, consulté la vista `dba.bitacora` y busqué los eventos relacionados con las conexiones desde `127.0.0.1`.

Encontré mensajes como:

- `FATAL`: error de autenticación.
- `LOG`: conexión recibida.
- `LOG`: autenticación exitosa.
- `LOG`: conexión autorizada.
- `LOG`: desconexión.

También observé información sobre el usuario, la base de datos, la aplicación, la dirección del cliente y el método de autenticación `scram-sha-256`.

## 3. Preguntas

### 1. La bitácora registra el usuario app_ventas en el intento fallido. ¿Eso prueba que la aplicación de ventas intentó entrar? ¿Qué prueba realmente?

No necesariamente.

La bitácora demuestra que alguien intentó conectarse utilizando el nombre de usuario `app_ventas`, pero eso no significa que haya sido la aplicación de ventas.

Cualquier persona podría intentar utilizar ese nombre de usuario. Como la autenticación falló, no podemos asegurar quién estaba detrás del intento.

### 2. ¿Qué información adicional registra PostgreSQL cuando el rol no existe? ¿Por qué aparece en la bitácora y no en el mensaje que recibe el cliente?

En la bitácora PostgreSQL registra información adicional indicando que el rol solicitado no existe.

El cliente recibe un mensaje de error de autenticación más general.

Esto es importante porque mostrar demasiados detalles al cliente podría ayudar a una persona a descubrir qué usuarios existen en la base de datos. En cambio, el administrador necesita esa información para investigar los intentos fallidos.

### 3. ¿Por qué app=[unknown] en el intento fallido, pero app=app-ventas-web en la desconexión?

Porque durante el intento fallido no se completó la conexión y PostgreSQL no llegó a identificar el nombre de la aplicación.

En la conexión exitosa sí se estableció `application_name=app-ventas-web`, por lo que ese nombre apareció en los registros posteriores, incluyendo la desconexión.

Esto permite relacionar las conexiones autorizadas con la aplicación que las realizó.

### 4. ¿Qué patrón de varias líneas te haría sospechar de un ataque de fuerza bruta?