# Actividad 3 — Activar el perfilador y registrar operaciones

## 1. Objetivo

Activar el perfilador de MongoDB para registrar las operaciones realizadas por la aplicación y comprobar qué información puede obtenerse sobre las consultas, actualizaciones y eliminaciones.

## 2. Activación del perfilador

Desde la sesión del administrador se activó el nivel 2 del perfilador en la base de datos `comercial`.

Comando ejecutado:

```javascript
db.setProfilingLevel(2)
```

Resultado:

```javascript
{ was: 0, slowms: 100, sampleRate: 1, ok: 1 }
```

Después se verificó la configuración:

```javascript
db.getProfilingStatus()
```

Resultado:

```javascript
{ was: 2, slowms: 100, sampleRate: 1, ok: 1 }
```

Esto confirmó que el perfilador quedó activado en nivel 2.

## 3. Operaciones realizadas por la aplicación

Se utilizó el usuario `app_ventas`, mediante la aplicación `app-ventas-web`.

Se realizaron tres operaciones sobre la colección `comercial.clientes`.

### 3.1 Consulta de clientes

Se buscaron los clientes de Culiacán:

```javascript
db.clientes.find(
  { ciudad: "Culiacán" },
  { nombre: 1, ciudad: 1 }
).toArray()
```

Resultado: se encontraron tres clientes: Ana López, Carlos Pérez y Laura Sánchez.

### 3.2 Actualización de RFC

Se modificó el RFC de María García, identificada con `_id: 3`.

```javascript
db.clientes.updateOne(
  { _id: 3 },
  { $set: { rfc: "GAMA780912XYZ" } }
)
```

Resultado:

- matchedCount: 1
- modifiedCount: 1

La actualización se realizó correctamente.

### 3.3 Eliminación de un cliente

Se eliminó el registro de Carlos Pérez, identificado con `_id: 2`.

```javascript
db.clientes.deleteOne({ _id: 2 })
```

Resultado:

- acknowledged: true
- deletedCount: 1

La eliminación se realizó correctamente.

## 4. Consulta de system.profile

Desde la sesión del administrador se consultaron los registros del perfilador:

```javascript
db.system.profile.find(
  { ns: "comercial.clientes" },
  {
    op: 1,
    ns: 1,
    command: 1,
    user: 1,
    client: 1,
    appName: 1,
    ts: 1,
    millis: 1,
    nreturned: 1,
    docsExamined: 1,
    nModified: 1,
    ndeleted: 1
  }
).sort({ ts: 1 })
```

Se encontraron tres operaciones principales:

| Operación | Usuario | Cliente | Aplicación | Momento (UTC) | Qué hizo | Documentos afectados |
|---|---|---|---|---|---|---|
| query | app_ventas@comercial | 172.17.0.1 | app-ventas-web | 04:16:40.293 | Consultó clientes de Culiacán | 3 devueltos |
| update | app_ventas@comercial | 172.17.0.1 | app-ventas-web | 04:16:50.959 | Modificó el RFC del cliente 3 | 1 modificado |
| remove | app_ventas@comercial | 172.17.0.1 | app-ventas-web | 04:16:56.805 | Eliminó al cliente 2 | 1 eliminado |

Los tres registros corresponden a la base `comercial` y a la colección `clientes`.

## 5. Análisis de las preguntas

### ¿Puedes saber cuál era el RFC antes del cambio con la información de system.profile?

No. El perfilador registra la operación de actualización y el nuevo valor enviado, pero no conserva automáticamente el valor anterior del documento.

### ¿Puedes saber qué datos tenía el documento eliminado?

No. El registro permite identificar el filtro utilizado para eliminarlo y la cantidad de documentos afectados, pero no conserva todos los datos anteriores del documento eliminado.

### A diferencia de log_statement = 'mod' en PostgreSQL, el nivel 2 sí registró la consulta. ¿Qué ventaja y qué riesgo tiene eso?

La ventaja es que permite tener mayor visibilidad de las operaciones realizadas en la base de datos, incluyendo las consultas y modificaciones.

El riesgo es que puede generar una mayor cantidad de registros y almacenar información sensible, por lo que se debe controlar su acceso y conservación.

### ¿Por qué el campo user incluye @comercial?

Porque MongoDB identifica al usuario junto con la base de datos en la que está autenticado. En este caso, `app_ventas@comercial` significa que el usuario `app_ventas` está autenticado en la base de datos `comercial`.

## 6. Conclusión

En esta actividad se comprobó que MongoDB Community permite utilizar el perfilador para registrar las operaciones realizadas sobre una base de datos.

A diferencia de la actividad anterior, ahora fue posible identificar las consultas, actualizaciones y eliminaciones, además del usuario, la aplicación, el cliente y el momento en que se realizaron.

Sin embargo, también se observó que estos registros no conservan automáticamente los valores anteriores de los documentos ni toda la información que contenían los registros eliminados.

Por eso, el perfilador es una herramienta útil para investigar las operaciones de una base de datos, aunque tiene limitaciones cuando se necesita reconstruir completamente los cambios realizados.