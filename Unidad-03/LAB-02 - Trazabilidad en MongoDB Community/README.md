# LAB-02 — Trazabilidad en MongoDB Community

## Descripción

Este laboratorio tiene como objetivo conocer los mecanismos de trazabilidad disponibles en MongoDB Community, identificar las operaciones realizadas en una base de datos y comprender las limitaciones de esta edición respecto a la auditoría nativa.

Se trabajó con MongoDB 7 Community Edition, utilizando Docker Desktop, mongosh, el perfilador de base de datos y la bitácora del servidor.

## 1. Entorno utilizado

- Sistema operativo: Windows 11.
- Motor de base de datos: MongoDB Community 7.0.45.
- Cliente: MongoDB Shell (mongosh) 2.14.1.
- Contenedores: Docker Desktop.
- Imagen: mongo:7.
- Nombre del contenedor: dba-u3-mongo.
- Puerto local: 27018.
- Puerto interno: 27017.
- Base de datos: comercial.

## 2. Despliegue del servidor

El servidor se desplegó mediante un contenedor Docker utilizando el siguiente comando:

```powershell
docker run -d --name dba-u3-mongo -p 127.0.0.1:27018:27017 -v dba-u3-mongo-data:/data/db mongo:7 --auth
```

Se habilitó la autenticación mediante `--auth` y se utilizó un volumen para conservar los datos del contenedor.

Para comprobar que el servidor estaba funcionando se utilizó:

```powershell
docker ps --filter "name=dba-u3-mongo"
```

Para reiniciar el contenedor:

```powershell
docker restart dba-u3-mongo
```

## 3. Usuarios y permisos

Se trabajó con dos usuarios:

| Usuario | Base de datos | Rol |
|---|---|---|
| admin | admin | root |
| app_ventas | comercial | readWrite |

El usuario `admin` se utilizó para configurar el servidor y consultar los registros.

El usuario `app_ventas` se utilizó para realizar operaciones sobre la colección `clientes`.

También se realizó una prueba de modificación temporal de privilegios, agregando y posteriormente revocando el rol `dbAdmin`.

## 4. Actividades realizadas

Durante el laboratorio se realizaron las siguientes actividades:

1. Identificación de la edición de MongoDB y sus limitaciones.
2. Consulta de la configuración de arranque del servidor.
3. Activación y configuración del perfilador.
4. Interpretación de operaciones registradas en `system.profile`.
5. Consulta de la bitácora global de mongod.
6. Identificación de accesos exitosos y fallidos.
7. Correlación de eventos mediante identificadores de conexión.
8. Exportación y conservación de evidencias.
9. Comparación con PostgreSQL y MongoDB Enterprise/Atlas.
10. Elaboración de respuestas para Dirección.

## 5. Evidencias

La carpeta `evidencias/` contiene los documentos de las actividades realizadas y los archivos exportados:

- `system-profile.json`: operaciones registradas por el perfilador.
- `bitacora-mongod.log`: registros globales del servidor.
- `hashes.sha256`: huellas digitales SHA-256 de los archivos exportados.

Los archivos de evidencia documentan los resultados obtenidos y las limitaciones encontradas durante la práctica.

## 6. Configuración final

Al finalizar las pruebas, el perfilador quedó configurado en nivel 1, con un filtro para registrar operaciones de inserción, actualización y eliminación:

```javascript
db.setProfilingLevel(1, {
  filter: {
    op: { $in: ["insert", "update", "remove"] }
  }
})
```

Se verificó la configuración mediante:

```javascript
db.getProfilingStatus()
```

El usuario `app_ventas` quedó nuevamente con el rol `readWrite` sobre la base `comercial`.

## 7. Conclusión

El laboratorio permitió comprobar que MongoDB Community cuenta con herramientas que ayudan a reconstruir las operaciones realizadas en una base de datos, aunque no dispone de auditoría nativa.

Mediante el perfilador, la bitácora y las instantáneas de privilegios fue posible obtener información sobre operaciones, autenticaciones y cambios de configuración.

También se comprobó que estos mecanismos tienen limitaciones, por lo que no deben considerarse equivalentes a una solución completa de auditoría.

## 8. Consideraciones

- No se incluyen contraseñas en este repositorio.
- Las evidencias exportadas deben conservarse junto con sus hashes.
- El perfilador no sustituye la auditoría de seguridad.
- Los registros pueden perderse por reinicios, límites de almacenamiento o sobrescritura.
- Para una auditoría más completa se deben considerar mecanismos externos o ediciones que dispongan de auditoría nativa.