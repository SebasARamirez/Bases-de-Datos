# LAB-04 — Comparación de configuración y cambios de hardening

## 1. Objetivo

Comparar la configuración inicial de PostgreSQL 16 con el estado posterior al hardening, identificar los controles que necesitan mejoras y justificar técnicamente las decisiones realizadas.

## 2. Entorno

- **Motor:** PostgreSQL 16.4
- **Sistema operativo:** Windows 11
- **Puerto:** 5432
- **Base de datos:** `lab04_hardening`
- **Herramientas:** pgAdmin 4 y PowerShell

## 3. Comparación de configuración

| Control | Antes | Después | Justificación |
|---|---|---|---|
| listen_addresses | `*` | Sin cambios (`*`) | Se propone evaluar `localhost` para reducir la exposición de red. |
| pg_hba.conf | Reglas limitadas a conexiones locales | Sin cambios | Las reglas utilizan `scram-sha-256` y no incluyen rangos abiertos. |
| Método de autenticación | `scram-sha-256` | Sin cambios | Es un mecanismo adecuado para almacenar nuevas contraseñas. |
| Usuarios administrativos | `postgres` con SUPERUSER | Sin cambios | La cuenta administrativa debe reservarse para tareas de administración. |
| Cuentas de aplicación | No se identificaron cuentas independientes | Sin cambios | Se propuso separar las cuentas administrativas, de aplicación y de consulta. |
| Puerto | 5432 | Sin cambios | Cambiar el puerto no sustituye los controles de seguridad. |
| TLS | Deshabilitado (`off`) | Sin cambios | Se recomienda evaluar TLS si se necesitan conexiones remotas. |
| Permisos del sistema operativo | Varias cuentas tienen control total sobre archivos de configuración | Sin cambios | Debe verificarse qué cuentas necesitan esos permisos antes de modificarlos. |
| Extensiones | `plpgsql` 1.0 | Sin cambios | No se identificaron extensiones adicionales innecesarias. |
| max_connections | 100 | Sin cambios | El límite debe ajustarse según los recursos y necesidades del servidor. |
| statement_timeout | 0 | Sin cambios | Se recomienda evaluar límites adecuados para consultas prolongadas. |
| idle_in_transaction_session_timeout | 0 | **10min en lab04_hardening** | Se estableció un límite para transacciones abiertas que permanecen inactivas. |

## 4. Cambio de hardening aplicado

Durante el laboratorio se decidió aplicar una mejora de seguridad limitada a la base de datos `lab04_hardening`.

El parámetro seleccionado fue:

`idle_in_transaction_session_timeout`

Inicialmente, este parámetro tenía el valor `0`, lo que indicaba que no existía un tiempo límite configurado mediante esta opción.

Se decidió establecer un límite de diez minutos para reducir el riesgo de que una sesión mantuviera una transacción abierta e inactiva indefinidamente.

### Comando utilizado

```sql
ALTER DATABASE lab04_hardening
SET idle_in_transaction_session_timeout = '10min';
```

Este comando establece el valor para las nuevas conexiones a la base de datos `lab04_hardening`.

No modifica el valor global del servidor ni la configuración de las demás bases de datos.

### Justificación

Una transacción que permanece abierta e inactiva puede conservar bloqueos y consumir recursos innecesariamente.

Establecer un límite de tiempo ayuda a evitar que estas situaciones continúen de forma indefinida.

Se seleccionó un valor de diez minutos como medida de prueba para nuestro entorno académico.

En un entorno de producción, este tiempo tendría que definirse considerando las necesidades de las aplicaciones.

## 5. Verificación del cambio

Después de ejecutar el comando, se cerró la pestaña del Query Tool y se abrió una nueva conexión a `lab04_hardening`.

Posteriormente se ejecutó:

```sql
SHOW idle_in_transaction_session_timeout;
```

El resultado obtenido fue:

`10min`

Esto confirmó que la nueva conexión estaba utilizando el valor configurado.

### Comparación

| Parámetro | Antes | Después | Resultado |
|---|---|---|---|
| idle_in_transaction_session_timeout | 0 | 10min | Cambio aplicado y verificado |

**Evidencia:** [06-verificacion.png](../evidencias/06-verificacion.png)

La evidencia demuestra que el nuevo valor fue reconocido por PostgreSQL. No se realizó una prueba esperando diez minutos con una transacción abierta.

## 6. Hallazgos principales

Durante la inspección se identificaron las siguientes situaciones:

1. PostgreSQL escucha en todas las interfaces IPv4 e IPv6.
2. Las reglas de `pg_hba.conf` están limitadas a conexiones locales.
3. Se utiliza `scram-sha-256` para almacenar nuevas contraseñas.
4. La cuenta `postgres` tiene privilegios de superusuario.
5. No se identificaron cuentas independientes para aplicaciones.
6. SSL/TLS está deshabilitado.
7. Los archivos de configuración tienen varias cuentas con control total.
8. Inicialmente no existían límites generales de tiempo para consultas y transacciones inactivas.
9. Se aplicó un límite de diez minutos para las transacciones abiertas e inactivas de nuevas conexiones a `lab04_hardening`.

## 7. Mejoras propuestas pendientes

Además del cambio realizado, se identificaron otras medidas que podrían mejorar la seguridad del servidor:

- Evaluar la restricción de `listen_addresses` a `localhost`.
- Mantener las reglas restrictivas de `pg_hba.conf`.
- Separar las cuentas administrativas de las cuentas de aplicación.
- Revisar los permisos del sistema operativo sobre archivos sensibles.
- Evaluar límites de tiempo adecuados para otras operaciones.
- Configurar TLS cuando las conexiones lo requieran.
- Documentar una política de actualizaciones y mantenimiento.
- Revisar periódicamente los roles, privilegios y registros del servidor.

Estas medidas quedaron como propuestas y no fueron implementadas durante el laboratorio.

## 8. Estado final del hardening

Se aplicó y verificó un cambio real de configuración relacionado con el tiempo máximo que una sesión puede permanecer inactiva dentro de una transacción.

El cambio se limitó a `lab04_hardening` para evitar modificar la configuración global de una instancia que también contiene otras bases de datos.

Los demás parámetros revisados permanecieron sin modificaciones.

Por lo tanto, el laboratorio incluyó actividades de inspección, análisis de riesgos, diseño de controles y una mejora técnica aplicada y verificada.

## 9. Conclusión

Esta actividad permitió comparar el estado inicial de PostgreSQL con su configuración posterior al cambio de hardening.

Aprendí que no todas las medidas de seguridad necesitan aplicarse directamente sobre todo el servidor. Algunos parámetros pueden configurarse para una base de datos específica, reduciendo el impacto sobre otros sistemas.

También comprendí la importancia de verificar los cambios después de implementarlos, ya que ejecutar un comando sin errores no demuestra por sí solo que una nueva conexión esté utilizando la configuración esperada.

Finalmente, entendí que el hardening debe realizarse de manera controlada, documentada y considerando las necesidades reales del entorno.