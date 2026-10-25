# LAB-04 — Hardening y configuración segura de PostgreSQL

**Materia:** Gestión de Seguridad y Desempeño de Bases de Datos  
**Unidad:** II — Seguridad, privacidad y control de acceso  
**Tema:** 2.6 Hardening de bases de datos  
**Motor:** PostgreSQL 16  
**Modalidad:** Individual

---

## 1. Objetivo

El objetivo de este laboratorio es revisar la configuración de seguridad de PostgreSQL 16, identificar posibles riesgos y aplicar medidas de hardening que permitan reducir la superficie de ataque y mejorar la seguridad del servidor.

Durante las actividades se analizaron las interfaces de red, los métodos de autenticación, los roles, los privilegios, los archivos de configuración, las extensiones y las conexiones.

También se revisaron los permisos del sistema operativo y el uso de SSL/TLS.

Finalmente, se aplicó una mejora de configuración a la base de datos del laboratorio y se verificó su resultado.

## 2. Entorno

El laboratorio se realizó utilizando las siguientes herramientas:

| Elemento | Descripción |
|---|---|
| Sistema operativo | Windows 11 |
| Base de datos | PostgreSQL 16.4 |
| Herramienta de administración | pgAdmin 4 |
| Terminal | PowerShell |
| Base de datos de prácticas | lab04_hardening |
| Puerto de PostgreSQL | 5432 |
| Tipo de entorno | Académico local |

Se utilizó una instalación local de PostgreSQL que también contiene bases de datos de otros laboratorios.

Por este motivo, se evitó modificar la configuración global del servidor y se seleccionó una mejora que pudiera aplicarse específicamente a la base de datos `lab04_hardening`.

## 3. Superficie de ataque inicial

Para identificar la superficie de ataque se consultaron diferentes parámetros y vistas de PostgreSQL.

Los principales resultados iniciales fueron:

| Elemento | Configuración encontrada |
|---|---|
| Versión | PostgreSQL 16.4 |
| Puerto | 5432 |
| Interfaces de escucha | `*` |
| Direcciones TCP de escucha | `0.0.0.0` y `::` |
| SSL/TLS | Deshabilitado |
| Método para nuevas contraseñas | `scram-sha-256` |
| Reglas de autenticación | Conexiones locales |
| Cuenta administrativa | postgres |
| Extensiones en lab04_hardening | plpgsql 1.0 |
| Límite de conexiones | 100 |
| Conexiones reservadas para superusuarios | 3 |
| statement_timeout | 0 ms |
| idle_in_transaction_session_timeout | 0 ms |

También se identificó que las conexiones de pgAdmin observadas durante la inspección utilizaban la dirección local `::1`.

Aunque PostgreSQL escucha en todas las interfaces, las reglas actuales de `pg_hba.conf` limitan la autenticación por red a direcciones locales.

Por lo tanto, no se demostró que el servidor aceptara conexiones remotas no autorizadas.

## 4. Hallazgos

### 4.1 Interfaces de escucha

El parámetro `listen_addresses` tiene el valor `*`, lo que significa que PostgreSQL escucha en todas las interfaces disponibles.

Esta configuración puede resultar innecesaria cuando solamente se requieren conexiones locales.

### 4.2 Reglas de autenticación

Se encontraron seis reglas en `pg_hba.conf`.

Las reglas de conexión por red están limitadas a direcciones locales y utilizan `scram-sha-256`.

No se identificaron reglas excesivamente amplias como `0.0.0.0/0` o `::/0`.

### 4.3 Usuarios y privilegios

Se identificaron 16 roles en PostgreSQL.

La cuenta `postgres` es superusuario y puede iniciar sesión, crear roles y crear bases de datos.

También se encontró el rol `analista`, que no tiene capacidad de iniciar sesión ni privilegios administrativos.

No se identificaron cuentas independientes de aplicación.

### 4.4 Extensiones

En la base de datos `lab04_hardening` solamente se encontró la extensión `plpgsql`, versión 1.0.

No se identificaron extensiones adicionales que fuera necesario eliminar.

### 4.5 Configuración de conexiones

Inicialmente, los parámetros `statement_timeout` e `idle_in_transaction_session_timeout` tenían el valor 0.

Esto significaba que no existían límites generales establecidos mediante esas opciones.

Se identificó que una transacción abierta e inactiva podría mantener bloqueos o consumir recursos durante demasiado tiempo.

Por esta razón, se seleccionó `idle_in_transaction_session_timeout` para aplicar una mejora controlada en la base de datos del laboratorio.

### 4.6 Permisos del sistema operativo

Se revisaron los permisos del directorio de datos y de los archivos `postgresql.conf` y `pg_hba.conf`.

Se encontró que Administradores, SYSTEM, el usuario local y Servicio de red tienen control total sobre los archivos de configuración.

Es importante comprobar si todos esos permisos son necesarios.

### 4.7 SSL/TLS

El parámetro `ssl` tiene el valor `off`.

La consulta sobre `pg_stat_ssl` confirmó que la conexión local actual no utiliza TLS.

Esto debe considerarse especialmente si posteriormente se necesitan conexiones remotas.

### 4.8 Registros de conexiones

Los parámetros `log_connections` y `log_disconnections` están deshabilitados.

Sería conveniente evaluar si se necesita registrar estos eventos para facilitar la revisión de accesos.

## 5. Cambios realizados

Durante el laboratorio se realizaron consultas y verificaciones para identificar la configuración del servidor.

Además, se aplicó un cambio real al parámetro `idle_in_transaction_session_timeout` de la base de datos `lab04_hardening`.

### 5.1 Configuración anterior

El valor inicial era:

`idle_in_transaction_session_timeout = 0`

Esto indicaba que no existía un límite de tiempo configurado mediante este parámetro para las sesiones inactivas dentro de una transacción.

### 5.2 Cambio aplicado

Se ejecutó el siguiente comando:

```sql
ALTER DATABASE lab04_hardening
SET idle_in_transaction_session_timeout = '10min';
```

El comando establece un límite de diez minutos para las nuevas conexiones a `lab04_hardening`.

El cambio se realizó específicamente sobre la base de datos del laboratorio, sin modificar el valor global de las demás bases de datos.

### 5.3 Resultado obtenido

Después de aplicar el cambio, se abrió una nueva conexión mediante el Query Tool de pgAdmin.

Se ejecutó:

```sql
SHOW idle_in_transaction_session_timeout;
```

El resultado fue:

`10min`

Esto confirmó que la nueva conexión estaba utilizando el valor establecido.

**Evidencia:** [06-verificacion.png](evidencias/06-verificacion.png)

### 5.4 Otros cambios propuestos

También se elaboraron propuestas relacionadas con:

- Restricción de interfaces de escucha.
- Reglas de autenticación específicas.
- Separación de cuentas administrativas y de aplicación.
- Aplicación del principio de mínimo privilegio.
- Protección de archivos sensibles.
- Uso de TLS.
- Políticas de firewall y mantenimiento.

Estas propuestas no fueron implementadas en la configuración global de PostgreSQL.

La comparación completa se encuentra en [configuracion/cambios.md](configuracion/cambios.md).

La línea base de seguridad propuesta se encuentra en [configuracion/baseline.md](configuracion/baseline.md).

## 6. Justificación de los cambios

El cambio aplicado busca evitar que una sesión permanezca indefinidamente inactiva mientras mantiene una transacción abierta.

Este tipo de sesiones puede conservar bloqueos y consumir recursos innecesariamente.

Al establecer un límite de diez minutos, PostgreSQL puede finalizar las sesiones que superen ese tiempo en dicha condición.

Se seleccionó este valor como una medida de prueba adecuada para nuestro entorno académico.

En un servidor de producción sería necesario evaluar las necesidades de las aplicaciones antes de establecer un límite de tiempo.

También se eligió una configuración específica por base de datos para evitar afectar innecesariamente otras prácticas que utilizan la misma instancia.

Las demás medidas de hardening propuestas buscan reducir la exposición innecesaria del servidor, mejorar la separación de privilegios y proteger los archivos y las comunicaciones.

Antes de implementarlas sería necesario comprobar su compatibilidad con las aplicaciones y preparar un procedimiento de recuperación.

## 7. Verificación

Se utilizaron consultas SQL y comandos de PowerShell para revisar la configuración del servidor.

| Verificación | Resultado |
|---|---|
| Versión de PostgreSQL | Identificada |
| Puerto de escucha | 5432 |
| Interfaces | Todas las interfaces IPv4 e IPv6 |
| Reglas de pg_hba.conf | Revisadas |
| Método de autenticación | scram-sha-256 |
| Roles y privilegios | Revisados |
| Extensiones | Revisadas |
| Parámetros de conexión | Revisados |
| Permisos de Windows | Revisados |
| Estado de TLS | Deshabilitado |
| Cambio de idle_in_transaction_session_timeout | Aplicado a lab04_hardening |
| Resultado de nueva conexión | 10min |

### Comparación antes y después

| Parámetro | Antes | Después |
|---|---|---|
| idle_in_transaction_session_timeout | 0 | 10min |

La consulta de verificación confirmó que el valor se aplicó correctamente a una nueva conexión de `lab04_hardening`.

No se realizó una prueba esperando diez minutos con una transacción abierta. La evidencia demuestra que el nuevo valor está configurado y es reconocido por PostgreSQL.

Los demás parámetros globales revisados permanecieron sin modificaciones.

## 8. Checklist de hardening

La siguiente tabla permite identificar los controles revisados y los aspectos que todavía requieren atención.

| # | Control | Verificado | Evidencia o resultado |
|---|---|---|---|
| 1 | Puerto documentado | Sí | Puerto 5432 |
| 2 | Interfaces de escucha justificadas | Sí | Se revisó listen_addresses = * |
| 3 | pg_hba.conf revisado | Sí | Se encontraron seis reglas |
| 4 | Redes autorizadas restringidas | Parcial | pg_hba.conf usa direcciones locales; escucha en todas las interfaces |
| 5 | Autenticación segura | Sí | scram-sha-256 |
| 6 | Superusuarios identificados | Sí | Cuenta postgres |
| 7 | Cuentas de aplicación separadas | No | Separación conceptual, pendiente de implementación |
| 8 | Privilegios mínimos | Parcial | Se revisaron roles y se propusieron cuentas limitadas |
| 9 | Extensiones revisadas | Sí | plpgsql 1.0 |
| 10 | TLS verificado | Sí | SSL deshabilitado |
| 11 | Configuración protegida | Parcial | Permisos revisados, sin modificaciones |
| 12 | Directorio de datos protegido | Parcial | Permisos revisados, pendientes de evaluación |
| 13 | Firewall documentado | Sí | Política conceptual elaborada |
| 14 | Actualizaciones documentadas | Sí | Política propuesta en baseline.md |
| 15 | Configuración registrada | Sí | cambios.md, baseline.md y evidencia de verificación |

**Nota:** La columna «Verificado» indica el estado de revisión del control. No significa necesariamente que cumpla completamente con la línea base de seguridad.

### Análisis del checklist

El checklist permitió identificar controles que ya tienen configuraciones adecuadas y otros que requieren mejoras.

Entre los puntos positivos se encuentra el uso de `scram-sha-256` y las reglas de autenticación limitadas a direcciones locales.

También se aplicó y verificó una mejora al tiempo máximo de inactividad dentro de una transacción en la base de datos del laboratorio.

Entre los aspectos pendientes se encuentran la evaluación de las interfaces de escucha, la separación de cuentas de aplicación, la revisión de permisos y la configuración de TLS cuando sea necesaria.

## 9. Conclusiones

Durante este laboratorio aprendí que el hardening de PostgreSQL consiste en reducir la superficie de ataque y mantener solamente las configuraciones y funcionalidades necesarias.

También comprendí que una contraseña fuerte no es suficiente para proteger un servidor si existen permisos excesivos, reglas de red demasiado amplias o archivos de configuración sin la protección adecuada.

Las consultas de PostgreSQL y los comandos de PowerShell me permitieron identificar cómo está configurado realmente el servidor.

Uno de los hallazgos más importantes fue que PostgreSQL escucha en todas las interfaces, aunque las reglas de autenticación actuales están limitadas a conexiones locales.

Además, pude aplicar un cambio real de configuración mediante `ALTER DATABASE`, estableciendo un límite de diez minutos para las transacciones abiertas que permanecen inactivas.

La verificación posterior permitió comprobar que la nueva conexión utilizaba el valor configurado.

Finalmente, aprendí que el hardening debe realizarse de manera controlada y documentada. Es importante distinguir entre las configuraciones revisadas, las mejoras propuestas y los cambios realmente implementados, para reducir riesgos sin afectar innecesariamente la disponibilidad del servidor.