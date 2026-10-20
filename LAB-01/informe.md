# LAB-01 — Protección y privacidad de datos

**Materia:** Gestión de Seguridad y Desempeño de Bases de Datos  
**Unidad:** II — Seguridad, privacidad y control de acceso  
**Tema:** 2.3 — Datos sensibles, privacidad y protección de la información  
**Estudiante:** Sebastian Ramirez Alvarez  
**Fecha:** 17/10/26  
**Motor utilizado:** PostgreSQL 15.19 

## Introducción

En este laboratorio trabajé con una base de datos de clientes de una empresa ficticia para aplicar diferentes técnicas de protección de información. El objetivo fue permitir que distintas áreas consulten solamente los datos que necesitan, sin exponer información personal de manera innecesaria.

La práctica incluyó clasificación de datos, enmascaramiento, seudonimización, separación de funciones, consultas agregadas y una política básica de retención. Se utilizaron cinco registros ficticios en PostgreSQL. Aunque las instrucciones mencionan PostgreSQL 16, el servidor compartido donde realicé las pruebas 

## 19.1 Clasificación de datos

Se creó la tabla `clientes` con los campos `id`, `nombre`, `correo`, `telefono`, `rfc`, `edad`, `ciudad`, `codigo_postal` y `fecha_alta`. Después se clasificaron según su capacidad para identificar a una persona y su necesidad de protección.

Los campos **nombre, correo, teléfono y RFC** pueden funcionar como identificadores directos, dependiendo de la información disponible. El campo `id` identifica registros dentro del sistema y permite relacionarlos con la identidad de un cliente si se tiene acceso a la tabla original.

La **edad, ciudad, código postal y fecha de alta** pueden actuar como cuasi-identificadores: quizá no identifiquen a una persona por separado, pero al combinarse con otros datos podrían facilitar su reidentificación.

Por eso, todos los campos deben tratarse con cuidado según su uso y nivel de exposición. Esto no significa que todos se consideren jurídicamente *datos personales sensibles*.

## 19.2 Enmascaramiento

El área de soporte necesita reconocer al cliente y atender solicitudes, pero no requiere conocer por completo su correo, teléfono o RFC.

Se creó la vista `v_clientes_soporte`, que presenta el **ID y el nombre** del cliente y oculta parcialmente los otros tres campos:

- **Correo:** conserva los dos primeros caracteres y el dominio, sustituyendo parte del texto por asteriscos.
- **Teléfono:** muestra únicamente los últimos cuatro caracteres.
- **RFC:** muestra únicamente los últimos cuatro caracteres.

La vista se implementó con `CREATE VIEW` y funciones como `LEFT`, `RIGHT`, `SUBSTRING` y `CONCAT`. Los datos completos **no se borraron ni se modificaron**: siguen guardados en `public.clientes`.

Se utilizaron los comandos `GRANT USAGE`, `GRANT SELECT` y `REVOKE ALL` para establecer los permisos previstos para el rol `soporte`. La consulta de comprobación de privilegios mostró `true` para el uso del esquema y la lectura de la vista, y `false` para la lectura de la tabla original.

**Limitación de la prueba:** el rol `soporte` ya existía en el servidor compartido. Al ejecutar `SELECT * FROM clientes` con mi usuario habitual, la consulta mostró los datos completos, porque ese usuario sí tenía acceso a la tabla. Por ello, quedó pendiente obtener una captura de una consulta rechazada ejecutada realmente con los permisos del rol `soporte`. La comprobación indirecta de privilegios no sustituye esa evidencia.

Este mecanismo resulta adecuado para soporte porque reduce la información visible sin alterar los registros originales, siempre que los permisos efectivos impidan consultar directamente la tabla base.

## 19.3 Seudonimización

Para el área de analítica se crearon los esquemas `pii` y `analitica`.

Dentro de `pii` se creó la tabla `mapa_cliente`, que relaciona un **token UUID** con el `cliente_id` original. Se generó un token para cada uno de los cinco clientes mediante `gen_random_uuid()`.

Después se creó `analitica.clientes`, que contiene `cliente_token`, `edad`, `ciudad`, `codigo_postal` y `fecha_alta`. Esta tabla no incluye directamente nombre, correo, teléfono ni RFC, por lo que permite trabajar con datos sin mostrar esos identificadores.

El mapa `pii.mapa_cliente` requiere un nivel de protección más estricto: permite vincular los tokens con los IDs originales y, junto con `public.clientes`, recuperar la identidad de los clientes. Por eso, el área de analítica debería consultar únicamente `analitica.clientes`, mientras que el acceso al mapa debe reservarse a personal específicamente autorizado.

Para aplicar la separación de funciones, se trabajó con el rol `analista` y los permisos `GRANT USAGE ON SCHEMA analitica` y `GRANT SELECT ON analitica.clientes`.

**Limitación de la prueba:** el rol `analista` también existía previamente en el servidor compartido. Las consultas a `pii.mapa_cliente` y `public.clientes` mostraron registros al ejecutarse con mi usuario habitual; eso no demuestra que `analista` tenga esos accesos. Quedaron pendientes las capturas de permisos efectivos o, preferiblemente, de accesos permitidos y rechazados comprobados en una sesión autorizada con el rol correspondiente.

La seudonimización disminuye la identificación directa, pero **no equivale a anonimización**, porque existe información adicional que permite recuperar la relación entre token y persona. También permanecen atributos que pueden contribuir a identificar a alguien.

## 19.4 Anonimización y riesgo de reidentificación

Se realizaron consultas para disminuir el detalle de los datos utilizados en estadísticas:

1. **Generalización de la edad:** se agruparon los clientes en rangos. Con los datos de prueba, cuatro clientes quedaron en `31-45` y uno en `46+`.
2. **Generalización de la región:** se utilizaron solamente los dos primeros caracteres del código postal. Se obtuvieron tres registros para la región `80`, uno para `81` y uno para `82`.
3. **Combinación de atributos:** se agruparon los datos por rango de edad y región. El resultado fue: `31-45`/`80` = 3, `31-45`/`81` = 1 y `46+`/`82` = 1.
4. **Supresión de grupos pequeños:** se agregó `HAVING COUNT(*) >= 5`. La consulta no devolvió filas porque ninguno de los grupos alcanzó cinco clientes.

En el reto del apartado 13 se modificó la consulta para usar un rango de edad más amplio (`30-49`) y **eliminar la región de la agrupación**. Así se obtuvo un solo grupo de cinco clientes, que cumple con el umbral utilizado en el ejercicio.

El cambio buscó reducir el riesgo de reidentificación: al mostrar menos detalles y evitar grupos de una sola persona, resulta más difícil distinguir un registro. Sin embargo, el resultado **no demuestra un anonimato del 100 %**. El riesgo depende también de otros datos disponibles, posibles fuentes externas y del contexto en que se publiquen las estadísticas.

## 19.5 Retención de datos

La práctica propuso un periodo didáctico de conservación de **cinco años**. Para identificar registros más antiguos se ejecutó:

```sql
SELECT *
FROM clientes
WHERE fecha_alta < CURRENT_DATE - INTERVAL '5 years';
```

La consulta devolvió **cero registros**, porque los cinco clientes fueron agregados recientemente y su `fecha_alta` se generó con la fecha actual. Por lo tanto, en los datos utilizados no se identificaron registros candidatos a eliminación por ese criterio.

El periodo de cinco años es un ejemplo del laboratorio; en una organización real debe justificarse de acuerdo con la finalidad del tratamiento y las obligaciones legales, contractuales u operativas aplicables.

Antes de eliminar datos deberían existir una revisión de los registros afectados, una autorización del responsable, un respaldo reciente y comprobado, un procedimiento de recuperación y un registro de quién aprobó y ejecutó el proceso. También debe revisarse cómo se gestionan las copias de seguridad y los periodos de conservación.

**No se ejecutó `DELETE`** sobre la tabla principal.

## 19.6 Conclusiones

**¿Qué técnica utilizaría para un área de soporte?**  
El **enmascaramiento mediante una vista**. Así el personal puede atender a los clientes viendo solamente una parte del correo, teléfono y RFC, sin tener acceso innecesario a los valores completos.

**¿Qué técnica utilizaría para un área de analítica?**  
La **seudonimización**, utilizando tokens en lugar de identificadores directos y manteniendo separada y protegida la tabla que permite relacionarlos con la identidad real.

**¿Qué técnica utilizaría para publicar estadísticas?**  
La **generalización y agregación**, junto con la supresión de grupos pequeños cuando sea apropiada. Antes de publicar, también sería necesario evaluar el riesgo de reidentificación; no basta con quitar nombres o imponer un umbral fijo.

**¿Por qué ninguna de estas técnicas sustituye al control de acceso?**  
Porque cada técnica atiende un riesgo diferente. Enmascarar cambia lo que se muestra, seudonimizar reemplaza identificadores y agregar disminuye el detalle, pero sigue siendo necesario definir quién puede entrar, qué puede consultar y qué operaciones puede realizar. La protección adecuada requiere combinar mecanismos.

En general, el laboratorio me ayudó a comprender que la privacidad en una base de datos no depende de un solo comando. Es necesario analizar qué información se usa, para qué se necesita, quién la consulta y qué riesgos permanecen después de aplicar cada control.

## 20. Preguntas de reflexión

**1. ¿Cuál es la diferencia entre enmascaramiento y seudonimización?**  
El enmascaramiento oculta total o parcialmente cómo se presenta un dato, mientras que la seudonimización sustituye un identificador por otro, como un token, y guarda por separado la información que permite relacionarlos.

**2. ¿Por qué la seudonimización no significa anonimización?**  
Porque todavía puede existir una tabla de correspondencia que permita volver a vincular el token con la persona original. Por eso los datos siguen necesitando protección.

**3. ¿Por qué eliminar nombre y RFC no garantiza que un conjunto de datos sea anónimo?**  
Porque otros campos, como edad, ciudad o código postal, podrían combinarse con información externa y ayudar a reconocer a alguien.

**4. ¿Qué función tienen los cuasi-identificadores?**  
Son datos que no necesariamente identifican a una persona por sí solos, pero que pueden contribuir a hacerlo al combinarse con otros atributos.

**5. ¿Por qué es importante separar el mapa de seudonimización?**  
Porque el mapa permite relacionar los tokens con los IDs originales. Si cualquier analista pudiera consultarlo, sería más fácil recuperar la identidad de los clientes.

**6. ¿Qué principio de seguridad se aplica al impedir que el analista acceda al mapa?**  
Principalmente el **mínimo privilegio** y la **separación de funciones**, ya que cada rol debe tener solamente los accesos necesarios para realizar su trabajo.

**7. ¿Por qué una vista puede ser preferible a entregar acceso directo a la tabla?**  
Porque permite mostrar únicamente las columnas y los valores que necesita un área, sin darle permiso para consultar toda la información original.

**8. ¿Qué diferencia existe entre proteger un dato para visualización y protegerlo contra acceso no autorizado?**  
Proteger la visualización consiste en ocultar parte del contenido mostrado. Proteger contra acceso no autorizado significa impedir, mediante permisos y controles, que alguien consulte información que no debería conocer. Se necesitan ambas medidas según el caso.

**9. ¿Por qué la retención forma parte de la protección de datos?**  
Porque establece cuánto tiempo se conserva la información y ayuda a evitar almacenar datos personales que ya no son necesarios para su finalidad.

**10. ¿Qué riesgo existe si una organización conserva información indefinidamente?**  
Con el tiempo acumula más información de la necesaria, aumenta la cantidad de datos que podrían quedar expuestos en un incidente y puede incumplir obligaciones de conservación y eliminación.

## Observación

Las evidencias de vistas, tokens, tablas analíticas, agregaciones y retención se guardaron durante la práctica. En cambio, las pruebas de **acceso denegado** no me resultaron ya que me dejaba consultar las tablas originales bajo los roles `soporte` y `analista`, inclui la aclaración y el resultado esperado en el PDF correspondiente.
