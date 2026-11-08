# Actividad 7 — Cambios de privilegios: el límite más importante

## 1. Objetivo

Comprobar cómo se pueden identificar los cambios de privilegios de un usuario mediante instantáneas y analizar las limitaciones de los mecanismos de auditoría de MongoDB Community.

## 2. Primera instantánea de privilegios

Se guardó una primera instantánea en la colección `auditoria.instantaneas_privilegios`, antes de modificar los permisos.

El usuario `app_ventas` tenía inicialmente el siguiente rol:

- `readWrite` en la base de datos `comercial`.

La instantánea fue tomada por el usuario `admin`.

## 3. Modificación de privilegios

Se activó temporalmente el perfilador en nivel 2:

```javascript
db.setProfilingLevel(2)
```

Posteriormente se otorgó el rol `dbAdmin` al usuario `app_ventas`:

```javascript
db.grantRolesToUser(
  "app_ventas",
  [{ role: "dbAdmin", db: "comercial" }]
)
```

El resultado fue:

```javascript
{ ok: 1 }
```

Esto confirmó que el privilegio adicional fue concedido correctamente.

## 4. Búsqueda de evidencia

Se realizaron dos consultas para buscar el cambio de privilegios.

Primero se revisó el perfilador:

```javascript
db.system.profile.countDocuments({
  "command.grantRolesToUser": { $exists: true }
})
```

Resultado:

```javascript
0
```

Después se revisó la bitácora global:

```javascript
bitacora().filter(
  e => JSON.stringify(e).includes("grantRoles")
).length
```

Resultado:

```javascript
0
```

No se encontró evidencia directa de la operación en ninguna de las dos fuentes consultadas.

## 5. Comparación de las instantáneas

Se tomó una segunda instantánea después de conceder el privilegio adicional.

Posteriormente se consultaron ambas instantáneas:

```javascript
db.getSiblingDB("auditoria").instantaneas_privilegios.find(
  {},
  { _id: 0 }
).sort({ momento: 1 })
```

Los resultados fueron:

| Elemento | Primera instantánea | Segunda instantánea |
|---|---|---|
| Usuario | app_ventas | app_ventas |
| Rol readWrite | Sí | Sí |
| Rol dbAdmin | No | Sí |
| Responsable de tomar la instantánea | admin | admin |
| Fecha UTC | 05:15:56.959 | 05:22:29.268 |

La comparación permitió comprobar que se agregó el rol `dbAdmin`.

Sin embargo, no permitió identificar quién realizó exactamente el cambio ni el momento preciso en que ocurrió. Solamente se pudo establecer que sucedió entre ambas instantáneas.

## 6. Restauración de los privilegios

Después de realizar las comprobaciones, se revocó el rol adicional:

```javascript
db.revokeRolesFromUser(
  "app_ventas",
  [{ role: "dbAdmin", db: "comercial" }]
)
```

El resultado fue:

```javascript
{ ok: 1 }
```

Se consultó nuevamente el usuario:

```javascript
db.getUser("app_ventas")
```

El resultado confirmó que solamente conservaba el rol `readWrite` en la base de datos `comercial`.

También se restableció el perfilador de la Actividad 4:

```javascript
db.setProfilingLevel(1, {
  filter: {
    op: { $in: ["insert", "update", "remove"] }
  }
})
```

La consulta `db.getProfilingStatus()` confirmó que quedó nuevamente en nivel 1 con el filtro correspondiente.

## 7. Análisis de las preguntas

### ¿Por qué un cambio de privilegios es uno de los eventos auditables más importantes?

Porque modificar los privilegios de un usuario puede permitirle acceder a información o realizar operaciones que anteriormente no tenía autorizadas. Un cambio de permisos sin control podría representar un riesgo para la seguridad de la base de datos.

### ¿Con qué frecuencia tomarías instantáneas? ¿Qué factores influyen?

Tomaría instantáneas periódicamente y también antes y después de cambios importantes en los permisos. La frecuencia dependería del nivel de riesgo, la cantidad de usuarios, el número de modificaciones y la importancia de la información almacenada.

### ¿Quién debería poder escribir en auditoria.instantaneas_privilegios?

Solamente administradores o un servicio de auditoría autorizado. Los usuarios normales de la aplicación no deberían tener permisos para modificar o eliminar estas evidencias, para evitar que puedan alterar los registros de control.

### Redacta en tres líneas cómo comunicarías esta limitación a Dirección.

MongoDB Community permite identificar cambios en los privilegios mediante la comparación de instantáneas, pero no siempre permite conocer quién realizó el cambio ni el momento exacto. Esto representa una limitación para investigar modificaciones no autorizadas. Por ello, es importante complementar el sistema con controles adicionales y mecanismos de auditoría más completos.

## 8. Conclusión

En esta actividad se comprobó que las instantáneas permiten detectar cambios en los privilegios de los usuarios, aunque no proporcionan toda la información necesaria para identificar al responsable de cada modificación.

También se comprobó que el perfilador y la bitácora consultada no registraron directamente la operación de concesión de privilegios.

Finalmente, se revocó el rol adicional y se restauró la configuración anterior, dejando al usuario `app_ventas` únicamente con permisos de lectura y escritura.

Esto demuestra que es importante contar con mecanismos adicionales para mantener un control adecuado sobre los cambios de privilegios en una base de datos.