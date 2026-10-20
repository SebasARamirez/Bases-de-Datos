# LAB-01 — Protección y privacidad de datos

**Materia:** Gestión de Seguridad y Desempeño de Bases de Datos  
**Unidad:** II — Seguridad, privacidad y control de acceso  
**Tema:** 2.3 — Datos sensibles, privacidad y protección de la información  
**Motor utilizado:** PostgreSQL 15.19 

## Descripción

En este laboratorio se trabajó con una base de datos de cinco clientes ficticios para aplicar mecanismos de protección y privacidad de la información. Se buscó que las distintas áreas de una organización puedan utilizar los datos que necesitan sin exponer información personal innecesariamente.

## Actividades realizadas

1. **Clasificación de datos:** identificación de campos personales, identificadores y cuasi-identificadores.
2. **Enmascaramiento:** creación de la vista `v_clientes_soporte`, que oculta parcialmente correo, teléfono y RFC.
3. **Seudonimización:** generación de tokens UUID y creación de la tabla de correspondencia `pii.mapa_cliente`.
4. **Separación de funciones:** asignación de permisos al rol `analista` para consultar `analitica.clientes`.
5. **Anonimización:** agrupación de edades y regiones, y supresión de grupos pequeños con `HAVING COUNT(*) >= 5`.
6. **Riesgo de reidentificación:** modificación de una consulta para reducir el detalle de los resultados.
7. **Retención de datos:** identificación de registros con más de cinco años de antigüedad, sin eliminar información.

## Estructura del repositorio

```text
LAB-01/
├── README.md
├── informe.md
├── sql/
│   ├── 01-clasificacion.sql
│   ├── 02-enmascaramiento.sql
│   ├── 03-seudonimizacion.sql
│   ├── 04-anonimizacion.sql
│   └── 05-retencion.sql
└── evidencias/
    ├── 01-clasificacion.pdf
    ├── 02-enmascaramiento.pdf
    ├── 03-seudonimizacion.pdf
    ├── 04-anonimizacion.pdf
    └── 05-retencion.pdf
```

Los archivos de `sql/` contienen las consultas de la práctica; los PDF de `evidencias/` reúnen capturas y respuestas. En `informe.md` se encuentran el análisis, las conclusiones y las preguntas de reflexión.
