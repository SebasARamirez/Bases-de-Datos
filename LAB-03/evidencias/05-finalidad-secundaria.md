# Actividad 5 — Análisis de una finalidad secundaria

## Objetivo

Analizar si una empresa puede utilizar los datos de sus clientes para enviar promociones personalizadas y determinar qué medidas de privacidad debería aplicar antes de hacerlo.

## Procedimiento

Se analizó el caso de Comercializadora Norte S.A. de C.V., que quiere utilizar la edad, ciudad y comportamiento de compra de sus clientes para enviar promociones. Se revisó qué información sería necesaria y cuáles serían los principales riesgos de utilizar los datos para una finalidad diferente.

## Resultado — Preguntas y respuestas

**1. ¿El hecho de que la organización ya tenga los datos significa automáticamente que puede utilizarlos para cualquier finalidad?**

No. Aunque la empresa ya tenga los datos, eso no significa que pueda utilizarlos para cualquier cosa. Primero debe comprobar que la nueva finalidad esté permitida, que se haya informado adecuadamente al cliente y que exista una justificación válida para utilizar su información.

**2. ¿Qué preguntas debería realizar la organización antes de implementar este tratamiento?**

La empresa debería preguntarse para qué quiere utilizar los datos, si realmente necesita toda esa información, si los clientes fueron informados sobre las promociones, qué fundamento permite ese uso y cómo podrán oponerse cuando corresponda. También debería revisar quién tendrá acceso a la información y cuánto tiempo será necesario conservarla.

**3. ¿Qué datos serían realmente necesarios?**

Podrían necesitarse el correo electrónico para enviar promociones, la ciudad y un rango de edad si son relevantes para personalizar las ofertas. También podría utilizarse información sobre compras anteriores cuando exista una justificación válida.

No sería necesario proporcionar al área de marketing datos como el RFC o toda la información personal del cliente. Además, si se necesita analizar el comportamiento de compra, primero habría que justificar y definir cómo se obtendrán esos datos.

**4. ¿Necesitaría el área de marketing acceso directo a clientes?**

No necesariamente. Sería mejor proporcionar una vista o un conjunto de datos que incluya únicamente la información necesaria para las promociones. Así se evita que el personal de marketing tenga acceso a datos personales que no necesita.

**5. ¿Qué controles técnicos podrían limitar la información entregada?**

Se podrían utilizar vistas de PostgreSQL para mostrar solamente ciertos campos, roles con permisos limitados, consultas que agrupen información por rangos de edad y controles que excluyan a los clientes que no deban recibir promociones.

También sería conveniente registrar los accesos a los datos y proteger la información mediante mecanismos de seguridad adecuados.

## Análisis

En este caso, el principal riesgo es utilizar información personal para una finalidad diferente de aquella para la que fue recopilada.

Aunque las promociones pueden beneficiar a la empresa, eso no significa que deba utilizar todos los datos de sus clientes. Es importante comprobar que el tratamiento esté permitido, limitar la información utilizada y respetar las decisiones de los titulares.

También debe considerarse que nuestra tabla actual `clientes` no contiene información sobre compras, por lo que sería necesario analizar y justificar su obtención antes de utilizarla.

## Conclusión

Esta actividad me ayudó a comprender que tener información almacenada no significa que podamos utilizarla para cualquier propósito. Antes de aprovechar los datos para nuevas actividades, la empresa debe justificar su uso y aplicar medidas que protejan la privacidad de los clientes.S