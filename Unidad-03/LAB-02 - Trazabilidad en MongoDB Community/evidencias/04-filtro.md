# Actividad 4 — Reducir el volumen con un filtro

## 1. Objetivo

Configurar un filtro en el perfilador de MongoDB para registrar únicamente las operaciones que modifican los datos, reduciendo así el volumen de registros generados.

## 2. Configuración del filtro

Primero se desactivó temporalmente el perfilador:

```javascript
db.setProfilingLevel(0)
```

Después se eliminaron los registros anteriores de `system.profile`, ya que previamente se había guardado un respaldo de la Actividad 3.

```javascript
db.system.profile.drop()
```

Posteriormente se configuró el perfilador para registrar únicamente inserciones, actualizaciones y eliminaciones:

```javascript
db.setProfilingLevel(1, {
  filter: {
    op: { $in: ["insert", "update", "remove"] }
  }
})
```

Se comprobó la configuración con:

```javascript
db.getProfilingStatus()
```

El resultado confirmó que el perfilador estaba en nivel 1 y que el filtro estaba activo.

## 3. Prueba del filtro

Se utilizó el usuario `app_ventas` mediante la aplicación `app-ventas-web`.

Primero se realizó una consulta:

```javascript
db.clientes.find({ _id: 1 }).toArray()
```

Se obtuvo el registro de Ana López, cuyo teléfono todavía era `6671234567`.

Después se realizó una actualización:

```javascript
db.clientes.updateOne(
  { _id: 1 },
  { $set: { telefono: "6670000000" } }
)
```

El resultado confirmó que la modificación se realizó correctamente:

- matchedCount: 1
- modifiedCount: 1

## 4. Comprobación de los registros

Desde la sesión del administrador se consultó `system.profile`:

```javascript
db.system.profile.find(
  {},
  {
    op: 1,
    ns: 1,
    user: 1,
    appName: 1,
    "command.q": 1,
    "command.u": 1,
    ts: 1
  }
).sort({ ts: 1 })
```

El resultado mostró únicamente una operación:

| Campo | Resultado |
|---|---|
| Operación | update |
| Colección | comercial.clientes |
| Usuario | app_ventas@comercial |
| Aplicación | app-ventas-web |
| Documento | _id: 1 |
| Campo modificado | telefono |
| Nuevo valor | 6670000000 |
| Fecha UTC | 2026-11-08 04:29:30.756 |

La consulta anterior no apareció en los registros porque el filtro excluye las operaciones de lectura.

## 5. Análisis de las preguntas

### ¿Qué perdiste de evidencia al aplicar el filtro? ¿Qué ganaste?

Se perdió el registro de las consultas realizadas, por lo que ya no es posible revisar desde el perfilador qué información se consultó.

A cambio, se redujo la cantidad de registros almacenados y se conservaron las operaciones que modifican los datos, como inserciones, actualizaciones y eliminaciones.

### ¿Qué filtro usarías si solo interesaran operaciones sobre la colección clientes?

Utilizaría un filtro que incluya el espacio de nombres de la colección y los tipos de operaciones que quiero registrar:

```javascript
db.setProfilingLevel(1, {
  filter: {
    ns: "comercial.clientes",
    op: { $in: ["insert", "update", "remove"] }
  }
})
```

De esta manera, solamente se registrarían las modificaciones realizadas sobre la colección `clientes` de la base de datos `comercial`.

## 6. Conclusión

En esta actividad se comprobó que MongoDB permite personalizar el perfilador mediante filtros para registrar únicamente determinadas operaciones.

Al realizar una consulta y posteriormente una actualización, se observó que solamente la actualización apareció en `system.profile`.

Esto permite reducir el volumen de registros y concentrarse en las operaciones que modifican la información, aunque también implica perder visibilidad sobre las consultas de lectura.

Por eso, es importante elegir el filtro de acuerdo con las necesidades de auditoría y seguimiento de cada base de datos.