# Actividad 12 — Privacidad por diseño

## Objetivo

Analizar el diseño de una tabla de clientes para identificar datos personales innecesarios y proponer mejoras que permitan proteger la privacidad desde el desarrollo de una aplicación.

## Procedimiento

Se revisó la estructura de una tabla propuesta para registrar clientes. Después se identificaron los datos que podrían ser innecesarios, los que necesitan una justificación y las medidas que ayudarían a proteger la información.

## Resultado — Preguntas y respuestas

**1. ¿Qué problemas identificas?**

El principal problema es que se pretende guardar demasiada información personal sin explicar para qué se necesita.

Por ejemplo, datos como el salario, la ocupación o el estado civil no parecen necesarios para registrar a un cliente.

Esto aumenta el riesgo de exposición de información y hace que la empresa tenga que proteger y administrar más datos de los que realmente necesita.

**2. ¿Qué principio de privacidad se está ignorando?**

Principalmente el principio de minimización de datos, porque se propone almacenar información sin comprobar si es necesaria para la finalidad de la aplicación.

También se está ignorando la privacidad por diseño, ya que no se consideran los riesgos de privacidad desde el momento en que se estructura la base de datos.

**3. ¿Qué preguntas realizarías antes de aprobar el diseño?**

- ¿Cuál es la finalidad de la aplicación?
- ¿Para qué se necesita cada campo?
- ¿Qué datos son indispensables para registrar clientes?
- ¿Quién tendrá acceso a la información?
- ¿Durante cuánto tiempo se conservarán los datos?
- ¿Existen obligaciones que justifiquen almacenar información adicional?
- ¿Se puede cumplir la finalidad utilizando menos información?

**4. ¿Qué datos eliminarías?**

Para una aplicación que solamente registra clientes y mantiene información básica de contacto, eliminaría inicialmente los campos `ocupacion`, `salario` y `estado_civil`, porque no existe una justificación para recopilarlos.

También evitaría guardar simultáneamente `edad` y `fecha_nacimiento` sin una necesidad específica.

La eliminación de otros campos dependería de las funciones reales de la aplicación.

**5. ¿Qué datos requerirían una justificación adicional?**

El `rfc` necesitaría justificarse mediante una finalidad como la facturación.

La `direccion` y el `codigo_postal` podrían ser necesarios si la empresa realiza entregas o necesita información fiscal.

La `fecha_nacimiento` y la `edad` requerirían una razón específica, como verificar requisitos de edad.

El `telefono` también debería justificarse si el correo electrónico ya es suficiente para contactar al cliente.

**6. ¿Cómo aplicarías privacidad por defecto?**

Configuraríamos la aplicación para solicitar únicamente los datos indispensables desde el inicio.

Los campos opcionales no serían obligatorios y el acceso a la información estaría restringido según las funciones de cada usuario.

También evitaríamos que los datos personales aparezcan en reportes o consultas generales si no son necesarios.

Además, definiríamos periodos de conservación y mecanismos para eliminar información cuando corresponda.

## Análisis

El diseño de una base de datos influye directamente en la privacidad de los usuarios.

Aunque técnicamente sea posible almacenar muchos campos, eso no significa que todos sean necesarios.

Para una aplicación básica de registro de clientes, podría bastar inicialmente con un identificador, el nombre y un medio de contacto.

Si posteriormente se necesitan datos adicionales para facturación, entregas u otros servicios, la empresa tendría que justificar esas finalidades y establecer los controles correspondientes.

La privacidad por diseño busca considerar estos aspectos antes de desarrollar el sistema, mientras que la privacidad por defecto procura que la configuración inicial limite la recopilación y exposición de datos.

## Conclusión

Esta actividad me permitió comprender que una base de datos no debería diseñarse pensando en guardar toda la información posible.

Es mejor identificar primero qué necesita realmente la aplicación y crear una estructura que respete la privacidad de los clientes.

Considero que aplicar estos principios desde el principio ayuda a reducir riesgos y evita tener que corregir problemas de privacidad cuando el sistema ya está funcionando.