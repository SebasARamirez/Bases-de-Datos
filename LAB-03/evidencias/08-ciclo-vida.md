# Actividad 8 — Derecho de cancelación y ciclo de vida de los datos

## Objetivo

Comprender por qué eliminar un registro de una base de datos no garantiza que toda la información personal de un cliente haya desaparecido.

## Procedimiento

Se analizó el caso de un cliente que solicita la cancelación de sus datos personales. Antes de realizar cualquier eliminación, se identificaron los lugares donde podrían existir copias de su información y los aspectos que la empresa debería revisar.

## Resultado — Mapa del ciclo de vida de los datos

**Tabla principal: `clientes`**

- **Tablas relacionadas:** pueden almacenar copias o información vinculada al cliente.
- **Respaldos:** pueden conservar versiones anteriores de los datos.
- **Réplicas:** pueden contener información que se copió desde la base principal.
- **Registros de auditoría:** pueden guardar información sobre operaciones realizadas.
- **Reportes:** pueden incluir información personal obtenida anteriormente.
- **Copias para analítica:** pueden conservar datos utilizados para estadísticas.
- **Exportaciones:** pueden existir archivos CSV, Excel u otros documentos con información del cliente.
- **Sistemas externos:** pueden almacenar datos compartidos con otros servicios.

Estas ubicaciones representan posibles lugares donde podrían encontrarse los datos. No significa que todas existan actualmente en nuestra base de datos del laboratorio.

## Pregunta

**¿Por qué eliminar un registro de una tabla no necesariamente significa que toda la información relacionada con esa persona haya desaparecido de la organización?**

Porque la información de una persona puede estar almacenada en diferentes lugares, no solamente en la tabla principal. Por ejemplo, aunque eliminemos un cliente de PostgreSQL, sus datos podrían seguir apareciendo en respaldos, reportes, archivos exportados o sistemas externos.

Por eso, antes de eliminar información, la empresa debe revisar dónde se encuentra almacenada y determinar qué copias pueden eliminarse, cuáles deben actualizarse y cuáles necesitan conservarse temporalmente por alguna obligación aplicable.

## Análisis

La cancelación de datos personales requiere considerar todo el ciclo de vida de la información.

Por ejemplo, en nuestro laboratorio creamos la tabla `clientes_soporte`, que contiene una copia de algunos datos de `clientes`. Si elimináramos un registro de la tabla original, no desaparecería automáticamente de `clientes_soporte`.

De hecho, en la Actividad 7 actualizamos el correo de Ana López en `clientes`, pero la copia almacenada en `clientes_soporte` conserva el correo anterior. Esto demuestra la importancia de identificar todas las ubicaciones de la información.

También es necesario revisar los respaldos y otros sistemas, y coordinar las decisiones de eliminación con las áreas responsables de privacidad y cumplimiento.

## Conclusión

Esta actividad me permitió comprender que eliminar datos personales no siempre es tan sencillo como ejecutar un comando DELETE.

Antes de hacerlo, es necesario revisar las copias y los sistemas relacionados para evitar que la información siga utilizándose cuando ya no corresponda. También es importante respetar las obligaciones de conservación que puedan existir.