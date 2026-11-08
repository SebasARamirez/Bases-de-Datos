# Actividad 5 — Accesos en la bitácora de mongod

## 1. Objetivo

Identificar cómo MongoDB registra los intentos de autenticación exitosos y fallidos, y analizar las diferencias entre una contraseña incorrecta y un usuario inexistente.

## 2. Intentos de autenticación fallidos

Se realizaron dos intentos de conexión desde PowerShell utilizando mongosh.

### 2.1 Contraseña incorrecta

Se intentó ingresar con el usuario `app_ventas`, utilizando una contraseña incorrecta.

El servidor respondió:

```text
MongoServerError: Authentication failed.
```

En la bitácora se encontró:

- Usuario: `app_ventas`.
- Conexión: `conn65`.
- Fecha: 2026-11-08 04:34:39.619 UTC.
- Aplicación: `mongosh 2.14.1`.
- Error: `AuthenticationFailed: SCRAM authentication failed, storedKey mismatch`.
- Código de resultado: 18.

### 2.2 Usuario inexistente

Se intentó ingresar utilizando el usuario `usuario_inexistente`.

El servidor respondió:

```text
MongoServerError: Authentication failed.
```

En la bitácora se encontró:

- Usuario: `usuario_inexistente`.
- Conexión: `conn67`.
- Fecha: 2026-11-08 04:34:45.950 UTC.
- Aplicación: `mongosh 2.14.1`.
- Error: `UserNotFound: Could not find user "usuario_inexistente" for db "comercial"`.
- Código de resultado: 11.

Este intento generó dos líneas de bitácora asociadas a la misma conexión, por lo que se considera un solo intento fallido.

## 3. Identificación de un acceso exitoso

También se consultaron los eventos de autenticación exitosa del usuario `app_ventas`.

Se encontró el siguiente registro:

- Usuario: `app_ventas`.
- Conexión: `conn57`.
- Fecha: 2026-11-08 04:29:17.808 UTC.
- Aplicación: `app-ventas-web`.
- Cliente: `172.17.0.1:37406`.
- Código de resultado: 0.

El resultado `0` confirma que la autenticación fue exitosa.

## 4. Comparación de los resultados

| Tipo de acceso | Usuario | Código | Resultado |
|---|---|---|---|
| Exitoso | app_ventas | 0 | Autenticación correcta |
| Fallido | app_ventas | 18 | Contraseña incorrecta |
| Fallido | usuario_inexistente | 11 | Usuario no encontrado |

Se comprobó que MongoDB registra información diferente dependiendo del motivo por el cual falla la autenticación.

## 5. Análisis de las preguntas

### ¿Qué campo distingue un acceso fallido de uno exitoso?

El campo `msg` permite distinguir los eventos mediante los mensajes `Successfully authenticated` y `Failed to authenticate`.

También se puede revisar el campo `attr.result`, que muestra el código de resultado. En esta práctica, el código 0 representa una autenticación exitosa, mientras que los códigos 18 y 11 corresponden a los dos errores encontrados.

### ¿Qué diferencia hay entre el error de contraseña incorrecta y el de usuario inexistente? ¿Por qué el cliente recibe el mismo mensaje en ambos casos?

Cuando la contraseña es incorrecta, MongoDB genera un error `AuthenticationFailed`, con código 18.

Cuando el usuario no existe, genera un error `UserNotFound`, con código 11.

Aunque internamente son errores diferentes, el cliente recibe el mismo mensaje `Authentication failed` para evitar revelar si un usuario existe o no en el sistema.

Esto ayuda a prevenir que alguien pueda identificar usuarios válidos mediante intentos de autenticación.

### ¿Por qué el nombre de la aplicación del intento fallido es mongosh 2.14.1 y no app-ventas-web?

Porque los intentos fallidos se realizaron directamente desde PowerShell utilizando MongoDB Shell (`mongosh`).

En cambio, el acceso exitoso que utilizamos para comparar fue realizado mediante la aplicación identificada como `app-ventas-web`.

Por eso MongoDB registra diferentes nombres de aplicación.

## 6. Conclusión

En esta actividad se comprobó que MongoDB registra información útil sobre los intentos de autenticación.

Se identificaron dos tipos de errores: contraseña incorrecta y usuario inexistente. Aunque ambos muestran el mismo mensaje al cliente, la bitácora permite diferenciarlos mediante sus códigos y descripciones internas.

También se comprobó que es posible identificar las conexiones exitosas y conocer qué aplicación realizó la autenticación.

Esto demuestra la importancia de revisar las bitácoras del servidor para investigar problemas de acceso y detectar posibles intentos de ingreso no autorizado.