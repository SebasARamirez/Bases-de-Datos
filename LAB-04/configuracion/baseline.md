# LAB-04 — Línea base de seguridad de PostgreSQL 16

## 1. Objetivo

Establecer una propuesta de configuración segura para PostgreSQL 16, considerando los principales controles de red, autenticación, autorización, sistema operativo, cifrado y mantenimiento.

Esta línea base servirá como referencia para identificar riesgos y verificar que el servidor utilice solamente las configuraciones y funcionalidades necesarias.

## 2. Entorno del laboratorio

- **Motor:** PostgreSQL 16.4
- **Sistema operativo:** Windows 11
- **Base de datos:** `lab04_hardening`
- **Puerto:** `5432`
- **Herramientas:** pgAdmin 4 y PowerShell
- **Tipo de entorno:** Académico local

La línea base contiene tanto configuraciones observadas como controles recomendados. Las recomendaciones no deben interpretarse como modificaciones ya implementadas.

## 3. Seguridad de red

| Control | Estado observado | Línea base propuesta |
|---|---|---|
| Interfaces de escucha | `listen_addresses = '*'` | Utilizar `localhost` cuando solo se necesiten conexiones locales |
| Puerto | `5432` | Mantener un puerto documentado y protegido |
| Direcciones de escucha | `0.0.0.0` y `::` | Escuchar únicamente en las interfaces necesarias |
| Redes permitidas | Reglas `pg_hba.conf` limitadas a direcciones locales | Autorizar solo los orígenes justificados |
| Firewall | No se verificó su configuración efectiva | Permitir conexiones únicamente desde redes autorizadas |

**Justificación:**

Limitar las interfaces y redes autorizadas reduce la cantidad de equipos que pueden intentar conectarse al servidor.

Cambiar el número del puerto no sustituye los controles de acceso y autenticación.

Para nuestro laboratorio, una configuración basada en `localhost` sería adecuada si confirmamos que no existen aplicaciones que necesiten conexiones remotas.

## 4. Autenticación

| Control | Estado observado | Línea base propuesta |
|---|---|---|
| Método para nuevas contraseñas | `scram-sha-256` | Mantener `scram-sha-256` |
| Reglas de autenticación | Conexiones locales mediante `scram-sha-256` | Mantener reglas específicas |
| Contraseñas | No se evaluó su fortaleza individual | Utilizar credenciales fuertes y únicas |
| Cuentas administrativas | Existe `postgres` | Reservar su uso para tareas administrativas |
| Acceso remoto | No se observaron reglas remotas amplias | Permitirlo únicamente cuando sea necesario |

**Justificación:**

El mecanismo `scram-sha-256` protege la autenticación mediante contraseñas, pero debe complementarse con permisos limitados y restricciones de red.

También es necesario proteger las credenciales y evitar compartir cuentas administrativas.

## 5. Autorización y roles

La autorización determina qué operaciones puede realizar un usuario después de autenticarse.

Durante la revisión se identificaron los roles `postgres` y `analista`, además de los roles predefinidos de PostgreSQL.

Se propone la siguiente separación:

| Tipo de cuenta | Propósito | Privilegios |
|---|---|---|
| DBA | Administración de PostgreSQL | Privilegios administrativos |
| APP | Conexión de una aplicación | Solamente operaciones necesarias |
| CONSULTA | Consultar información autorizada | `SELECT` sobre objetos específicos |

**Controles recomendados:**

- Aplicar el principio de mínimo privilegio.
- Evitar que las aplicaciones utilicen cuentas `SUPERUSER`.
- Revisar periódicamente los permisos.
- Separar las cuentas administrativas y de aplicación.
- Revocar permisos innecesarios.
- Utilizar roles para organizar los privilegios.

Las cuentas de aplicación y consulta fueron diseñadas conceptualmente, pero no se crearon durante este laboratorio.

## 6. Configuración del servidor

| Parámetro o componente | Estado observado | Propuesta |
|---|---|---|
| `max_connections` | `100` | Ajustar según las necesidades y recursos disponibles |
| `superuser_reserved_connections` | `3` | Mantener conexiones administrativas reservadas |
| `statement_timeout` | `0` | Evaluar límites de duración adecuados |
| `idle_in_transaction_session_timeout` | Inicialmente `0`; posteriormente `10min` en `lab04_hardening` | Mantener un límite adecuado según las necesidades de cada aplicación |
| `log_connections` | `off` | Evaluar el registro de conexiones |
| `log_disconnections` | `off` | Evaluar el registro de desconexiones |
| Extensiones | `plpgsql` 1.0 | Mantener solamente las necesarias |

**Justificación:**

La configuración del servidor debe equilibrar seguridad, disponibilidad y rendimiento.

Los límites de tiempo pueden ayudar a evitar consultas prolongadas o transacciones inactivas que consuman recursos.

El registro de conexiones también puede resultar útil para investigar incidentes, considerando el almacenamiento y la protección de los logs.

Antes de modificar estos parámetros debe evaluarse su impacto sobre las aplicaciones.

## 7. Seguridad del sistema operativo

Se revisaron los permisos de los archivos sensibles mediante `icacls` y `Get-Acl` en Windows 11.

**Propietarios identificados:**

| Elemento | Propietario |
|---|---|
| Directorio `data` | `BUILTIN\Administradores` |
| `postgresql.conf` | Usuario local Sebastián |
| `pg_hba.conf` | Usuario local Sebastián |

En ambos archivos de configuración se encontraron permisos heredados de control total para Administradores, SYSTEM, el usuario local y Servicio de red.

**Línea base propuesta:**

- Permitir acceso solamente a las cuentas que realmente lo necesitan.
- Proteger los archivos de configuración contra modificaciones no autorizadas.
- Revisar los permisos del directorio de datos.
- Evitar conceder control total innecesariamente.
- Mantener respaldos de la configuración.
- Verificar que los cambios de permisos no impidan el funcionamiento del servicio.

No se modificaron los permisos durante el laboratorio.

## 8. Cifrado y protección de información sensible

| Control | Estado observado | Línea base propuesta |
|---|---|---|
| SSL/TLS | `ssl = off` | Habilitar TLS cuando lo requieran las conexiones |
| Versión mínima configurada | `TLSv1.2` | Utilizar versiones de TLS adecuadas y compatibles |
| Conexión de pgAdmin | No utiliza TLS | Verificar el cifrado cuando corresponda |
| Protección de contraseñas | `scram-sha-256` para nuevas contraseñas | Mantener mecanismos seguros |
| Credenciales de aplicaciones | No se revisaron | Evitar almacenarlas en código fuente o repositorios |
| Archivos sensibles | Permisos revisados | Restringir el acceso según necesidad |

**Justificación:**

TLS permite proteger las comunicaciones entre clientes y servidor cuando se configura correctamente.

Además, es importante proteger las credenciales, los archivos de configuración y los datos sensibles mediante controles apropiados.

En nuestro laboratorio se identificó que la conexión local actual no utiliza TLS. No se habilitó cifrado durante esta actividad.

## 9. Mantenimiento y actualizaciones

Se propone establecer una política de mantenimiento que incluya:

1. Revisar periódicamente las actualizaciones disponibles para PostgreSQL y Windows.
2. Evaluar la importancia de los parches de seguridad.
3. Realizar respaldos antes de cambios importantes.
4. Probar las actualizaciones antes de aplicarlas a un entorno productivo.
5. Revisar regularmente roles y privilegios.
6. Comprobar las reglas de `pg_hba.conf`.
7. Revisar los registros y eventos relevantes del servidor.
8. Mantener documentados los cambios de configuración.
9. Verificar la necesidad de las extensiones instaladas.
10. Revisar periódicamente el cumplimiento de esta línea base.

Las actualizaciones y modificaciones deberán planificarse considerando la disponibilidad del sistema.

**Estado:** Esta política es una propuesta documental. No se realizó una actualización del servidor durante el laboratorio.

## 10. Verificación de la línea base

Para comprobar que una configuración cumple con la línea base, se recomienda realizar las siguientes verificaciones:

| Control | Verificación |
|---|---|
| Puerto | Consultar `SHOW port;` |
| Interfaces | Consultar `SHOW listen_addresses;` |
| Autenticación | Revisar `pg_hba_file_rules` |
| Contraseñas | Consultar `SHOW password_encryption;` |
| Roles | Consultar `pg_roles` |
| Extensiones | Consultar `pg_extension` |
| Conexiones | Consultar parámetros de `pg_settings` |
| Permisos | Revisar los archivos mediante herramientas de Windows |
| Red | Consultar los puertos y direcciones de escucha |
| TLS | Consultar `pg_stat_ssl` |
| Actualizaciones | Revisar versiones y registros de mantenimiento |

## 11. Estado de implementación

Durante el LAB-04 se identificaron las configuraciones actuales del servidor PostgreSQL y se documentaron diferentes propuestas de mejora.

Además, se aplicó un cambio real de hardening a la base de datos `lab04_hardening`.

Se ejecutó el siguiente comando:

```sql
ALTER DATABASE lab04_hardening
SET idle_in_transaction_session_timeout = '10min';
```

El valor inicial del parámetro era `0`, lo que significaba que no existía un límite configurado para las sesiones inactivas dentro de una transacción.

Después de aplicar el cambio, se abrió una nueva conexión y se ejecutó:

```sql
SHOW idle_in_transaction_session_timeout;
```

El resultado fue `10min`, confirmando que la nueva conexión utilizaba el valor configurado.

Este cambio se aplicó únicamente a `lab04_hardening`, sin modificar la configuración global de las demás bases de datos.

No se realizaron modificaciones a las reglas del firewall, a `pg_hba.conf`, a las interfaces de escucha ni a los permisos de Windows.

Las demás medidas de esta línea base continúan siendo propuestas que deberán evaluarse antes de implementarse.

**Evidencia:** [06-verificacion.png](../evidencias/06-verificacion.png)

## 12. Conclusión

Esta actividad me permitió comprender que una línea base de seguridad sirve como referencia para administrar PostgreSQL de manera más segura.

También aprendí que el hardening no consiste solamente en establecer contraseñas fuertes, sino en revisar diferentes elementos como las conexiones de red, la autenticación, los roles, los permisos del sistema operativo y el mantenimiento.

Considero importante documentar el estado actual y las mejoras propuestas, porque esto permite identificar riesgos, justificar los cambios y comprobar posteriormente si realmente se aplicaron.

Finalmente, comprendí que una configuración segura debe adaptarse a las necesidades del entorno y no aplicarse sin revisar sus posibles consecuencias.