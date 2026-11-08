# Actividad 8 — Conservación: exportar antes de perder

## 1. Objetivo

Comprobar cómo se pueden conservar las evidencias generadas por MongoDB y qué información puede perderse cuando se reinicia el servidor.

## 2. Exportación de evidencias

Antes de reiniciar MongoDB, se exportaron dos fuentes de información:

- `system-profile.json`: contiene los registros de operaciones almacenados en el perfilador.
- `bitacora-mongod.log`: contiene los eventos de la bitácora global obtenidos mediante `getLog`.

Antes del reinicio se obtuvieron los siguientes resultados:

| Elemento | Resultado |
|---|---|
| Nivel del perfilador | 1 |
| Registros en system.profile | 2 |
| Eventos en getLog | 665 |

## 3. Generación de hashes SHA-256

Se calcularon las huellas digitales de los archivos exportados para comprobar su integridad.

Los resultados fueron:

| Archivo | Hash SHA-256 |
|---|---|
| system-profile.json | `1e3750a6d0353b74f07c52bc7e6839b73d83e7eae4276798dd3c675776de1470` |
| bitacora-mongod.log | `f1fb5cc610e0bc392cf0f18ee933ea00b2a9f0d8281ad559ec1fca0a23e87df8` |

Los hashes se guardaron en `hashes.sha256`.

## 4. Prueba de reinicio

Se reinició el contenedor de MongoDB mediante:

```powershell
docker restart dba-u3-mongo
```

Después se realizaron nuevamente las consultas para comprobar qué información permanecía disponible.

Los resultados fueron:

| Elemento | Antes del reinicio | Después del reinicio |
|---|---:|---:|
| Nivel del perfilador | 1 | 0 |
| Registros en system.profile | 2 | 2 |
| Eventos en getLog | 665 | 83 |

Se observó que la configuración del perfilador volvió al nivel 0, porque se había establecido temporalmente desde mongosh.

Los dos registros de `system.profile` permanecieron almacenados después del reinicio.

En cambio, la bitácora consultada mediante `getLog` comenzó a mostrar los eventos generados durante el nuevo arranque del servidor.

## 5. Verificación de integridad

Después del reinicio se volvieron a calcular los hashes SHA-256 de los dos archivos exportados.

Los resultados coincidieron exactamente con los valores guardados antes del reinicio.

Esto permitió comprobar que las exportaciones permanecieron intactas y que se conservaron las evidencias anteriores al reinicio.

## 6. Análisis de las preguntas

### Menciona tres formas en que la evidencia del perfilador o de la bitácora puede perderse sin que nadie la borre deliberadamente.

1. La colección `system.profile` tiene un tamaño limitado y, cuando se llena, los registros más antiguos pueden sobrescribirse automáticamente.
2. La bitácora consultada mediante `getLog` solamente conserva los 1024 eventos más recientes, por lo que los anteriores pueden desaparecer cuando se generan nuevos eventos.
3. Al reiniciar MongoDB, la información que `getLog` mantiene en memoria se pierde y comienza a generarse una nueva bitácora.

### ¿Por qué el tamaño de 1 MB de system.profile es un problema de conservación y no solo de espacio?

Porque al tener un tamaño limitado, cuando la colección se llena, MongoDB comienza a reemplazar los registros más antiguos por otros nuevos. Esto significa que una evidencia importante puede desaparecer automáticamente, incluso si nadie la elimina manualmente.

### ¿Por qué getLog sirve para interpretar pero no para conservar?

Porque permite consultar y analizar los eventos recientes del servidor, pero solamente mantiene los últimos 1024 eventos en memoria y pierde esa información cuando MongoDB se reinicia. Por eso es necesario exportar los registros a archivos externos para conservarlos.

## 7. Conclusión

En esta actividad comprobé que no basta con generar registros dentro de MongoDB, también es necesario conservarlos fuera del servidor.

Durante la práctica exporté los registros del perfilador y la bitácora global, generé sus hashes SHA-256 y comprobé que los archivos permanecieron intactos después de reiniciar el contenedor.

También observé que la configuración del perfilador volvió al nivel 0 y que la bitácora obtenida mediante `getLog` comenzó a mostrar nuevos eventos.

Esto demuestra la importancia de realizar respaldos periódicos y conservar las evidencias en archivos externos para evitar perder información importante.