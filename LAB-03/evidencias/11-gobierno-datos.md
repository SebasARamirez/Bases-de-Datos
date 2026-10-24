# Actividad 11 — Matriz de gobierno de datos

## Objetivo

Diseñar una matriz que permita identificar para qué se utilizan los datos personales de los clientes, quién es responsable de ellos, qué usuarios pueden acceder y qué medidas deben aplicarse para protegerlos.

## Procedimiento

Se revisaron los principales campos de la tabla `clientes` de Comercializadora Norte S.A. de C.V.

Después se asignaron finalidades, responsables, usuarios autorizados, medidas de protección y criterios de conservación para cada dato.

## Resultado — Matriz de gobierno de datos

| Dato | Finalidad | Responsable | Usuarios autorizados | Protección | Retención | Acción al finalizar |
|---|---|---|---|---|---|---|
| nombre | Identificar y atender al cliente | Atención al cliente | Soporte y facturación | Roles y permisos limitados | Mientras exista una finalidad válida y obligaciones aplicables | Eliminar o anonimizar cuando proceda |
| correo | Mantener comunicación con el cliente | Atención al cliente | Soporte y personal autorizado | Permisos de lectura limitados | Mientras sea necesario para el contacto | Eliminar o dejar de utilizar para esa finalidad |
| telefono | Contactar al cliente cuando sea necesario | Atención al cliente | Soporte autorizado | Acceso restringido | Mientras se justifique su uso | Eliminar cuando ya no sea necesario |
| rfc | Realizar facturación | Facturación | Personal de facturación autorizado | Acceso restringido y cifrado cuando corresponda | Según las obligaciones fiscales aplicables | Eliminar de forma segura cuando proceda |
| edad | Generar estadísticas por rangos | Dirección / Analítica | Analistas con acceso a información agrupada | Agrupación por rangos y vistas limitadas | Mientras sea necesaria para el análisis | Eliminar o conservar únicamente estadísticas adecuadamente anonimizadas |
| ciudad | Elaborar estadísticas por ubicación | Dirección / Analítica | Analistas autorizados | Consultas agregadas y permisos limitados | Mientras se justifique la finalidad | Eliminar o anonimizar cuando corresponda |
| codigo_postal | Facturación y análisis regional | Facturación / Dirección | Facturación y analistas con información limitada | Restricción de acceso y generalización por región | Según la finalidad y obligaciones aplicables | Eliminar o conservar solamente información regional anonimizada |

## Análisis

Esta matriz muestra que no todos los empleados necesitan consultar los mismos datos.

Por ejemplo, el área de atención al cliente necesita información de contacto, pero normalmente no requiere conocer el RFC. En cambio, facturación puede necesitar información fiscal, pero no tiene por qué consultar las estadísticas de edad de los clientes.

El área de analítica puede trabajar con información agrupada por ciudad o rangos de edad sin recibir nombres, correos o teléfonos.

También es importante distinguir entre los responsables funcionales de los datos y el DBA. Las áreas responsables deben participar en las decisiones sobre el uso de la información, mientras que el DBA se encarga de implementar y mantener los controles técnicos.

Los periodos de retención incluidos son propuestas generales. La organización tendría que definir los plazos concretos considerando sus finalidades y obligaciones legales.

## Conclusión

Esta actividad me permitió comprender que el gobierno de datos consiste en organizar las responsabilidades y establecer reglas sobre el uso de la información.

Considero que definir quién puede consultar cada dato, para qué se utiliza y cuándo debe eliminarse ayuda a proteger la privacidad de los clientes y facilita la administración de la base de datos.