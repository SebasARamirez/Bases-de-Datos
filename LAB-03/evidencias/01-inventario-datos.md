# Actividad 1 — Inventario y finalidad de los datos

## Objetivo

Identificar los datos personales que almacena la empresa ficticia Comercializadora Norte S.A. de C.V., analizar para qué se utilizan y determinar quién debería tener acceso a ellos.

## Procedimiento

Se revisaron los nueve campos de la tabla `clientes` creada en PostgreSQL. Después se analizó la finalidad de cada dato, si realmente es necesario, quién debería poder consultarlo y cuánto tiempo debería conservarse.

## Resultado: Inventario de datos

| Campo | ¿Es dato personal? | Finalidad | ¿Es necesario? | Nivel de acceso | Retención |
|---|---|---|---|---|---|
| id | Sí, indirecto | Identificar cada registro | Sí | Personal autorizado | Mientras se necesite para relacionar registros |
| nombre | Sí | Identificar y atender al cliente | Sí | Soporte y facturación | Según la finalidad y obligaciones aplicables |
| correo | Sí | Contactar al cliente | Sí | Soporte | Mientras sea necesario para contacto |
| telefono | Sí | Comunicarse con el cliente | Depende | Soporte | Mientras se justifique su uso |
| rfc | Sí | Realizar facturación | Sí, cuando se requiera facturar | Facturación | Según obligaciones fiscales aplicables |
| edad | Sí, asociada al cliente | Generar estadísticas | Solo si se justifica | Analítica, preferentemente agrupada | Mientras sea necesaria para análisis |
| ciudad | Sí, asociada al cliente | Analizar ubicación de clientes | Depende | Analítica, preferentemente agregada | Mientras se justifique su uso |
| codigo_postal | Sí, asociado al cliente | Facturación y análisis regional | Depende | Facturación y analítica limitada | Según finalidad y obligaciones aplicables |
| fecha_alta | Sí, asociada al cliente | Conocer la fecha de registro | Sí | Personal autorizado | Según necesidades operativas y legales |

## Justificación de las decisiones

**1. id:** Es necesario porque permite identificar cada registro y relacionarlo con otras tablas. Aunque no contiene directamente el nombre de una persona, puede vincularse con sus datos personales.

**2. nombre:** Permite identificar correctamente al cliente cuando necesita atención o cuando se realiza una factura.

**3. correo:** Sirve para comunicarse con el cliente. Sin embargo, solamente deberían consultarlo los empleados que realmente lo necesiten.

**4. telefono:** Puede facilitar la comunicación con el cliente, aunque no siempre es indispensable si ya existe otro medio de contacto.

**5. rfc:** Es importante para realizar facturas cuando sea necesario. No debería estar disponible para todas las áreas, porque contiene información fiscal.

**6. edad:** Puede servir para obtener estadísticas sobre los clientes, pero no es necesaria para brindar atención. Para analítica sería mejor utilizar rangos de edad.

**7. ciudad:** Permite conocer de qué ciudades provienen los clientes. Para realizar estadísticas, generalmente no hace falta identificar individualmente a las personas.

**8. codigo_postal:** Puede ser necesario para la facturación o para obtener estadísticas por región. Sin embargo, no todas las áreas necesitan conocerlo completo.

**9. fecha_alta:** Permite conocer cuándo se registró un cliente y puede ayudar a administrar sus registros y determinar periodos de conservación.

## Análisis

Al revisar los datos, podemos observar que no todas las áreas de la empresa necesitan consultar la misma información.

Por ejemplo, atención al cliente necesita datos de contacto, mientras que facturación requiere información fiscal. En cambio, el área de analítica puede trabajar con estadísticas sin conocer nombres, correos o teléfonos.

También es importante que la empresa defina cuánto tiempo conservará cada dato, evitando almacenar información indefinidamente sin una justificación.

Los periodos de retención propuestos son orientativos y deberán definirse considerando las finalidades y obligaciones legales correspondientes.

## Conclusión

Esta actividad me permitió comprender que no se trata solamente de almacenar datos, sino también de saber por qué se necesitan y quién debería utilizarlos.

Considero que aplicar la minimización de datos y limitar los permisos de acceso ayuda a proteger la privacidad de los clientes y a reducir riesgos relacionados con el uso innecesario de su información.