
# Actividad 15 — Propuesta de arquitectura de datos protegidos

## Objetivo

Diseñar una arquitectura conceptual que permita organizar y proteger los datos personales de los clientes según la finalidad para la que son utilizados.

## Procedimiento

Se analizaron las necesidades de Comercializadora Norte S.A. de C.V. y se propuso separar la información en tres áreas principales: operación, analítica y auditoría.

También se identificaron controles para limitar el acceso, proteger los datos personales, administrar su conservación y atender las solicitudes de los clientes.

## Resultado — Arquitectura propuesta

La base de datos se organizaría de la siguiente manera:

```text
                  BASE DE DATOS
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
      OPERACIÓN      ANALÍTICA     AUDITORÍA
          |             |             |
     +----+----+        |             |
     |         |        |             |
     v         v        v             v
   Soporte  Facturación Estadísticas Registros
     |         |       agrupadas     de acceso
     v         v          |
 Nombre     Nombre        v
 Correo     RFC         Ciudad
 Teléfono   Datos       Rangos de edad
            fiscales   Cantidades
```

Esta propuesta busca que cada área consulte únicamente la información necesaria para realizar sus actividades.

### 1. Control de acceso

Se utilizarían roles de PostgreSQL para asignar permisos según las funciones de cada área.

Por ejemplo, soporte podría consultar datos de contacto, facturación tendría acceso a los datos fiscales necesarios y analítica solamente podría consultar información preparada para estadísticas.

El acceso administrativo del DBA también debería estar controlado y registrado.

### 2. Minimización de datos

Cada área recibiría solamente los datos necesarios para cumplir su finalidad.

Por ejemplo, analítica no tendría acceso a nombres, correos, teléfonos ni RFC, porque puede generar estadísticas utilizando cantidades y rangos de edad.

También se revisarían los campos que se solicitan al registrar nuevos clientes para evitar recopilar información innecesaria.

### 3. Protección de información sensible

Los datos personales y fiscales se protegerían mediante permisos restringidos, conexiones seguras y cifrado cuando corresponda.

También se evitaría utilizar información real de los clientes en ambientes de desarrollo y pruebas cuando puedan utilizarse datos ficticios o adecuadamente anonimizados.

### 4. Retención

La empresa establecería periodos de conservación de acuerdo con la finalidad de cada dato y las obligaciones aplicables.

Estos periodos se documentarían y revisarían periódicamente para evitar almacenar información indefinidamente sin justificación.

### 5. Trazabilidad

Se implementarían registros de auditoría para identificar operaciones importantes realizadas sobre los datos.

Por ejemplo, se podría registrar qué usuario modificó información de un cliente, cuándo lo hizo y qué operación realizó.

Esto permitiría investigar cambios incorrectos o accesos no autorizados.

### 6. Eliminación

Cuando un dato deje de ser necesario y no exista una obligación que justifique conservarlo, se aplicaría el procedimiento de eliminación o anonimización correspondiente.

Antes de eliminar información, se revisarían las tablas relacionadas, respaldos, réplicas, exportaciones y sistemas externos.

### 7. Atención de solicitudes

La arquitectura también debería facilitar la atención de los derechos ARCO.

- Acceso: localizar los datos personales del cliente.
- Rectificación: corregir información incorrecta.
- Cancelación: identificar los datos y copias que deban eliminarse cuando proceda.
- Oposición: impedir determinados usos de la información cuando corresponda.

Las solicitudes deberían ser revisadas por las áreas responsables de privacidad antes de que el DBA implemente los cambios técnicos.

## Análisis

Esta arquitectura permitiría separar la información de acuerdo con las necesidades de cada departamento.

Por ejemplo, el área de soporte no necesitaría consultar los datos fiscales, mientras que analítica podría obtener estadísticas sin recibir la tabla completa de clientes.

Además, incorporar auditoría, retención y procedimientos para solicitudes ARCO ayudaría a mejorar el control del ciclo de vida de los datos personales.

Es importante mencionar que esta arquitectura es una propuesta conceptual. No se implementaron físicamente todas estas áreas ni sus controles durante el laboratorio.

## Conclusión

Esta actividad me permitió comprender que la privacidad debe considerarse desde el diseño de una base de datos y no solamente después de almacenar la información.

Considero que separar los datos según su finalidad, limitar los permisos y establecer procedimientos de conservación y eliminación puede ayudar a reducir riesgos.

También aprendí que el DBA debe colaborar con otras áreas para mantener una administración responsable de los datos personales.
