# Actividad 10 — Diseñar y crear el registro de auditoría

## Objetivo

Diseñar una tabla que permita guardar información sobre los cambios realizados en los clientes, incluyendo el usuario responsable, la fecha, la operación y los valores anteriores y nuevos.

## 1. Diseño de la tabla de auditoría

Para cumplir con el requerimiento de conservar un historial de cambios, definí los siguientes campos:

| Campo | Tipo | ¿Qué pregunta responde? | ¿Puede ser nulo? ¿Por qué? |
|---|---|---|---|
| id_evento | BIGSERIAL | ¿Cuál es el identificador del evento? | No, porque es la clave primaria. |
| momento | TIMESTAMPTZ | ¿Cuándo ocurrió el cambio? | No, porque necesitamos la fecha y hora. |
| usuario_sesion | TEXT | ¿Qué usuario inició la sesión? | No, porque necesitamos identificar la sesión responsable. |
| usuario_efectivo | TEXT | ¿Con qué privilegios se ejecutó la operación? | No, porque permite distinguir el usuario efectivo. |
| aplicacion | TEXT | ¿Desde qué aplicación se realizó el cambio? | Sí, porque no siempre se proporciona ese dato. |
| ip_cliente | INET | ¿Desde qué dirección se conectó? | Sí, porque algunas conexiones locales no tienen una dirección IP TCP. |
| operacion | TEXT | ¿Qué operación se realizó? | No, porque debemos saber si fue INSERT, UPDATE o DELETE. |
| id_cliente | BIGINT | ¿Qué cliente fue afectado? | Sí, porque la definición permite valores nulos, aunque nuestro disparador lo completa. |
| valores_antes | JSONB | ¿Qué información tenía el cliente antes del cambio? | Sí, porque en un INSERT no existe un registro anterior. |
| valores_despues | JSONB | ¿Qué información quedó después del cambio? | Sí, porque en un DELETE no existe un registro posterior. |

## 2. Creación de la tabla

Primero creé un esquema independiente llamado `auditoria` y restringí el acceso público:

```sql
CREATE SCHEMA auditoria;

REVOKE ALL ON SCHEMA auditoria FROM PUBLIC;
```

Después creé la tabla:

```sql
CREATE TABLE auditoria.cambios_clientes (
    id_evento BIGSERIAL PRIMARY KEY,
    momento TIMESTAMPTZ NOT NULL DEFAULT now(),
    usuario_sesion TEXT NOT NULL DEFAULT session_user,
    usuario_efectivo TEXT NOT NULL DEFAULT current_user,
    aplicacion TEXT DEFAULT current_setting('application_name'),
    ip_cliente INET DEFAULT inet_client_addr(),
    operacion TEXT NOT NULL,
    id_cliente BIGINT,
    valores_antes JSONB,
    valores_despues JSONB
);
```

La tabla se creó correctamente y comprobé que contenía los diez campos solicitados.

## 3. Preguntas

### 1. ¿Por qué momento usa TIMESTAMPTZ y no TIMESTAMP?

Porque `TIMESTAMPTZ` permite manejar correctamente los instantes de tiempo considerando las zonas horarias.

Esto es importante para reconstruir una cronología, especialmente cuando existen conexiones o servidores ubicados en diferentes zonas horarias.

En cambio, `TIMESTAMP` no conserva información suficiente para interpretar por sí solo a qué instante corresponde una hora local.

### 2. ¿Por qué se guarda el registro completo en JSONB y no solo la columna que cambió?

Porque guardar el registro completo permite conocer el estado que tenía el cliente antes y después de una operación.

De esta manera no dependemos solamente de identificar una columna modificada y podemos comparar todos los campos cuando sea necesario.

Además, JSONB permite almacenar los datos de forma flexible, incluso si posteriormente agregamos nuevas columnas a la tabla `clientes`.

### 3. La tabla de auditoría también contendrá RFC. ¿Qué implica eso para su clasificación y su control de acceso?

Significa que la tabla de auditoría también contiene datos personales que deben protegerse.

Aunque su propósito sea registrar cambios, no debería estar disponible para cualquier usuario.

Por eso creamos un esquema separado y restringimos el acceso público. Solamente los administradores o usuarios autorizados deberían poder consultar esta información.

También sería importante controlar cuánto tiempo conservamos esos datos y evitar compartirlos innecesariamente.

## 4. Evidencia

- `10-tabla-auditoria.png`: muestra la creación y verificación de la tabla `auditoria.cambios_clientes`.

## Conclusión

En esta actividad diseñé una tabla para conservar información sobre las modificaciones realizadas en los clientes.

Comprendí la importancia de registrar tanto los valores anteriores como los nuevos, además del usuario, la aplicación y el momento del cambio.

También aprendí que una tabla de auditoría debe protegerse porque puede contener información personal, incluso después de que esos datos hayan sido modificados o eliminados de la tabla original.