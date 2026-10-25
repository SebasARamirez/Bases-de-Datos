
# LAB-04 — Informe de hardening de PostgreSQL

## Preguntas de las actividades

### Actividad 1 — Identificar la superficie de ataque

**¿Por qué conocer la superficie de ataque debe preceder al hardening?**

Porque antes de modificar la seguridad del servidor necesitamos identificar qué servicios, puertos, conexiones, usuarios y configuraciones están disponibles. Así podemos detectar riesgos y decidir qué elementos debemos restringir, evitando cambios innecesarios que podrían afectar el funcionamiento de PostgreSQL.

### Actividad 2 — Identificar los archivos de configuración

**¿Por qué es importante conocer la ubicación física de estos archivos?**

Porque estos archivos contienen configuraciones importantes para el funcionamiento y la seguridad de PostgreSQL. Conocer su ubicación permite revisarlos, protegerlos mediante permisos del sistema operativo y realizar respaldos antes de aplicar cambios.

Además, facilita identificar posibles problemas de seguridad y recuperar la configuración si ocurre algún error.


### Actividad 3 — Revisar listen_addresses

**Configuración encontrada:**

El parámetro `listen_addresses` tiene el valor `*`, lo que significa que PostgreSQL está configurado para escuchar en todas las interfaces de red disponibles.

**Interfaces necesarias:**

Para las actividades actuales del laboratorio solamente necesitamos conexiones locales mediante `localhost` (127.0.0.1 y ::1), ya que estamos trabajando con pgAdmin en nuestra propia computadora.

**Interfaces innecesarias:**

Las interfaces de red externas o privadas que no se utilizan para acceder al servidor durante el laboratorio.

Antes de restringirlas, sería necesario confirmar que ninguna otra aplicación o usuario necesita conectarse remotamente.

**¿Qué arquitectura reduce mejor la exposición y por qué?**

La segunda arquitectura, donde PostgreSQL se encuentra dentro de una red privada y no está expuesto directamente a Internet.

Esta arquitectura reduce la superficie de ataque porque limita los equipos que pueden intentar conectarse al servidor.

Además, permite aplicar controles adicionales mediante el firewall y las reglas de autenticación de PostgreSQL.

**Análisis:**

La configuración actual `listen_addresses = '*'` puede representar una exposición innecesaria para nuestro laboratorio, ya que solamente hemos observado conexiones locales.

Una configuración más restrictiva, como `localhost`, sería más adecuada si confirmamos que no se necesitan conexiones remotas.

Sin embargo, escuchar en todas las interfaces no significa automáticamente que el servidor sea accesible desde Internet, porque también intervienen las reglas de pg_hba.conf y el firewall.

**Conclusión:**

Aprendí que limitar las interfaces de escucha ayuda a reducir la superficie de ataque de PostgreSQL. Antes de modificar esta configuración, es importante conocer las necesidades reales de conexión para no afectar otros sistemas.


### Actividad 4 — Revisar pg_hba.conf

**Objetivo:**

Revisar las reglas de autenticación configuradas en PostgreSQL e identificar posibles accesos demasiado permisivos.

**Procedimiento:**

Se consultó la vista `pg_hba_file_rules` para identificar los tipos de conexión, bases de datos, usuarios, direcciones de origen y métodos de autenticación.

**Resultados:**

Se encontraron seis reglas de autenticación.

Las reglas para conexiones de tipo `host` permiten conexiones desde las direcciones locales `127.0.0.1` y `::1`.

También se encontraron reglas específicas para conexiones de replicación.

Todas las reglas utilizan el método de autenticación `scram-sha-256`.

No se encontraron reglas con direcciones demasiado amplias, como `0.0.0.0/0` o `::/0`, ni reglas con el método `trust`.

La columna `error` no mostró errores en las reglas consultadas.

**Análisis:**

La configuración encontrada es relativamente restrictiva, porque las reglas de conexiones de red están limitadas a direcciones locales.

Aunque el servidor tiene configurado `listen_addresses = '*'`, las reglas de autenticación no autorizan conexiones desde cualquier dirección.

Esto demuestra que las interfaces de escucha y las reglas de autenticación cumplen funciones diferentes y deben revisarse por separado.

**Conclusión:**

Aprendí que el archivo `pg_hba.conf` permite controlar qué conexiones pueden autenticarse en PostgreSQL.

En nuestro caso, las reglas actuales utilizan un método de autenticación adecuado y no muestran rangos de red excesivamente amplios.

Por el momento no fue necesario modificar este archivo, aunque todavía debemos revisar otros controles de seguridad del servidor.


### Actividad 5 — Analizar una regla permisiva

**Objetivo:**

Analizar los riesgos de una regla de autenticación demasiado permisiva y proponer una configuración más restrictiva.

**Regla analizada:**

host    all    all    0.0.0.0/0    scram-sha-256

**1. ¿Qué bases de datos permite?**

Se aplica a todas las bases de datos del servidor PostgreSQL, porque utiliza `all` en el campo correspondiente.

**2. ¿Qué usuarios permite?**

Se aplica a todos los usuarios de PostgreSQL, porque también utiliza `all` en el campo de usuarios.

**3. ¿Qué direcciones de origen permite?**

La dirección `0.0.0.0/0` abarca cualquier dirección IPv4.

Esto no significa que cualquier persona pueda conectarse automáticamente, porque todavía necesita autenticarse y superar los controles de red.

**4. ¿Qué método de autenticación utiliza?**

Utiliza `scram-sha-256`, un método de autenticación basado en contraseñas.

**5. ¿Por qué puede representar una exposición innecesaria?**

Porque no limita las conexiones a una base de datos, un usuario o una red específica.

Esto aumenta la cantidad de orígenes desde los que podrían intentarse conexiones al servidor.

**6. ¿Qué información necesitarías para restringirla?**

Necesitaríamos identificar qué aplicaciones y usuarios requieren acceso, a qué bases de datos deben conectarse y desde qué direcciones IP.

También sería necesario conocer si existen conexiones remotas indispensables.

**Documentación de la regla:**

- Regla actual analizada: host all all 0.0.0.0/0 scram-sha-256
- Problema: permite intentos de autenticación desde cualquier dirección IPv4 para todos los usuarios y bases de datos.
- Origen que realmente necesita acceso: localhost (127.0.0.1), para el escenario local del laboratorio.
- Base de datos: lab04_hardening.
- Usuario: app_lab04 (cuenta de aplicación propuesta, todavía no creada).
- Regla propuesta: host lab04_hardening app_lab04 127.0.0.1/32 scram-sha-256

**Análisis:**

La regla propuesta es más específica porque limita la conexión a una base de datos, un usuario y una dirección de origen.

En nuestro servidor real no encontramos la regla permisiva del ejemplo. Las reglas actuales de pg_hba.conf ya están restringidas a conexiones locales y utilizan scram-sha-256.

Por lo tanto, esta actividad se realizó como un análisis conceptual y no se modificó el archivo de configuración.

**Conclusión:**

Aprendí que utilizar un método de autenticación seguro no es suficiente cuando las reglas permiten conexiones desde redes demasiado amplias.

Para reducir la superficie de ataque es importante restringir las bases de datos, los usuarios y los orígenes autorizados según las necesidades reales del sistema.


### Actividad 6 — Aplicar mínimo privilegio a conexiones

**Objetivo:**

Diseñar una regla de autenticación más específica para reducir la superficie de exposición de PostgreSQL.

**Regla propuesta:**

host lab04_hardening app_lab04 127.0.0.1/32 scram-sha-256

**Base de datos autorizada:**

lab04_hardening.

**Usuario autorizado:**

app_lab04, una cuenta de aplicación propuesta para este ejercicio.

**Origen autorizado:**

127.0.0.1/32, que representa la dirección local IPv4 de nuestra computadora.

**Método de autenticación:**

scram-sha-256.

**Análisis:**

La regla aplica el principio de mínimo privilegio porque limita las conexiones a una base de datos, un usuario y una dirección de origen específicos.

A diferencia de una regla que utiliza all/all y 0.0.0.0/0, esta propuesta no permite intentar autenticarse desde cualquier dirección IPv4 ni para cualquier usuario.

En nuestro entorno también se utiliza la dirección local IPv6 ::1, por lo que sería necesario considerar una regla equivalente con ::1/128 si la aplicación necesitara conectarse mediante IPv6.

**Consideraciones para su implementación:**

Antes de aplicar esta regla sería necesario crear la cuenta app_lab04, configurar sus permisos y comprobar que solamente pueda realizar las operaciones necesarias.

También tendríamos que revisar el orden de las reglas de pg_hba.conf, porque PostgreSQL utiliza la primera regla que coincide con una conexión. Agregar una regla específica después de otra más general no garantiza que se aplique la restricción deseada.

**Resultado:**

Se diseñó una regla de autenticación más restrictiva, adaptada a la base de datos lab04_hardening.

La regla no se aplicó al servidor, ya que esta actividad se realizó como una propuesta conceptual.

**Conclusión:**

Aprendí que aplicar mínimo privilegio a las conexiones consiste en permitir únicamente los usuarios, bases de datos y orígenes necesarios.

Esto ayuda a reducir la superficie de ataque y evita mantener permisos de conexión demasiado amplios.


### Actividad 7 — Revisar autenticación

**Objetivo:**

Verificar el mecanismo de almacenamiento de contraseñas en PostgreSQL y comprender su importancia para la seguridad.

**Procedimiento:**

Se ejecutó la instrucción SHOW password_encryption para revisar la configuración actual del servidor.

**Resultado:**

El parámetro password_encryption tiene el valor scram-sha-256.

Este mecanismo permite almacenar verificadores de contraseñas de forma segura y es preferible a métodos antiguos como md5.

**1. ¿Qué diferencia existe entre autenticación y autorización?**

La autenticación verifica la identidad de un usuario, por ejemplo, mediante una contraseña.

La autorización determina qué operaciones puede realizar ese usuario después de autenticarse, como consultar, insertar, modificar o eliminar información.

**2. ¿Qué protege scram-sha-256?**

Protege el proceso de autenticación mediante contraseñas, evitando que PostgreSQL necesite almacenar las contraseñas originales en texto plano.

También permite comprobar la identidad del usuario mediante un mecanismo de desafío y respuesta, sin enviar directamente su contraseña al servidor.

Sin embargo, no sustituye el cifrado TLS ni protege por sí solo toda la información transmitida durante una conexión.

**3. ¿Por qué una contraseña almacenada mediante un mecanismo de autenticación no debe confundirse con cifrado reversible?**

Porque PostgreSQL almacena un verificador derivado de la contraseña, no una versión cifrada que pueda descifrarse para recuperar la contraseña original.

El cifrado reversible permite recuperar la información mediante una clave, mientras que los mecanismos utilizados para almacenar contraseñas están diseñados para verificar su validez sin necesitar recuperar el texto original.

**4. ¿Qué sucede si una cuenta tiene permisos excesivos aunque utilice una contraseña fuerte?**

Aunque tenga una contraseña fuerte, la cuenta podría representar un riesgo si alguien consigue utilizarla.

Por ejemplo, si una aplicación utiliza una cuenta con privilegios administrativos y esa cuenta es comprometida, el atacante podría realizar operaciones que la aplicación normalmente no necesita.

Por eso también debemos aplicar el principio de mínimo privilegio.

**Análisis:**

La configuración actual utiliza scram-sha-256 para almacenar nuevas contraseñas, lo cual representa una medida adecuada de seguridad.

Sin embargo, proteger la autenticación no es suficiente. También es necesario revisar los privilegios, las reglas de acceso y la seguridad de las conexiones.

**Conclusión:**

Aprendí que la autenticación y la autorización cumplen funciones diferentes. Una contraseña segura ayuda a proteger el acceso a PostgreSQL, pero los permisos deben limitarse para evitar que una cuenta realice operaciones innecesarias.


### Actividad 8 — Revisar usuarios y privilegios

**Objetivo:**

Identificar los roles existentes en PostgreSQL y revisar cuáles tienen permisos administrativos o capacidad de iniciar sesión.

**Procedimiento:**

Se consultó la vista pg_roles para obtener información sobre los roles, sus privilegios y sus capacidades de conexión.

**Resultados:**

Se encontraron 16 roles en el servidor PostgreSQL.

| Rol | LOGIN | SUPERUSER | CREATEROLE | CREATEDB | Función |
|---|---|---|---|---|---|
| postgres | Sí | Sí | Sí | Sí | Administración del servidor |
| analista | No | No | No | No | Rol de consulta del LAB-03 |
| Roles internos pg_* | No | No | No | No | Funciones internas y privilegios predefinidos |

El único rol con capacidad de iniciar sesión que se identificó fue postgres.

También se encontró el rol analista, creado anteriormente para limitar el acceso a información de clientes.

Los demás roles corresponden a funciones internas o privilegios predefinidos de PostgreSQL.

No se identificaron cuentas independientes para aplicaciones en esta consulta.

**¿Por qué no debería utilizarse una cuenta SUPERUSER como cuenta normal de una aplicación?**

Porque una cuenta SUPERUSER tiene prácticamente control total sobre el servidor PostgreSQL.

Si una aplicación utiliza una cuenta administrativa y sufre un ataque, el atacante podría aprovechar esos privilegios para consultar, modificar o eliminar información de otras bases de datos.

Por eso es recomendable que las aplicaciones utilicen cuentas independientes, con acceso solamente a los recursos y operaciones que necesitan.

**Análisis:**

La cuenta postgres tiene los privilegios administrativos esperados para un superusuario.

Sin embargo, utilizarla para conexiones normales de aplicaciones no sería recomendable.

El rol analista no tiene permisos administrativos ni capacidad de iniciar sesión, lo cual es adecuado para su función como rol de permisos.

Esta consulta muestra los atributos generales de los roles, pero no permite conocer por sí sola todos los privilegios concedidos mediante pertenencia a otros roles.

**Conclusión:**

Aprendí que revisar los roles permite identificar cuentas con privilegios elevados y posibles riesgos de seguridad.

También comprendí que las aplicaciones deberían utilizar cuentas con permisos limitados, en lugar de conectarse como superusuario.


### Actividad 9 — Separar cuentas administrativas y de aplicación

**Objetivo:**

Diseñar una separación de cuentas para evitar que las aplicaciones y los usuarios de consulta tengan privilegios administrativos innecesarios.

**Procedimiento:**

Se analizaron tres tipos de cuentas para PostgreSQL: una administrativa, una de aplicación y una de consulta.

Se definió el propósito de cada cuenta y los privilegios que debería tener.

**Propuesta de cuentas:**

| Cuenta | Propósito | LOGIN | Privilegios |
|---|---|---|---|
| postgres (DBA) | Administración del servidor PostgreSQL | Sí | Administrativos |
| app_lab04 (APP) | Conexión de una aplicación a lab04_hardening | Sí | Solo operaciones necesarias para la aplicación |
| consulta_lab04 (CONSULTA) | Consultar información autorizada | Sí | SELECT sobre tablas o vistas específicas |

**Análisis:**

La cuenta DBA se utilizaría únicamente para realizar tareas administrativas, como gestionar usuarios, configurar el servidor y administrar las bases de datos.

La cuenta APP permitiría que una aplicación se conecte a PostgreSQL sin utilizar privilegios de superusuario. Sus permisos dependerían de las operaciones que realmente necesite realizar.

La cuenta CONSULTA tendría permisos de solo lectura sobre los objetos autorizados, evitando que pueda modificar o eliminar información.

En nuestro servidor ya existe la cuenta administrativa postgres. Las cuentas app_lab04 y consulta_lab04 son propuestas conceptuales y todavía no han sido creadas.

También existe el rol analista del LAB-03, pero tiene NOLOGIN y se utiliza para agrupar permisos, no para conectarse directamente.

**¿Qué riesgo existe si la aplicación se conecta utilizando una cuenta administrativa?**

Si una aplicación utiliza una cuenta con privilegios administrativos y es comprometida, un atacante podría aprovechar esos permisos para modificar o eliminar información, crear usuarios o acceder a bases de datos que no están relacionadas con la aplicación.

Además, cualquier error en el código podría tener consecuencias más graves debido a los privilegios elevados.

Por eso es importante utilizar cuentas independientes y aplicar el principio de mínimo privilegio.

**Resultado:**

Se diseñó una separación conceptual entre cuentas administrativas, de aplicación y de consulta.

No se realizaron cambios en los roles existentes de PostgreSQL.

**Conclusión:**

Aprendí que separar las cuentas según su función ayuda a reducir los riesgos de seguridad.

Una aplicación no necesita tener control total sobre PostgreSQL para funcionar correctamente, por lo que es mejor asignarle solamente los permisos necesarios.


### Actividad 10 — Revisar extensiones

**Objetivo:**

Identificar las extensiones instaladas en PostgreSQL y analizar si son necesarias para el funcionamiento de la base de datos.

**Procedimiento:**

Se ejecutó una consulta sobre `pg_extension` para obtener los nombres y versiones de las extensiones instaladas en la base de datos `lab04_hardening`.

**Resultado:**

Se encontró una sola extensión instalada:

| Extensión | Versión | Función | ¿Es necesaria? |
|---|---|---|---|
| plpgsql | 1.0 | Permite utilizar el lenguaje procedural PL/pgSQL | Sí |

**Análisis:**

La extensión plpgsql es una funcionalidad habitual de PostgreSQL que permite crear funciones y procedimientos almacenados.

No se encontraron otras extensiones instaladas en la base de datos del laboratorio.

Por lo tanto, no se identificaron extensiones adicionales que deban eliminarse.

Es importante aclarar que una extensión no representa automáticamente un problema de seguridad por estar instalada. Su necesidad debe evaluarse según las funciones de cada base de datos.

**Resultado del hardening:**

Se revisaron las extensiones instaladas y se determinó que no era necesario realizar modificaciones.

**Conclusión:**

Aprendí que revisar las extensiones permite identificar funcionalidades adicionales que podrían no ser necesarias.

El principio de hardening consiste en mantener solamente los componentes requeridos para el funcionamiento del sistema, evitando aumentar innecesariamente la superficie de ataque.


### Actividad 11 — Revisar configuración relacionada con conexiones

**Objetivo:**

Revisar los límites de conexiones y tiempos de ejecución configurados en PostgreSQL para identificar posibles riesgos de disponibilidad.

**Procedimiento:**

Se consultó la vista `pg_settings` para obtener los valores actuales de cuatro parámetros relacionados con la administración de conexiones.

**Resultados:**

| Parámetro | Valor | Unidad |
|---|---|---|
| max_connections | 100 | Conexiones |
| superuser_reserved_connections | 3 | Conexiones |
| statement_timeout | 0 | ms |
| idle_in_transaction_session_timeout | 0 | ms |

**Función de cada parámetro:**

- **max_connections:** establece la cantidad máxima de conexiones simultáneas que admite PostgreSQL.
- **superuser_reserved_connections:** reserva conexiones para superusuarios, permitiendo realizar tareas administrativas cuando el servidor está cerca de su límite de conexiones.
- **statement_timeout:** establece un tiempo máximo para la ejecución de instrucciones SQL.
- **idle_in_transaction_session_timeout:** limita cuánto tiempo puede permanecer inactiva una sesión que tiene una transacción abierta.

**¿Por qué mantener conexiones indefinidamente abiertas puede representar un problema de disponibilidad o consumo de recursos?**

Porque las conexiones consumen recursos del servidor, como memoria y procesos.

Si se mantienen demasiadas conexiones abiertas, pueden agotarse los recursos disponibles o alcanzarse el límite de conexiones permitido.

Además, una sesión inactiva que mantiene una transacción abierta puede conservar bloqueos y dificultar otras operaciones sobre la base de datos.

Por eso es recomendable establecer límites adecuados y administrar correctamente las conexiones según las necesidades del sistema.

**Análisis:**

El servidor permite hasta 100 conexiones simultáneas y reserva 3 para superusuarios.

Los parámetros statement_timeout e idle_in_transaction_session_timeout tienen el valor 0, lo que indica que no existen límites generales configurados mediante estas opciones.

Esto podría representar un riesgo si una aplicación ejecuta consultas demasiado largas o mantiene transacciones abiertas sin utilizarlas.

Antes de modificar estos parámetros sería necesario evaluar el funcionamiento de las aplicaciones y determinar tiempos adecuados para sus operaciones.

**Conclusión:**

Aprendí que administrar las conexiones de PostgreSQL también forma parte del hardening.

Establecer límites adecuados puede ayudar a proteger la disponibilidad del servidor y evitar el consumo innecesario de recursos.

Durante esta actividad solamente se revisó la configuración actual, sin realizar modificaciones.


### Actividad 12 — Revisar permisos del sistema operativo

**Objetivo:**

Revisar los permisos y propietarios de los archivos sensibles de PostgreSQL desde Windows 11.

**Procedimiento:**

Se utilizaron los comandos `icacls` y `Get-Acl` de PowerShell para revisar los permisos y propietarios del directorio de datos y de los archivos `postgresql.conf` y `pg_hba.conf`.

**Resultados:**

Se identificaron los siguientes propietarios:

| Elemento | Propietario |
|---|---|
| Carpeta data | BUILTIN\Administradores |
| postgresql.conf | Usuario Sebastián |
| pg_hba.conf | Usuario Sebastián |

También se encontraron los siguientes permisos sobre los archivos de configuración:

| Usuario o grupo | Permiso |
|---|---|
| Administradores | Control total |
| SYSTEM | Control total |
| Usuario Sebastián | Control total |
| Servicio de red | Control total |

Los permisos de los archivos aparecen como heredados de la carpeta superior.

**Análisis:**

Los archivos de configuración de PostgreSQL contienen parámetros importantes para la seguridad del servidor.

Se encontró que tanto el usuario local como varias cuentas del sistema tienen control total sobre estos archivos.

Aunque esto puede ser necesario en nuestro entorno de prácticas, en un servidor de producción sería importante revisar que solamente las cuentas autorizadas tengan acceso.

El propietario de un archivo y sus permisos son conceptos diferentes. El propietario identifica a quién pertenece el objeto, mientras que los permisos determinan las operaciones autorizadas.

**¿Por qué no es suficiente proteger PostgreSQL mediante GRANT y REVOKE si cualquier usuario del sistema operativo puede leer archivos sensibles?**

Porque GRANT y REVOKE controlan los permisos dentro de PostgreSQL, pero no sustituyen los permisos del sistema operativo.

Si un usuario de Windows tiene acceso a archivos sensibles, podría consultar información de configuración o, si tiene permisos de modificación, alterar parámetros importantes sin utilizar los permisos SQL.

Esto podría afectar la seguridad y disponibilidad del servidor.

Por eso es importante proteger tanto la base de datos como sus archivos mediante permisos adecuados del sistema operativo.

**Resultado del hardening:**

Se revisaron los permisos y propietarios de los archivos sensibles.

No se modificaron los permisos, ya que primero sería necesario comprobar qué cuentas los necesitan para el funcionamiento de PostgreSQL.

**Conclusión:**

Aprendí que la seguridad de PostgreSQL no depende únicamente de los roles y permisos de la base de datos.

También es importante proteger los archivos y directorios desde el sistema operativo para evitar accesos o modificaciones no autorizadas.


### Actividad 13 — Revisar exposición de red

**Objetivo:**

Verificar las direcciones de red y el puerto en los que PostgreSQL está escuchando.

**Procedimiento:**

Se utilizó el comando `Get-NetTCPConnection` de PowerShell para consultar las conexiones TCP en estado de escucha del puerto 5432.

**Resultados:**

| Dirección de escucha | Puerto | Estado |
|---|---|---|
| 0.0.0.0 | 5432 | Listen |
| :: | 5432 | Listen |

**¿Está expuesto fuera de la interfaz necesaria?**

PostgreSQL está escuchando en todas las interfaces IPv4 e IPv6, aunque actualmente estamos utilizando conexiones locales para el laboratorio.

Esto representa una configuración más amplia de lo necesario para nuestro uso académico.

Sin embargo, no significa automáticamente que el servidor sea accesible desde otras computadoras, porque también intervienen el firewall y las reglas de autenticación.

**Análisis:**

Los resultados coinciden con la configuración `listen_addresses = '*'` que encontramos anteriormente.

Para un entorno que solamente necesita conexiones locales, sería recomendable evaluar el uso de `localhost` en lugar de escuchar en todas las interfaces.

Antes de realizar ese cambio, debemos confirmar que ninguna otra aplicación necesita conectarse remotamente al servidor.

**Conclusión:**

Aprendí que revisar las direcciones de escucha permite conocer una parte importante de la superficie de ataque de PostgreSQL.

También comprendí que escuchar en todas las interfaces no significa necesariamente permitir conexiones desde cualquier origen, ya que existen controles adicionales como el firewall y pg_hba.conf.

Durante esta actividad solamente se revisó la configuración, sin realizar modificaciones.


### Actividad 14 — Diseñar una política de firewall

**Objetivo:**

Diseñar una política de firewall que permita únicamente las conexiones necesarias al servidor PostgreSQL.

**Procedimiento:**

Se analizó el escenario propuesto por el profesor, donde PostgreSQL utiliza la dirección IP 10.10.10.20 y el puerto 5432.

Se estableció que solamente la red de administradores 10.10.10.0/24 debería tener acceso al servidor.

**Propuesta de reglas:**

| Origen | Destino | Puerto | Acción |
|---|---|---|---|
| 10.10.10.0/24 | 10.10.10.20 | 5432 | Permitir |
| Cualquier otro origen | 10.10.10.20 | 5432 | Denegar |

**Análisis:**

La primera regla permite que los equipos pertenecientes a la red de administradores puedan establecer conexiones hacia el puerto de PostgreSQL.

La segunda regla bloquea las conexiones provenientes de otras direcciones que no están autorizadas.

Esta configuración ayuda a reducir la exposición del servidor y aplica el principio de permitir únicamente el tráfico necesario.

**¿Por qué pg_hba.conf y el firewall no son controles equivalentes?**

Porque el firewall controla el tráfico de red que puede llegar al servidor según direcciones, puertos y otras condiciones.

Por otro lado, pg_hba.conf determina qué conexiones pueden autenticarse en PostgreSQL, considerando la base de datos, el usuario, la dirección de origen y el método de autenticación.

Por lo tanto, ambos controles cumplen funciones diferentes y se complementan para mejorar la seguridad.

**Resultado:**

Se diseñó una política conceptual de firewall que permite conexiones únicamente desde una red autorizada.

No se realizaron modificaciones al firewall de Windows, ya que el objetivo de esta actividad era elaborar una propuesta.

**Conclusión:**

Aprendí que un firewall permite limitar las conexiones de red hacia PostgreSQL y reducir su superficie de ataque.

También comprendí que el firewall y pg_hba.conf deben utilizarse como controles complementarios, porque proteger solamente uno de ellos no garantiza la seguridad completa del servidor.


### Actividad 15 — Revisar TLS

**Objetivo:**

Verificar si PostgreSQL tiene habilitado SSL/TLS y determinar si la conexión actual utiliza cifrado.

**Procedimiento:**

Se ejecutaron las instrucciones `SHOW ssl` y `SHOW ssl_min_protocol_version` para revisar la configuración del servidor.

Después se consultaron las vistas `pg_stat_activity` y `pg_stat_ssl` para comprobar si la conexión actual de pgAdmin utiliza TLS.

**Resultados:**

| Parámetro | Resultado |
|---|---|
| ssl | off |
| ssl_min_protocol_version | TLSv1.2 |
| Usuario conectado | postgres |
| Dirección del cliente | ::1 |
| ¿La conexión utiliza TLS? | No (false) |
| Versión TLS utilizada | NULL |
| Cipher | NULL |

**Análisis:**

Se encontró que PostgreSQL tiene deshabilitado SSL/TLS mediante el parámetro `ssl = off`.

Aunque la configuración indica TLSv1.2 como versión mínima, esto no significa que la conexión esté cifrada, porque SSL se encuentra deshabilitado.

La consulta sobre `pg_stat_ssl` confirmó que nuestra conexión actual no utiliza TLS, ya que mostró `false` y valores NULL en las columnas de versión y algoritmo de cifrado.

Actualmente estamos trabajando desde nuestra propia computadora mediante la dirección local ::1.

Sin embargo, si el servidor necesitara aceptar conexiones remotas, sería recomendable configurar TLS correctamente y comprobar que las aplicaciones cliente lo utilicen.

También sería necesario revisar los certificados y establecer versiones y algoritmos de cifrado apropiados.

**Resultado del hardening:**

Se verificó la configuración SSL/TLS del servidor y se confirmó que la conexión actual no utiliza TLS.

No se realizaron modificaciones durante esta actividad.

**Conclusión:**

Aprendí que no basta con revisar si PostgreSQL tiene configurada una versión mínima de TLS. También debemos comprobar si el cifrado está habilitado y si realmente se utiliza en las conexiones.

La verificación mediante pg_stat_ssl permite conocer el estado real de una conexión y detectar situaciones donde el cifrado no está activo.


### Actividad 18 — Caso integral de hardening

**Objetivo:**

Analizar un escenario con configuraciones inseguras en PostgreSQL, identificar al menos diez riesgos y proponer controles para reducir la superficie de ataque.

**Procedimiento:**

Se analizó el caso de un servidor PostgreSQL que escucha en todas las interfaces, permite conexiones desde cualquier origen IPv4 y utiliza una cuenta administrativa para una aplicación.

También se consideró que el firewall permite conexiones al puerto 5432 desde cualquier dirección y que el administrador considera suficientes las contraseñas fuertes.

**Problemas identificados:**

| # | Problema | Riesgo | Control propuesto |
|---|---|---|---|
| 1 | PostgreSQL escucha en todas las interfaces | Exposición innecesaria del servicio | Limitar listen_addresses a las interfaces necesarias |
| 2 | Se permiten conexiones desde cualquier dirección IPv4 | Posibilidad de intentos de acceso desde redes no autorizadas | Restringir las direcciones permitidas |
| 3 | El firewall permite el puerto 5432 desde cualquier origen | Mayor exposición del servicio a conexiones externas | Crear reglas que permitan solamente las redes autorizadas |
| 4 | pg_hba.conf utiliza 0.0.0.0/0 | Regla de autenticación demasiado amplia | Sustituirla por rangos de red específicos |
| 5 | pg_hba.conf utiliza all para las bases de datos | Una misma regla abarca todas las bases de datos | Especificar únicamente las bases necesarias |
| 6 | pg_hba.conf utiliza all para los usuarios | La regla incluye todas las cuentas de PostgreSQL | Limitar las reglas a los usuarios que necesitan acceso |
| 7 | La aplicación utiliza una cuenta administrativa | Un ataque a la aplicación podría comprometer todo el servidor | Crear una cuenta de aplicación con privilegios mínimos |
| 8 | No existe separación adecuada de privilegios para la aplicación | La aplicación podría realizar operaciones innecesarias | Aplicar permisos específicos mediante roles y GRANT |
| 9 | Se depende solamente de contraseñas fuertes | Se ignoran otros riesgos de configuración y exposición | Aplicar seguridad por capas |
| 10 | No se demuestra una restricción de red por origen | Equipos no autorizados podrían intentar conectarse | Utilizar una allowlist de direcciones autorizadas |

**¿Es suficiente tener contraseñas fuertes?**

No. Aunque las contraseñas fuertes son importantes, no garantizan por sí solas la seguridad de PostgreSQL.

Para proteger correctamente el servidor es necesario considerar diferentes controles:

**Autenticación:**

Permite comprobar la identidad de los usuarios. Se deben utilizar métodos seguros, como scram-sha-256, y proteger adecuadamente las credenciales.

**Autorización:**

Determina qué operaciones puede realizar cada usuario. Es importante aplicar el principio de mínimo privilegio para evitar accesos innecesarios.

**Red:**

Se deben restringir las conexiones mediante el firewall, las interfaces de escucha y las reglas de pg_hba.conf.

**Configuración:**

Es necesario revisar los parámetros del servidor y mantener habilitadas solamente las funcionalidades que realmente se necesitan.

**Sistema operativo:**

Los archivos de configuración y el directorio de datos deben tener permisos adecuados para evitar accesos y modificaciones no autorizadas.

**Monitoreo:**

Es importante revisar registros, conexiones y eventos relevantes para identificar comportamientos sospechosos o problemas de seguridad.

**Análisis:**

El escenario demuestra que una contraseña fuerte no puede compensar una configuración demasiado permisiva.

Aunque un atacante todavía necesitaría autenticarse, permitir conexiones desde cualquier dirección aumenta la superficie expuesta.

Además, utilizar una cuenta administrativa para una aplicación puede provocar consecuencias graves si sus credenciales son comprometidas.

Por eso es necesario combinar controles de red, autenticación, autorización, sistema operativo y monitoreo.

**Resultado:**

Se identificaron diez problemas o riesgos y se propusieron controles para reducir la exposición del servidor PostgreSQL.

El análisis corresponde al escenario hipotético proporcionado por el profesor y no describe necesariamente la configuración real de nuestro servidor.

**Conclusión:**

Aprendí que el hardening requiere revisar diferentes capas de seguridad y no solamente las contraseñas.

También comprendí que reducir las interfaces, limitar las redes autorizadas y separar las cuentas administrativas de las aplicaciones puede disminuir considerablemente los riesgos de seguridad.


---

## Informe final — Preguntas

### 1. ¿Cuál era la principal superficie de ataque?

La principal superficie de ataque identificada fue la configuración de red de PostgreSQL, ya que el servidor escucha en todas las interfaces IPv4 e IPv6 mediante el puerto 5432.

También se revisaron otros elementos, como los roles, los archivos de configuración, los métodos de autenticación y las conexiones.

Aunque PostgreSQL escucha en todas las interfaces, las reglas actuales de pg_hba.conf solamente autorizan conexiones desde direcciones locales. Por lo tanto, no se comprobó que existiera acceso remoto no autorizado.

### 2. ¿Qué configuración representaba el mayor riesgo?

Una de las configuraciones que merece mayor atención es listen_addresses = '*', porque permite que PostgreSQL escuche en todas las interfaces disponibles.

Esto puede representar una exposición innecesaria si solamente utilizamos conexiones locales.

También se encontró que SSL/TLS está deshabilitado, lo que sería importante si necesitáramos conexiones remotas.

### 3. ¿Qué cambio produjo la mayor reducción de exposición?

Durante el laboratorio no se modificaron las interfaces de escucha ni las reglas de red, por lo que no se produjo una reducción comprobada de la exposición de red.

Sin embargo, sí se aplicó una mejora real de hardening en la base de datos lab04_hardening, cambiando el parámetro idle_in_transaction_session_timeout de 0 a 10min.

Este cambio ayuda a evitar que las transacciones abiertas permanezcan inactivas indefinidamente, aunque no reduce directamente la exposición de red.

La mejora propuesta con mayor impacto sobre la exposición sería restringir listen_addresses a localhost, siempre que se confirme que no existen aplicaciones que necesiten conexiones remotas.


### 4. ¿Qué diferencia existe entre firewall y pg_hba.conf?

El firewall controla el tráfico de red que puede llegar al servidor, considerando direcciones IP, puertos y otras reglas.

En cambio, pg_hba.conf establece qué conexiones pueden autenticarse en PostgreSQL, tomando en cuenta la base de datos, el usuario, la dirección de origen y el método de autenticación.

Ambos controles son diferentes, pero se complementan para proteger el servidor.

### 5. ¿Qué diferencia existe entre autenticación y autorización?

La autenticación permite comprobar la identidad de un usuario, por ejemplo, mediante una contraseña.

La autorización determina qué operaciones puede realizar ese usuario después de iniciar sesión, como consultar, modificar o eliminar información.

Por lo tanto, un usuario puede autenticarse correctamente y aun así tener permisos limitados.

### 6. ¿Por qué una cuenta de aplicación no debe ser SUPERUSER?

Porque una cuenta SUPERUSER tiene privilegios muy elevados sobre PostgreSQL.

Si una aplicación utiliza esa cuenta y sufre un ataque, el atacante podría aprovechar sus permisos para acceder a otras bases de datos, modificar información o realizar operaciones administrativas.

Por eso es recomendable crear cuentas independientes con solamente los privilegios necesarios para cada aplicación.

### 7. ¿Por qué cambiar el puerto de PostgreSQL no constituye hardening suficiente?

Porque cambiar el puerto 5432 por otro número no elimina los riesgos relacionados con contraseñas, permisos, configuraciones inseguras o conexiones no autorizadas.

Un atacante podría identificar el nuevo puerto mediante herramientas de exploración de red.

Por lo tanto, cambiar el puerto no sustituye medidas como configurar el firewall, restringir conexiones y utilizar autenticación segura.

### 8. ¿Por qué listen_addresses = '*' puede ser innecesario?

Porque esta configuración permite que PostgreSQL escuche en todas las interfaces de red disponibles.

Si solamente necesitamos conectarnos desde la misma computadora, no existe una razón para mantener abiertas todas esas interfaces.

En ese caso, utilizar localhost podría reducir la exposición del servidor.

Sin embargo, antes de realizar el cambio debemos comprobar que ninguna aplicación necesite conexiones remotas.

### 9. ¿Qué papel tiene el sistema operativo en la seguridad de PostgreSQL?

El sistema operativo controla el acceso a los archivos y directorios utilizados por PostgreSQL.

Durante el laboratorio revisamos los permisos de postgresql.conf, pg_hba.conf y la carpeta de datos mediante herramientas de Windows.

Encontramos que varias cuentas tienen control total sobre los archivos de configuración.

Por eso es importante revisar los permisos del sistema operativo, además de los roles y privilegios configurados dentro de PostgreSQL.

### 10. ¿Qué controles deberían revisarse periódicamente?

Considero que deberían revisarse los siguientes controles:

- Usuarios y privilegios de PostgreSQL.
- Reglas de autenticación de pg_hba.conf.
- Interfaces y puertos de escucha.
- Reglas del firewall.
- Configuración de SSL/TLS.
- Permisos de los archivos de configuración.
- Extensiones instaladas.
- Límites y consumo de conexiones.
- Registros de eventos y accesos.
- Actualizaciones de PostgreSQL y del sistema operativo.

Estas revisiones permitirían identificar cambios innecesarios y mantener una configuración de seguridad adecuada.

---

## Reflexión individual

### ¿Qué cambiarías primero si recibieras la responsabilidad de asegurar un servidor PostgreSQL que ya se encuentra funcionando en producción?

Lo primero que haría sería revisar la exposición de red del servidor para identificar desde qué direcciones pueden intentar conectarse los usuarios y las aplicaciones.

Considero que este sería un buen punto de partida porque un servidor expuesto innecesariamente podría recibir intentos de conexión desde equipos que no necesitan utilizarlo.

Sin embargo, no cambiaría directamente la configuración sin investigar primero qué aplicaciones dependen del servidor, porque podría interrumpir su funcionamiento.

Primero identificaría las conexiones legítimas, revisaría las reglas del firewall y pg_hba.conf y comprobaría qué interfaces son realmente necesarias.

Después propondría restringir el acceso a las redes y direcciones autorizadas, realizando los cambios de manera planificada y verificando que las aplicaciones sigan funcionando.

También revisaría si existen cuentas con privilegios excesivos, especialmente aplicaciones conectadas mediante SUPERUSER.

Posteriormente comprobaría los métodos de autenticación, el uso de TLS, los permisos del sistema operativo y las actualizaciones pendientes.

Para mí, lo más importante sería reducir los riesgos sin afectar innecesariamente la disponibilidad y continuidad del servicio.

Por eso documentaría la configuración inicial, prepararía respaldos y un procedimiento para revertir los cambios si ocurre algún problema.

Esta práctica me ayudó a comprender que asegurar un servidor PostgreSQL requiere analizar los riesgos, priorizar los controles y comprobar sus resultados, en lugar de modificar parámetros sin conocer sus consecuencias.


---

## Verificación final del hardening

**Objetivo:**

Comprobar que el cambio de configuración aplicado a PostgreSQL se haya realizado correctamente.

**Cambio realizado:**

Se modificó el parámetro idle_in_transaction_session_timeout de la base de datos lab04_hardening.

El valor inicial era 0, por lo que no existía un límite de tiempo configurado mediante este parámetro.

Se ejecutó el siguiente comando:

```sql
ALTER DATABASE lab04_hardening
SET idle_in_transaction_session_timeout = '10min';
```

**Procedimiento de verificación:**

Después de aplicar el cambio, se abrió una nueva conexión a lab04_hardening desde pgAdmin 4.

Se ejecutó:

```sql
SHOW idle_in_transaction_session_timeout;
```

**Resultado:**

| Parámetro | Antes | Después |
|---|---|---|
| idle_in_transaction_session_timeout | 0 | 10min |

La consulta mostró el resultado 10min, confirmando que la nueva conexión utiliza el valor configurado.

**Evidencia:** [06-verificacion.png](evidencias/06-verificacion.png)

**Análisis:**

El cambio se aplicó solamente a la base de datos lab04_hardening, evitando modificar la configuración global del servidor.

Esta mejora ayuda a limitar el tiempo que una sesión puede permanecer inactiva mientras mantiene una transacción abierta.

No se realizó una prueba esperando diez minutos; la verificación confirmó el valor de configuración utilizado por una nueva conexión.

**Conclusión:**

Aprendí que después de modificar una configuración de PostgreSQL es necesario comprobar que el nuevo valor realmente se está utilizando.

También comprendí que algunos cambios de hardening pueden aplicarse a una base de datos específica, sin afectar innecesariamente las demás bases de datos del servidor.
