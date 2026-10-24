# LAB-03 — Privacidad, cumplimiento y gobierno de los datos

**Materia:** Gestión de Seguridad y Desempeño de Bases de Datos  
**Unidad:** II. Seguridad, privacidad y control de acceso  
**Tema:** 2.5 Privacidad, cumplimiento y gobierno de los datos  
**Motor de base de datos:** PostgreSQL 16  
**Modalidad:** Individual

---

## 1. Introducción

En este laboratorio se trabajaron diferentes aspectos relacionados con la privacidad, el cumplimiento y el gobierno de los datos dentro de una organización.

Para realizar las actividades se utilizó el escenario de la empresa ficticia Comercializadora Norte S.A. de C.V., que almacena información personal de sus clientes, como nombres, correos electrónicos, teléfonos, RFC, edades y ciudades.

El propósito del laboratorio fue comprender que proteger una base de datos no consiste solamente en utilizar contraseñas o configurar permisos. También es importante saber por qué se almacena cada dato, quién necesita utilizarlo, durante cuánto tiempo debe conservarse y qué sucede cuando un cliente solicita consultar, corregir o cancelar su información.

Se utilizó PostgreSQL 16 de manera local para realizar las actividades prácticas, mientras que los ejercicios teóricos se documentaron en archivos Markdown.

Durante la práctica se aplicaron conceptos como minimización de datos, separación por finalidad, mínimo privilegio, derechos ARCO, retención, privacidad por diseño y gobierno de datos.

## 2. Inventario de datos

### Actividad 1 — Inventario y finalidad de los datos

**Objetivo:** Identificar los datos personales almacenados por la empresa, su finalidad, necesidad, nivel de acceso y criterios de conservación.

Se utilizó una tabla llamada `clientes`, que contiene nueve campos:

| Campo | ¿Es dato personal? | Finalidad principal | Necesidad |
|---|---|---|---|
| id | Sí, indirectamente | Identificar registros | Necesario |
| nombre | Sí | Identificación y atención | Necesario |
| correo | Sí | Comunicación con clientes | Necesario para contacto por correo |
| telefono | Sí | Comunicación con clientes | Depende de la necesidad |
| rfc | Sí | Facturación | Necesario cuando se requiera facturar |
| edad | Sí, asociada al cliente | Estadísticas | Requiere justificación |
| ciudad | Sí, asociada al cliente | Análisis geográfico | Depende de la finalidad |
| codigo_postal | Sí, asociado al cliente | Facturación o análisis regional | Depende de la finalidad |
| fecha_alta | Sí, asociada al cliente | Administración de registros | Necesario para la gestión |

### Análisis

La clasificación permitió identificar que no todos los campos necesitan ser consultados por las mismas áreas.

Por ejemplo, atención al cliente necesita principalmente información de contacto, mientras que facturación requiere datos fiscales. El área de analítica puede trabajar con información agrupada sin consultar nombres, teléfonos o correos electrónicos.

También se identificó que los periodos de retención deben establecerse según la finalidad de cada dato y las obligaciones que correspondan, en lugar de conservar toda la información indefinidamente.

**Evidencia:** [01-inventario-datos.md](evidencias/01-inventario-datos.md)

## 3. Finalidades del tratamiento de datos

### Actividad 3 — Separación por finalidad

**Objetivo:** Proporcionar información estadística sin revelar datos personales innecesarios.

**Procedimiento:** Se realizaron consultas SQL en PostgreSQL para conocer la cantidad de clientes por ciudad y agruparlos por rangos de edad.

Primero se utilizó una consulta con `COUNT(*)` y `GROUP BY` para obtener la cantidad de clientes por ciudad.

**Resultados:**

| Ciudad | Cantidad de clientes |
|---|---:|
| Culiacán | 3 |
| Mazatlán | 1 |
| Los Mochis | 1 |

Posteriormente se utilizó `CASE` para clasificar las edades en diferentes rangos.

| Rango de edad | Cantidad |
|---|---:|
| 18-29 | 2 |
| 30-44 | 2 |
| 45-59 | 1 |

**Pregunta: ¿Por qué esta información puede ser más apropiada para analítica que entregar directamente la tabla completa de clientes?**

La información agrupada permite generar estadísticas sin mostrar los datos personales de cada cliente. Así se comparte únicamente lo necesario para el análisis y se reduce el riesgo de exposición de información privada.

Sin embargo, los grupos muy pequeños todavía pueden presentar riesgos de identificación, por lo que es importante evaluar si se necesitan medidas adicionales.

**Conclusión:** Aprendí que es posible obtener información útil de una base de datos sin entregar todos los datos originales. Separar la información según su finalidad ayuda a proteger la privacidad de los clientes.

**Archivo SQL:** [02-finalidad.sql](sql/02-finalidad.sql)

### Actividad 5 — Análisis de una finalidad secundaria

La empresa propuso utilizar información de sus clientes para enviar promociones personalizadas según su edad, ciudad y comportamiento de compra.

Se identificó que el hecho de tener los datos almacenados no significa que puedan utilizarse automáticamente para cualquier finalidad.

Antes de implementar promociones, la organización tendría que revisar si esa finalidad está permitida, si fue informada adecuadamente, qué datos necesita y cómo pueden respetarse las preferencias de los clientes.

También se propuso limitar el acceso del área de marketing mediante vistas y permisos que únicamente permitan consultar la información necesaria.

**Conclusión:** Una finalidad secundaria debe analizarse y justificarse antes de utilizar los datos personales. La empresa debe evitar proporcionar información innecesaria a otras áreas.

**Evidencia:** [05-finalidad-secundaria.md](evidencias/05-finalidad-secundaria.md)

## 4. Principio de minimización de datos

### Actividad 2 — Principio de minimización

**Objetivo:** Aplicar el principio de minimización creando una tabla para atención al cliente que contenga solamente los datos necesarios.

### Procedimiento

Se creó la tabla `clientes_soporte` en PostgreSQL, incluyendo únicamente cuatro campos:

- `id`
- `nombre`
- `correo`
- `telefono`

Posteriormente se copiaron cinco registros desde la tabla original `clientes` y se verificaron mediante una consulta SQL.

### Resultado

La tabla `clientes_soporte` contiene cinco registros y solamente las cuatro columnas necesarias para la función básica de soporte.

No se incluyeron el RFC, la edad, la ciudad ni el código postal, porque no son indispensables para la finalidad propuesta.

### Preguntas

**1. ¿Todos los campos son necesarios para atención al cliente?**

No, porque atención al cliente solamente necesita información básica para identificar y contactar a las personas, como su nombre, correo y teléfono. Datos como el RFC o la edad no son necesarios para esa función.

**2. ¿Por qué soporte necesitaría conocer el RFC?**

Normalmente no lo necesita, porque el RFC se utiliza principalmente para temas fiscales y de facturación. Esa información debería estar disponible solamente para el personal encargado de esas actividades.

**3. ¿Necesita conocer la edad?**

No necesariamente. Para brindar atención al cliente no hace falta conocer su edad, a menos que exista una razón específica que lo justifique.

**4. ¿Necesita conocer el código postal?**

No para las actividades básicas de soporte. Podría ser necesario si se atienden problemas relacionados con entregas o domicilios, pero no debería incluirse si no existe esa necesidad.

**5. ¿Qué principio de privacidad está relacionado con esta decisión?**

El principio de minimización de datos, que consiste en recopilar y utilizar solamente la información necesaria para cumplir una finalidad específica.

### Análisis y conclusión

Esta actividad permitió comprender que no todas las áreas necesitan consultar la misma información. Al limitar los campos de la tabla de soporte, reducimos la exposición de datos personales innecesarios.

También es importante mantener actualizada esta información si cambia en la tabla original, ya que las copias independientes pueden quedar desactualizadas.

**Archivo SQL:** [01-minimizacion.sql](sql/01-minimizacion.sql)

## 5. Control de acceso relacionado con la finalidad

### Actividad 4 — Roles y permisos de PostgreSQL

**Objetivo:** Limitar el acceso a la información de los clientes según las funciones de cada área, utilizando roles y permisos de PostgreSQL.

### Procedimiento

Se creó el rol `analista` con la opción `NOLOGIN`.

Después se creó una vista llamada `v_analitica_clientes`, que contiene únicamente la ciudad y el rango de edad de cada cliente.

Posteriormente se otorgaron permisos mediante los comandos:

```sql
GRANT USAGE ON SCHEMA public TO analista;

GRANT SELECT ON v_analitica_clientes TO analista;
```

No se otorgó directamente el permiso `SELECT` sobre la tabla original `clientes`.

Finalmente, se utilizó una consulta sobre `information_schema.role_table_grants` para verificar los permisos concedidos.

### Resultado

La consulta de verificación mostró:

| Rol | Objeto | Permiso |
|---|---|---|
| analista | v_analitica_clientes | SELECT |

Esto confirmó que se otorgó al rol el permiso de lectura sobre la vista preparada para analítica.

### Preguntas

**1. ¿Qué información puede consultar el rol?**

Puede consultar la ciudad y el rango de edad de los clientes mediante la vista `v_analitica_clientes`.

**2. ¿Puede consultar directamente clientes?**

No le otorgamos permiso para consultar directamente la tabla `clientes`. La intención es que solamente tenga acceso a la vista preparada para analítica.

**3. ¿Puede obtener nombre, correo y RFC?**

No mediante la vista creada, porque esos campos no están incluidos. La vista solamente muestra la ciudad y el rango de edad.

**4. ¿Qué principio de privacidad estás aplicando?**

El principio de minimización de datos, porque limitamos la información que se proporciona al área de analítica según su finalidad.

**5. ¿Qué principio de seguridad estás aplicando?**

El principio de mínimo privilegio, porque otorgamos únicamente los permisos necesarios para realizar las actividades correspondientes.

### Análisis

Esta actividad demuestra cómo los roles y las vistas permiten controlar la información que puede consultar cada área de una empresa.

Aunque la base de datos contiene información personal, no todos los usuarios necesitan acceder a ella.

Además, los datos de la vista todavía podrían presentar riesgos de identificación, por lo que deben utilizarse con cuidado.

### Conclusión

Aprendí que podemos utilizar roles y permisos de PostgreSQL para limitar el acceso a los datos personales. Esto ayuda a proteger la privacidad de los clientes y evita que los usuarios consulten información que no necesitan.

**Archivo SQL:** [03-control-acceso.sql](sql/03-control-acceso.sql)

## 6. Derechos ARCO y sus implicaciones técnicas

Los derechos ARCO permiten a los titulares solicitar el acceso, rectificación, cancelación y oposición relacionados con el tratamiento de sus datos personales, cuando corresponda.

El DBA puede ayudar técnicamente a atender estas solicitudes, pero las decisiones legales y administrativas deben coordinarse con las áreas responsables.

### Actividad 6 — Derecho de acceso

**Objetivo:** Comprender cómo una base de datos puede ayudar a una empresa a responder una solicitud de acceso a datos personales.

**Procedimiento:** Se realizó una consulta SQL en PostgreSQL para localizar la información de una cliente ficticia mediante su correo electrónico.

La consulta permitió encontrar el registro de Ana López y mostrar los nueve campos almacenados en la tabla `clientes`.

**Pregunta: ¿Qué información adicional debería proporcionar la organización además del resultado de esta consulta?**

Además de mostrar los datos personales almacenados, la organización debería informar para qué utiliza esa información, cómo la protege, durante cuánto tiempo la conserva y con quién podría compartirla.

También debería explicar cómo ejercer los derechos ARCO y verificar la identidad del solicitante antes de entregar los datos.

**Análisis:** El DBA puede utilizar consultas SQL para localizar información relacionada con una solicitud de acceso. Sin embargo, la verificación de identidad y la respuesta formal deben coordinarse con las áreas responsables de privacidad y cumplimiento.

**Conclusión:** Aprendí que las consultas SQL pueden ayudar a atender las solicitudes de acceso, pero también es necesario contar con procedimientos que protejan la información personal.

### Actividad 7 — Derecho de rectificación

**Objetivo:** Comprender cómo se puede corregir información personal cuando un cliente solicita actualizar sus datos.

**Procedimiento:** Se utilizó la instrucción `UPDATE` de PostgreSQL para modificar el correo electrónico de Ana López, identificada con el `id` 1.

Después se ejecutó una consulta `SELECT` para comprobar que la información se actualizó correctamente.

### Resultado

El correo original `ana@example.com` fue reemplazado por `nuevo-correo@example.com`.

La actualización afectó únicamente al registro de Ana López.

### Preguntas

**1. ¿Cómo podría comprobarse que el cambio fue autorizado?**

La empresa podría comprobarlo verificando la identidad del cliente y conservando un registro de su solicitud. Así se asegura de que la modificación fue solicitada por la persona correcta.

**2. ¿Debería registrarse quién realizó el cambio?**

Sí, porque es importante saber qué usuario modificó la información, cuándo lo hizo y qué dato fue actualizado. Esto ayuda a mantener un mejor control sobre los datos personales.

**3. ¿Por qué la trazabilidad será importante?**

Porque permite conocer el historial de modificaciones realizadas en la base de datos. Si ocurre un error o un cambio no autorizado, será más fácil investigar qué sucedió y quién fue responsable.

### Análisis y conclusión

La rectificación permite mantener actualizados los datos personales de los clientes. Sin embargo, no basta con cambiar la información: también es importante comprobar que la solicitud sea legítima y registrar las modificaciones realizadas.

Además, cuando existen copias de los datos en otras tablas, también debe revisarse si necesitan actualizarse.

Aprendí que PostgreSQL permite corregir información mediante `UPDATE`, pero también es necesario contar con procedimientos de autorización y trazabilidad.

### Actividad 8 — Derecho de cancelación y ciclo de vida

Se analizó por qué eliminar un registro de la tabla principal no garantiza que toda la información personal haya desaparecido de la organización.

Se identificaron posibles ubicaciones adicionales:

- Tablas relacionadas.
- Respaldos.
- Réplicas.
- Registros de auditoría.
- Reportes.
- Copias para analítica.
- Archivos exportados.
- Sistemas externos.

Un ejemplo de esta situación es la tabla `clientes_soporte`, que contiene una copia de determinados datos de `clientes`.

Aunque modificamos el correo de Ana López en la tabla original, su información anterior permanece en la tabla de soporte si no se actualiza por separado.

Por eso, una solicitud de cancelación debe considerar todas las ubicaciones de la información y las obligaciones de conservación aplicables.

No se ejecutó ningún comando `DELETE` durante esta actividad.

**Evidencia:** [08-ciclo-vida.md](evidencias/08-ciclo-vida.md)

### Actividad 9 — Derecho de oposición

**Objetivo:** Comprender cómo actuar cuando un cliente solicita que sus datos personales dejen de utilizarse para una finalidad determinada.

**Procedimiento:** Se analizó el caso de un cliente que solicita que su información deje de utilizarse para promociones. Se identificaron los datos que podrían conservarse, los usos que deberían limitarse y las medidas técnicas aplicables.

**Pregunta principal: ¿Es necesario eliminar inmediatamente todos sus datos de la base?**

No necesariamente. Si el cliente solamente se opone a que sus datos sean utilizados para promociones, la empresa debe revisar esa solicitud y determinar qué tratamientos deben detenerse.

Esto no significa que todos sus datos deban eliminarse, ya que algunos podrían seguir siendo necesarios para otras finalidades justificadas.

### Preguntas de análisis

**1. ¿Qué información podría necesitar mantenerse?**

La empresa podría necesitar conservar el nombre, los datos de contacto o la información fiscal del cliente para administrar su cuenta, brindarle atención o cumplir con las obligaciones que correspondan.

**2. ¿Qué información podría dejar de utilizarse para determinada finalidad?**

El correo electrónico, la edad, la ciudad y el historial de compras podrían dejar de utilizarse para generar o enviar promociones personalizadas, dependiendo de la solicitud y de la decisión correspondiente.

**3. ¿Qué mecanismos técnicos podrían separar finalidades?**

Se podrían utilizar roles con permisos específicos, vistas de PostgreSQL que muestren solamente ciertos datos y un registro de preferencias donde se indique qué clientes no deben recibir promociones.

También podrían aplicarse filtros para excluir a esos clientes de las consultas utilizadas por marketing.

**4. ¿Por qué la decisión final no debe ser tomada únicamente por el DBA?**

Porque el DBA se encarga principalmente de administrar y proteger técnicamente la base de datos, pero no le corresponde decidir por sí solo qué tratamientos están permitidos.

Es necesario que las áreas responsables de privacidad y cumplimiento analicen la solicitud y determinen qué acciones deben realizarse. Después, el DBA puede implementar los cambios técnicos necesarios.

### Resultado y conclusión

Se identificó que el derecho de oposición puede requerir limitar un uso específico de los datos sin eliminar toda la información del cliente.

Los mecanismos mencionados son propuestas para este escenario; no se implementaron cambios en PostgreSQL durante esta actividad.

Esta actividad me permitió comprender que una empresa puede utilizar los datos de un cliente para diferentes finalidades, pero debe respetar las solicitudes de oposición cuando correspondan.

## 7. Retención y ciclo de vida de los datos

### Actividad 10 — Política de retención

**Objetivo:** Analizar la importancia de establecer periodos adecuados de conservación de datos personales.

La empresa propuso conservar indefinidamente todos los datos de los clientes porque podrían ser útiles en el futuro.

### Análisis

Esta propuesta no es adecuada si no existe una finalidad que justifique conservar la información.

Mantener datos innecesarios durante demasiado tiempo aumenta los riesgos de filtraciones, accesos no autorizados, uso indebido y almacenamiento de información desactualizada.

La organización debería establecer periodos de conservación considerando:

- La finalidad para la que se recopilaron los datos.
- Las necesidades operativas.
- Las obligaciones legales, fiscales y contractuales aplicables.
- Las responsabilidades de cada área.
- Los procedimientos de eliminación o anonimización.
- El tratamiento de respaldos y copias adicionales.

También sería necesario documentar los criterios utilizados para establecer cada periodo.

No se definió un número específico de años, porque los plazos deben justificarse según las obligaciones y finalidades aplicables.

### Conclusión

Aprendí que conservar información indefinidamente no necesariamente representa una ventaja para una empresa.

Una política de retención permite reducir riesgos y mantener un mejor control sobre los datos personales durante todo su ciclo de vida.

**Evidencia:** [10-retencion.md](evidencias/10-retencion.md)

## 8. Gobierno de datos y responsabilidades

### Actividad 11 — Matriz de gobierno de datos

**Objetivo:** Identificar las responsabilidades relacionadas con el uso, protección y conservación de la información personal.

Se elaboró una matriz para determinar qué áreas deberían administrar y consultar cada tipo de dato.

| Dato | Finalidad | Responsable funcional | Acceso autorizado |
|---|---|---|---|
| nombre | Identificación y atención | Atención al cliente | Soporte y facturación |
| correo | Comunicación | Atención al cliente | Soporte autorizado |
| telefono | Contacto | Atención al cliente | Soporte autorizado |
| rfc | Facturación | Facturación | Personal fiscal autorizado |
| edad | Estadísticas | Dirección / Analítica | Analistas con datos agrupados |
| ciudad | Estadísticas geográficas | Dirección / Analítica | Analistas autorizados |
| codigo_postal | Facturación y análisis regional | Facturación / Dirección | Facturación y analítica limitada |

La matriz completa también incluye medidas de protección, criterios de retención y acciones al finalizar el periodo de conservación.

**Evidencia:** [11-gobierno-datos.md](evidencias/11-gobierno-datos.md)

### Actividad 12 — Privacidad por diseño

Se analizó una propuesta de tabla que pretendía recopilar demasiados datos de los clientes, incluyendo salario, ocupación, fecha de nacimiento y estado civil, sin justificar adecuadamente su necesidad.

Se identificó que este diseño ignoraba principalmente el principio de minimización de datos.

Como propuesta de mejora, se recomendó solicitar solamente la información indispensable para registrar y atender a los clientes.

Los campos adicionales deberían incluirse únicamente cuando exista una finalidad que justifique su uso.

También se propuso limitar los permisos desde la configuración inicial de la aplicación y definir reglas de conservación.

**Conclusión:** La privacidad debe considerarse desde el diseño del sistema, evitando recopilar datos solamente porque podrían utilizarse en el futuro.

**Evidencia:** [12-privacidad-diseno.md](evidencias/12-privacidad-diseno.md)

### Actividad 13 — Controles técnicos y administrativos

**Objetivo:** Diferenciar los controles técnicos y administrativos que se utilizan para proteger los datos personales.

### Resultado — Clasificación

| Medida | Técnico | Administrativo |
|---|:---:|:---:|
| Crear roles de PostgreSQL | Sí | No |
| Política de retención | No | Sí |
| Cifrado de datos | Sí | No |
| Procedimiento para solicitudes ARCO | No | Sí |
| Vista con información limitada | Sí | No |
| Clasificación de información | Sí | Sí |
| Registro de auditoría | Sí | Sí |
| Política de control de acceso | No | Sí |

### Justificación

**Crear roles de PostgreSQL:** Es un control técnico porque consiste en configurar permisos dentro del sistema de base de datos.

**Política de retención:** Es administrativo porque establece reglas sobre cuánto tiempo deben conservarse los datos y cuándo deben eliminarse.

**Cifrado de datos:** Es técnico porque utiliza mecanismos criptográficos para proteger la información.

**Procedimiento para solicitudes ARCO:** Es administrativo porque define los pasos y responsabilidades para atender las solicitudes de los titulares.

**Vista con información limitada:** Es técnico porque se implementa mediante SQL para mostrar únicamente los datos necesarios.

**Clasificación de información:** Puede involucrar ambos controles. Administrativamente se establecen las categorías de información y técnicamente pueden implementarse etiquetas o mecanismos para identificarlas.

**Registro de auditoría:** Involucra ambos controles porque el sistema registra técnicamente las actividades, mientras que la organización establece procedimientos para revisar esos registros.

**Política de control de acceso:** Es administrativo porque define las reglas sobre quién puede acceder a la información. Su aplicación puede apoyarse en controles técnicos como los roles.

### Análisis y conclusión

Los controles técnicos y administrativos se complementan.

Por ejemplo, una empresa puede establecer una política que limite el acceso a los datos personales, pero también necesita configurar permisos en PostgreSQL para aplicarla.

Aprendí que proteger una base de datos no consiste solamente en utilizar herramientas tecnológicas. También es necesario establecer políticas y procedimientos para administrar adecuadamente la información.

## 9. Evaluación integral de riesgos

### Actividad 14 — Escenario integral

**Objetivo:** Identificar problemas relacionados con la privacidad y seguridad de los datos personales en una empresa con 50,000 clientes.

Se analizaron diferentes problemas relacionados con los accesos, la conservación de información, las copias utilizadas para desarrollo y el uso de datos para promociones.

### Principales riesgos identificados

| Problema | Riesgo | Control propuesto |
|---|---|---|
| Analistas con acceso directo a clientes | Exposición de información personal | Roles y vistas limitadas |
| Analítica consulta identificadores personales | Acceso innecesario | Consultas agregadas |
| RFC disponible para analítica | Uso indebido de información fiscal | Restringir acceso a facturación |
| Datos conservados durante 12 años sin justificación documentada | Conservación innecesaria | Revisar finalidades y periodos |
| Ausencia de política de retención | Falta de control del ciclo de vida | Crear política documentada |
| Copias completas entregadas a desarrolladores | Exposición innecesaria | Proporcionar datos mínimos |
| Uso de información real en pruebas | Posibles filtraciones | Utilizar datos ficticios o anonimizados |
| Varias copias de información personal | Dificultad para controlar y eliminar datos | Inventario de copias |
| Correos utilizados en marketing sin finalidad clara | Tratamiento no justificado | Revisar fundamento y aviso de privacidad |
| Finalidades no documentadas | Uso inadecuado de la información | Inventario de finalidades |
| Acceso excesivo a la tabla principal | Consultas fuera de funciones autorizadas | Separación mediante permisos |
| Copias que dificultan solicitudes ARCO | Información sin actualizar o cancelar | Procedimientos de sincronización y revisión |

Se identificaron doce problemas y se relacionaron con los principios afectados, sus riesgos y posibles controles.

**Evidencia:** [14-evaluacion-integral.md](evidencias/14-evaluacion-integral.md)

### Actividad 15 — Arquitectura de datos protegidos

Se propuso una arquitectura conceptual que separa los datos según las necesidades de cada área.

La arquitectura considera tres componentes principales:

**Operación:** permite que soporte y facturación consulten únicamente los datos necesarios para sus actividades.

**Analítica:** proporciona estadísticas agrupadas, como cantidad de clientes por ciudad y rangos de edad.

**Auditoría:** permite registrar operaciones importantes para mantener trazabilidad sobre los accesos y modificaciones.

También se propusieron controles relacionados con:

- Acceso.
- Minimización.
- Protección de información personal.
- Retención.
- Trazabilidad.
- Eliminación.
- Atención de solicitudes ARCO.

La arquitectura no fue implementada físicamente, ya que el objetivo consistía en diseñar una propuesta conceptual.

**Evidencia:** [15-arquitectura.md](evidencias/15-arquitectura.md)

## 10. Conclusiones generales

Durante el LAB-03 aprendí que administrar una base de datos no significa solamente almacenar información y asegurarse de que funcione correctamente.

También es necesario comprender para qué se utiliza cada dato, quién necesita consultarlo y qué medidas deben aplicarse para proteger la privacidad de las personas.

Las actividades prácticas en PostgreSQL me ayudaron a comprender cómo pueden utilizarse las consultas, las vistas y los roles para limitar la información disponible según las funciones de cada área.

También pude observar que copiar información en diferentes tablas puede generar problemas si los datos se modifican o eliminan, porque las copias no necesariamente se actualizan automáticamente.

En las actividades teóricas comprendí la importancia de los derechos ARCO, las políticas de retención, la privacidad por diseño y la documentación de responsabilidades.

Considero que uno de los aprendizajes más importantes es que una base de datos puede tener buenas medidas de seguridad y aun así presentar problemas de privacidad si la información se recopila o utiliza sin una finalidad justificada.

Finalmente, entendí que el DBA tiene una responsabilidad importante en la protección técnica de los datos, pero también debe trabajar junto con las áreas jurídicas, de privacidad y los responsables de la información para aplicar correctamente las decisiones de la organización.

---

## 11. Preguntas de reflexión

### 1. ¿Una base de datos técnicamente segura necesariamente cumple con todos los requisitos de privacidad?

No necesariamente. Una base de datos puede tener contraseñas, cifrado y permisos bien configurados, pero seguir teniendo problemas de privacidad si almacena información innecesaria o utiliza datos para finalidades que no están justificadas.

### 2. ¿Por qué el principio de mínimo privilegio también contribuye a la privacidad?

Porque limita el acceso a la información según las funciones de cada usuario. De esta manera, evitamos que los empleados consulten datos personales que no necesitan para realizar su trabajo.

### 3. ¿Por qué el DBA no debería decidir por sí solo la finalidad del tratamiento de los datos?

Porque el DBA se encarga principalmente de la administración técnica de la base de datos. Las decisiones sobre para qué se utiliza la información deben involucrar a las áreas responsables de privacidad, cumplimiento y a los propietarios de los datos.

### 4. ¿Por qué los desarrolladores no deberían recibir automáticamente copias completas de bases de datos productivas?

Porque estas copias pueden contener información personal y confidencial que no necesitan para desarrollar o probar una aplicación.

Es preferible utilizar datos ficticios, sintéticos o adecuadamente anonimizados.

### 5. ¿Por qué una copia utilizada para desarrollo también puede representar un riesgo de privacidad?

Porque sigue conteniendo información que podría ser consultada, compartida o filtrada accidentalmente. Además, las copias aumentan la cantidad de lugares donde se almacena información personal.

### 6. ¿Por qué la retención debe formar parte del ciclo de vida de los datos?

Porque es importante establecer durante cuánto tiempo se necesita conservar la información y qué sucederá cuando deje de ser necesaria.

Esto ayuda a evitar el almacenamiento indefinido de datos y reduce los riesgos de privacidad.

### 7. ¿Qué relación existe entre privacidad por diseño y diseño de bases de datos?

La privacidad por diseño consiste en considerar la protección de los datos desde que se desarrolla un sistema.

Al diseñar una base de datos, debemos preguntarnos qué información realmente necesitamos, quién podrá acceder a ella y cómo se protegerá.

### 8. ¿Qué controles técnicos implementarías para reducir el riesgo de exposición de datos personales?

Implementaría roles con permisos limitados, vistas que muestren solamente los datos necesarios, cifrado, conexiones seguras y registros de auditoría.

También utilizaría información ficticia para pruebas y restringiría el acceso a las bases de datos mediante controles de red.

### 9. ¿Qué información debería conocer un DBA para responder técnicamente a una solicitud ARCO?

El DBA debería conocer qué información personal almacena la empresa, en qué tablas se encuentra, si existen copias o respaldos relacionados y qué sistemas utilizan esos datos.

También debería identificar cómo realizar una consulta, actualización o eliminación cuando la solicitud haya sido validada y autorizada por las áreas correspondientes.

### 10. ¿Qué responsabilidades deberían corresponder al DBA, al responsable de privacidad, al área jurídica y al propietario de los datos?

**DBA:** Administrar la base de datos e implementar los controles técnicos necesarios para proteger la información.

**Responsable de privacidad:** Supervisar el tratamiento adecuado de los datos personales y coordinar los procedimientos relacionados con los derechos de los titulares.

**Área jurídica:** Revisar las obligaciones legales aplicables y orientar a la organización sobre el cumplimiento de la normativa.

**Propietario de los datos:** Definir las necesidades de uso de la información y participar en las decisiones sobre su finalidad, acceso y conservación.

Estas áreas deben trabajar juntas para garantizar que la información se utilice de manera adecuada y segura.

---

## 12. Archivos del laboratorio

El laboratorio incluye los siguientes archivos SQL:

- [01-minimizacion.sql](sql/01-minimizacion.sql)
- [02-finalidad.sql](sql/02-finalidad.sql)
- [03-control-acceso.sql](sql/03-control-acceso.sql)

Y los siguientes documentos de evidencia:

- [01-inventario-datos.md](evidencias/01-inventario-datos.md)
- [05-finalidad-secundaria.md](evidencias/05-finalidad-secundaria.md)
- [08-ciclo-vida.md](evidencias/08-ciclo-vida.md)
- [10-retencion.md](evidencias/10-retencion.md)
- [11-gobierno-datos.md](evidencias/11-gobierno-datos.md)
- [12-privacidad-diseno.md](evidencias/12-privacidad-diseno.md)
- [14-evaluacion-integral.md](evidencias/14-evaluacion-integral.md)
- [15-arquitectura.md](evidencias/15-arquitectura.md)