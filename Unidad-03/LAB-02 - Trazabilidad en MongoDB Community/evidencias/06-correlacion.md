# Actividad 6 — Correlacionar un cambio de configuración con su autor

## 1. Objetivo

Identificar qué usuario modificó la configuración del perfilador de MongoDB mediante la correlación de los eventos de cambio de configuración y los eventos de autenticación registrados en la bitácora del servidor.

## 2. Identificación de los cambios de configuración

Se consultaron los eventos relacionados con la modificación del perfilador mediante:

```javascript
bitacora()
  .filter(e => e.msg === "Profiler settings changed")
  .map(e => ({
    t: e.t,
    ctx: e.ctx,
    msg: e.msg,
    attr: e.attr
  }))
```

Se encontraron tres cambios:

| Conexión | Configuración anterior | Configuración nueva | Fecha UTC |
|---|---|---|---|
| conn41 | Nivel 0 | Nivel 2 | 2026-11-08 04:14:52.921 |
| conn51 | Nivel 2 | Nivel 0 | 2026-11-08 04:27:47.705 |
| conn51 | Nivel 0 | Nivel 1 con filtro | 2026-11-08 04:28:01.289 |

Estos eventos muestran que se modificó la configuración del perfilador en la base de datos `comercial`.

## 3. Identificación del usuario responsable

Los eventos de cambio de configuración no incluyen directamente el nombre del usuario. Sin embargo, contienen el identificador de conexión `ctx`.

Se buscaron los eventos de autenticación exitosa correspondientes a las conexiones `conn41` y `conn51`.

Consulta ejecutada:

```javascript
bitacora()
  .filter(e =>
    (e.ctx === "conn41" || e.ctx === "conn51") &&
    e.msg === "Successfully authenticated"
  )
  .map(e => ({
    t: e.t,
    ctx: e.ctx,
    user: e.attr.user,
    db: e.attr.db,
    client: e.attr.client
  }))
```

Resultados:

| Conexión | Usuario | Base de autenticación | Fecha UTC |
|---|---|---|---|
| conn41 | admin | admin | 2026-11-08 04:14:44.364 |
| conn51 | admin | admin | 2026-11-08 04:17:45.772 |

Al comparar los identificadores de conexión, se comprobó que las mismas conexiones que realizaron los cambios de configuración se habían autenticado como `admin`.

Por lo tanto, el usuario responsable de los cambios fue `admin`.

## 4. Análisis de las preguntas

### ¿Qué usuario cambió la configuración del perfilador? ¿Qué dos eventos lo demuestran?

El usuario que realizó los cambios fue `admin`.

Los dos eventos necesarios para demostrarlo son:

1. `Successfully authenticated`: permite identificar al usuario que inició sesión y el identificador de su conexión.
2. `Profiler settings changed`: registra el cambio realizado y contiene el identificador de conexión correspondiente.

Al coincidir el campo `ctx` en ambos eventos, se puede relacionar la autenticación del usuario con la modificación de la configuración.

### ¿Qué condición debe cumplirse para que esta correlación sea válida?

Los eventos deben pertenecer al mismo periodo de ejecución del servidor MongoDB.

Esto es importante porque, si el servidor se reinicia, los identificadores de conexión pueden volver a utilizarse. En ese caso, dos eventos con el mismo `ctx` podrían pertenecer a conexiones diferentes.

Por eso es necesario comprobar también la continuidad temporal de la bitácora y que no haya ocurrido un reinicio entre ambos eventos.

### ¿Por qué es relevante que quede registrado un cambio de configuración del propio mecanismo de registro?

Porque permite saber cuándo alguien modifica la configuración del sistema encargado de registrar las operaciones.

Esto ayuda a detectar posibles intentos de desactivar o limitar el registro de actividades, además de mantener un seguimiento de quién realizó los cambios.

## 5. Conclusión

En esta actividad se comprobó que es posible identificar al usuario responsable de un cambio de configuración mediante la correlación de diferentes eventos de la bitácora de MongoDB.

Aunque el evento de modificación del perfilador no muestra directamente el nombre del usuario, sí contiene un identificador de conexión que permite relacionarlo con el evento de autenticación correspondiente.

En nuestro caso, se comprobó que el usuario `admin` realizó los cambios de configuración del perfilador.

Esto demuestra la importancia de registrar no solamente las operaciones sobre los datos, sino también los cambios realizados en la configuración del propio sistema de auditoría.