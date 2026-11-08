# LAB-01 — Bitácoras y auditoría del dato en PostgreSQL

## Descripción

En este laboratorio se trabajó con las bitácoras y los mecanismos de auditoría de PostgreSQL para registrar conexiones, errores, modificaciones de datos y cambios en la estructura de una base de datos.

También se implementó un disparador que permite conservar los valores anteriores y nuevos de los registros modificados.

## Entorno utilizado

- **Sistema operativo:** Windows 11.
- **Base de datos:** PostgreSQL 16.4.
- **Herramientas:** pgAdmin 4, psql, PowerShell y Visual Studio Code.
- **Tipo de instalación:** PostgreSQL instalado localmente en Windows.
- **Puerto:** 5432.
- **Base de datos utilizada:** `comercial`.

El servidor se ejecutó mediante el servicio de Windows `postgresql-x64-16`, sin utilizar contenedores.

## Actividades realizadas

**Parte A — Bitácoras del servidor**

Se revisó la configuración inicial, se comprobó el funcionamiento del colector de registros y se configuró PostgreSQL para registrar conexiones, desconexiones y sentencias SQL.

También se analizaron accesos exitosos y fallidos, cambios de permisos, modificaciones de estructura, errores y sesiones activas.

**Parte B — Auditoría de datos**

Se creó el esquema `auditoria`, la tabla `auditoria.cambios_clientes` y un disparador para registrar las operaciones INSERT, UPDATE y DELETE sobre la tabla `clientes`.

Se realizaron pruebas para comprobar los valores anteriores y nuevos de los registros, las restricciones de acceso y las limitaciones de la auditoría.

Finalmente, se exportó la bitácora y se calculó su hash SHA-256 para comprobar su integridad.

La Parte C, relacionada con la extensión pgaudit, no se realizó porque es opcional.

## Estructura de archivos

```text
LAB-01/
├── README.md
├── informe.md
├── sql/
│   ├── 01-colector-y-vista.sql
│   ├── 02-configuracion-bitacora.sql
│   ├── 03-privilegios-estructura.sql
│   ├── 04-esquema-auditoria.sql
│   ├── 05-funcion-disparador.sql
│   └── 06-campos-modificados.sql
└── evidencias/
    ├── 01-configuracion-inicial.md
    ├── 02-colector.md
    ├── 03-incidente-sin-bitacora.md
    ├── 04-configuracion-bitacora.md
    ├── 05-accesos.md
    ├── 06-privilegios-estructura.md
    ├── 07-modificaciones.md
    ├── 08-errores.md
    ├── 09-pg-stat-activity.md
    ├── 10-diseno-auditoria.md
    ├── 11-incidente-auditado.md
    ├── 12-altas-bajas.md
    ├── 13-manipulacion.md
    ├── 14-limites.md
    ├── 15-cronologia.md
    ├── bitacora-lab01.log
    ├── bitacora-lab01.sha256
    └── Capturas de pantalla de las actividades
```

## Resultados principales

- Se configuró la bitácora para registrar conexiones y modificaciones.
- Se identificaron intentos de acceso fallidos.
- Se comprobaron las restricciones de permisos de los usuarios.
- Se implementó una tabla de auditoría con un disparador.
- Se registraron los valores anteriores y nuevos de las modificaciones.
- Se identificaron limitaciones relacionadas con las consultas de lectura y los administradores.
- Se exportó la bitácora, sustituyendo la contraseña temporal por `<REDACTED>`.
- Se generó un hash SHA-256 del archivo exportado.

## Archivos de entrega

Los archivos SQL contienen las instrucciones utilizadas durante las prácticas. No deben ejecutarse nuevamente sobre la base de datos existente sin revisar previamente los objetos que ya fueron creados.

La carpeta `evidencias` contiene las capturas y los documentos con los resultados de las actividades.

El archivo `informe.md` incluye el análisis general, las limitaciones, las preguntas de reflexión y las conclusiones.

## Conclusión

Este laboratorio permitió comprobar que las bitácoras y la auditoría de datos son herramientas importantes para investigar cambios en una base de datos.

También se observó que registrar una sentencia SQL no es lo mismo que conservar los valores anteriores y nuevos de los datos, por lo que ambos mecanismos se complementan.

La protección de las evidencias y el control de los permisos son necesarios para mantener una auditoría confiable.