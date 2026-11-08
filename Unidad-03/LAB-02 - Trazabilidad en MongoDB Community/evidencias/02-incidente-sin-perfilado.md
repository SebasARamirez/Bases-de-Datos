# Actividad 2 — El incidente sin perfilado

## 1. Objetivo

Comprobar qué información puede recuperar un administrador cuando ocurre una modificación de datos en MongoDB Community con el perfilador desactivado.

## 2. Estado inicial

Se utilizó MongoDB Community 7.0.45, ejecutado mediante Docker, y MongoDB Shell (mongosh) 2.14.1.

La base de datos utilizada fue `comercial`, con el usuario de aplicación `app_ventas`, que tiene permisos de lectura y escritura.

Antes de realizar la modificación se consultó el estado del perfilador:

```javascript
db.getProfilingStatus()
```

Resultado:

```javascript
{ was: 0, slowms: 100, sampleRate: 1, ok: 1 }
```

El valor `was: 0` indica que el perfilador estaba desactivado.

## 3. Incidente realizado

Se modificó el RFC de María García, identificada con `_id: 3`, utilizando el usuario `app_ventas` y la aplicación `app-ventas-web`.

Operación ejecutada:

```javascript
db.clientes.updateOne(
  { _id: 3 },
  { $set: { rfc: "GAMA780912XXX" } }
)
```

El resultado confirmó que la modificación se realizó correctamente:

- acknowledged: true
- matchedCount: 1
- modifiedCount: 1

Posteriormente se consultó el documento y se confirmó el nuevo RFC:

```javascript
db.clientes.findOne(
  { _id: 3 },
  { nombre: 1, rfc: 1 }
)
```

Resultado:

```javascript
{
  _id: 3,
  nombre: 'María García',
  rfc: 'GAMA780912XXX'
}
```

El RFC inicial era `GAMA780912GHI`, de acuerdo con los datos utilizados para crear los clientes.

## 4. Búsqueda de evidencias

Se realizaron tres comprobaciones desde la sesión del administrador.

### 4.1 Registros del perfilador

```javascript
db.system.profile.countDocuments()
```

Resultado:

```javascript
0
```

No se encontraron operaciones registradas en `system.profile`.

### 4.2 Búsqueda del RFC modificado

```javascript
bitacora().filter(
  e => JSON.stringify(e).includes("GAMA780912XXX")
).length
```

Resultado:

```javascript
0
```

El RFC nuevo no apareció en los registros globales del servidor consultados.

### 4.3 Búsqueda de conexiones de la aplicación

Se consultaron los registros relacionados con `app-ventas-web`.

Se encontraron eventos de tipo `NETWORK` y `ACCESS`, incluyendo conexiones y autenticaciones exitosas.

En los detalles de autenticación se identificó:

- Usuario: `app_ventas`.
- Base de datos: `comercial`.
- Mecanismo: `SCRAM-SHA-256`.
- Resultado de autenticación: exitoso.

También se encontró un intento de autenticación fallido.

Los resultados muestran que el servidor conservó información sobre las conexiones y los procesos de autenticación, pero no el detalle de la modificación del RFC.

## 5. Análisis de las preguntas

### ¿Puedes demostrar qué cambió? ¿Y quién se conectó a esa hora?

Se comprobó que el RFC de María García cambió de `GAMA780912GHI` a `GAMA780912XXX`, mediante la comparación de los datos iniciales y la consulta posterior.

Los registros del servidor muestran que el usuario `app_ventas`, perteneciente a la base `comercial`, se autenticó utilizando la aplicación identificada como `app-ventas-web`.

Sin embargo, no se encontró el detalle de la actualización en el perfilador ni en los registros globales consultados. Por eso no es posible relacionar con certeza una conexión específica con la operación de actualización.

### ¿Por qué mongosh abre varias conexiones (conn8, conn9, etc.) para una sola instrucción?

Porque el cliente MongoDB puede establecer varias conexiones para realizar diferentes tareas de comunicación y monitorización con el servidor.

Cada conexión recibe un identificador diferente, por lo que pueden aparecer varios registros aunque se esté trabajando desde una sola sesión de mongosh.

No significa que todas esas conexiones hayan realizado modificaciones de datos.

### ¿Cuál es la conexión que se autentica?

Las conexiones que muestran el mensaje `Successfully authenticated` son las que completaron correctamente la autenticación.

El mensaje `Connection not authenticating` indica que la conexión todavía no estaba realizando una autenticación.

También se encontró un evento `Failed to authenticate`, que representa un intento fallido.

No se puede asegurar que una conexión específica haya ejecutado la actualización únicamente con los resultados obtenidos.

## 6. Conclusión

Esta actividad permitió comprobar que realizar una modificación correctamente no significa que exista evidencia suficiente para reconstruirla posteriormente.

Aunque el servidor registró información de las conexiones y autenticaciones, no se encontró el detalle de la actualización porque el perfilador estaba desactivado.

Por lo tanto, no fue posible identificar con certeza qué conexión ejecutó la modificación ni recuperar el cambio a partir de los registros del servidor.

Esto demuestra la importancia de configurar mecanismos de registro y monitoreo adecuados para mantener la trazabilidad de las operaciones sobre los datos.