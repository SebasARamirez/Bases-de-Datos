
REVOKE UPDATE ON clientes FROM soporte_ana;

GRANT UPDATE ON clientes TO app_ventas;

ALTER TABLE clientes ADD COLUMN segmento VARCHAR(20);

CREATE ROLE rol_temporal LOGIN;

DROP ROLE rol_temporal;

SELECT num,
       regexp_replace(
           linea,
           'PASSWORD ''[^'']*''',
           'PASSWORD ''<REDACTED>''',
           'gi'
       ) AS linea
FROM dba.bitacora
WHERE linea ILIKE '%sentencia:%'
ORDER BY num;
