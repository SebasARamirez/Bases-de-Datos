
-- LAB-03 - Actividad 4: Control de acceso
-- Base de datos: lab03_privacidad

-- 1. Crear un rol para analítica
CREATE ROLE analista NOLOGIN;

-- 2. Crear una vista con información limitada
CREATE VIEW v_analitica_clientes AS
SELECT
    ciudad,
    CASE
        WHEN edad < 18 THEN 'Menor de 18'
        WHEN edad BETWEEN 18 AND 29 THEN '18-29'
        WHEN edad BETWEEN 30 AND 44 THEN '30-44'
        WHEN edad BETWEEN 45 AND 59 THEN '45-59'
        ELSE '60 o más'
    END AS rango_edad
FROM clientes;

-- 3. Otorgar acceso al esquema public
GRANT USAGE ON SCHEMA public TO analista;

-- 4. Permitir consultar solamente la vista
GRANT SELECT ON v_analitica_clientes TO analista;

-- 5. Verificar los permisos otorgados
SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'analista';
