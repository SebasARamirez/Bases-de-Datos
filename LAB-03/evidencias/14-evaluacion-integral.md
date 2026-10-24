# Actividad 14 — Evaluación integral de riesgos

## Objetivo

Identificar problemas relacionados con la privacidad y protección de datos personales en una empresa, y proponer controles que ayuden a reducir los riesgos encontrados.

## Procedimiento

Se analizó el escenario de una empresa que almacena información de 50,000 clientes. Se revisaron los accesos a la base de datos, la conservación de información, las copias utilizadas para desarrollo y el uso de datos para promociones.

A partir de esta información se identificaron 12 problemas o riesgos y se propusieron medidas para mejorar la protección de los datos personales.

## Resultado — Matriz de evaluación integral

| Problema | Principio afectado | Riesgo | Control propuesto |
|---|---|---|---|
| 1. Todos los analistas pueden consultar directamente la tabla clientes. | Mínimo privilegio | Acceso a información que no necesitan para sus funciones. | Crear roles y vistas con permisos limitados. |
| 2. Analítica puede consultar nombres, correos y teléfonos aunque solamente genera estadísticas. | Minimización de datos | Exposición innecesaria de información personal. | Proporcionar consultas agregadas sin identificadores directos. |
| 3. La información del RFC también está disponible para los analistas. | Confidencialidad y limitación de finalidad | Uso o divulgación indebida de información fiscal. | Restringir el RFC al personal autorizado de facturación. |
| 4. Existen datos conservados desde hace 12 años sin una justificación documentada. | Limitación de conservación | Mantener información que posiblemente ya no sea necesaria. | Revisar la antigüedad y finalidad de los registros para establecer periodos de conservación justificados. |
| 5. No existe una política documentada de retención. | Gobierno de datos | Dificultad para decidir cuándo conservar o eliminar información. | Elaborar una política de retención con responsables y criterios definidos. |
| 6. Los desarrolladores reciben copias completas de la base de datos. | Minimización y control de acceso | Exposición de información innecesaria en ambientes de desarrollo. | Entregar únicamente los datos necesarios para las pruebas. |
| 7. Las copias de desarrollo contienen información personal real. | Privacidad por diseño | Filtración o uso indebido de datos reales durante las pruebas. | Utilizar información ficticia, sintética o adecuadamente anonimizada. |
| 8. Las copias utilizadas en desarrollo aumentan los lugares donde se almacena información personal. | Ciclo de vida de los datos | Dificultad para controlar todas las copias y eliminarlas cuando corresponda. | Mantener un inventario de copias y definir procedimientos de eliminación. |
| 9. Marketing utiliza correos electrónicos para campañas promocionales sin una finalidad claramente documentada. | Limitación de finalidad | Utilizar información para promociones sin haber verificado las condiciones que permiten ese tratamiento. | Revisar la finalidad, el aviso de privacidad y el fundamento aplicable antes de realizar campañas. |
| 10. No existe documentación clara sobre la finalidad de cada dato. | Transparencia y gobierno de datos | Uso de información sin conocer qué actividades justifican su almacenamiento. | Crear un inventario que indique la finalidad y el responsable de cada campo. |
| 11. El acceso directo a la tabla completa puede dificultar el control de qué información utiliza cada área. | Control de acceso y responsabilidad | Consultas o usos de datos fuera de las funciones autorizadas. | Separar la información mediante vistas, roles y permisos relacionados con cada finalidad. |
| 12. Las copias de producción utilizadas en pruebas pueden complicar la atención de solicitudes ARCO. | Derechos de los titulares y ciclo de vida | Que una rectificación o cancelación no se refleje en todas las copias existentes. | Identificar los sistemas y copias relacionados con cada cliente y establecer procedimientos para atender las solicitudes. |

## Análisis

El escenario presenta varios problemas porque la empresa almacena una gran cantidad de información personal sin tener claramente documentado cómo debe utilizarla y conservarla.

Uno de los principales riesgos es que todos los analistas pueden consultar directamente la tabla de clientes, aunque solamente necesitan generar estadísticas mensuales. Esto significa que tienen acceso a datos que no son indispensables para su trabajo.

Otro problema importante son las copias completas de la base de datos utilizadas por los desarrolladores. Para realizar pruebas normalmente no es necesario trabajar con información real de los clientes, ya que podrían utilizarse datos ficticios o adecuadamente anonimizados.

También resulta preocupante que se conserven registros desde hace 12 años sin una política de retención. Esto no significa automáticamente que conservarlos sea ilegal, pero la empresa debe justificar por qué necesita mantenerlos y durante cuánto tiempo.

Finalmente, el uso de los correos electrónicos para promociones requiere revisar si esa finalidad está informada y permitida. Tener los datos almacenados no significa que puedan utilizarse libremente.

## Conclusión

Esta actividad me permitió comprender que proteger una base de datos no consiste solamente en utilizar contraseñas o configurar permisos.

También es necesario controlar quién utiliza la información, para qué la necesita, durante cuánto tiempo se conserva y qué sucede con las copias de los datos.

Considero que aplicar medidas como el mínimo privilegio, la minimización, las políticas de retención y el uso de datos ficticios para pruebas ayudaría a reducir los riesgos encontrados.

Además, es importante que el DBA trabaje junto con las áreas responsables de privacidad y cumplimiento para aplicar correctamente estas medidas.