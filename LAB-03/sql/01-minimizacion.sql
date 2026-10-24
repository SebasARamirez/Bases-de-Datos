
-- LAB-03 - Actividad 2: Principio de minimización
-- Base de datos: lab03_privacidad

-- 1. Crear una tabla con los datos necesarios para soporte
CREATE TABLE clientes_soporte (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20)
);

-- 2. Copiar únicamente la información necesaria
INSERT INTO clientes_soporte (
    id,
    nombre,
    correo,
    telefono
)
SELECT
    id,
    nombre,
    correo,
    telefono
FROM clientes;

-- 3. Comprobar los registros
SELECT *
FROM clientes_soporte;
