--9. Actividad 3 — Seudonimización (pseudonymization)
--9.1 Crear los esquemas
CREATE SCHEMA pii;

CREATE SCHEMA analitica;

--9.2 Crear la tabla de correspondencia
CREATE TABLE pii.mapa_cliente (
    token UUID PRIMARY KEY,
    cliente_id BIGINT UNIQUE
        REFERENCES public.clientes(id)
);

--9.3 Generar los tokens
--Habilitar la extensión
CREATE EXTENSION IF NOT EXISTS pgcrypto;

--Generar un token para cada cliente
INSERT INTO pii.mapa_cliente
(token, cliente_id)
SELECT
    gen_random_uuid(),
    id
FROM clientes;

--Verificar
SELECT *
FROM pii.mapa_cliente;

--10. Crear el conjunto de datos para analítica
--tabla que no contenga directamente los identificadores principales del cliente
CREATE TABLE analitica.clientes AS
SELECT
    m.token AS cliente_token,
    c.edad,
    c.ciudad,
    c.codigo_postal,
    c.fecha_alta
FROM pii.mapa_cliente m
JOIN clientes c
    ON c.id = m.cliente_id;

	SELECT *
FROM analitica.clientes;

--11. Actividad 4 — Separación de funciones
CREATE ROLE analista NOLOGIN;

GRANT USAGE
ON SCHEMA analitica
TO analista;

GRANT SELECT
ON analitica.clientes
TO analista;

--11.1 Verificar los permisos
--Permitido
SELECT *
FROM analitica.clientes;

--Restringido (FALTA EVIDENCIA)
SELECT *
FROM pii.mapa_cliente;

SELECT *
FROM public.clientes;

