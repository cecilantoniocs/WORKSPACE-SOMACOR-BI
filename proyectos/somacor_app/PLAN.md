# somacor_app

## Objetivo
Aplicacion web para reemplazar el Power Apps actual de registro de Horas Extras y Bonos de SOMACOR. Permite registrar, consultar y validar HE y bonos por centro de costo. Mantiene compatibilidad con Power BI para reporteria.

## Alcance
- Incluye: registro de HE y bonos, consulta con filtros, validacion por jefatura, administracion de usuarios y carga de empleados desde TALANA.
- No incluye: reportes Power BI (esos van en powerbi_control_operacional).

## Estructura de carpetas
- `datos/` — Archivos de entrada: Excel de empleados descargado desde TALANA, listas de centros de costo.
- `scripts/` — Codigo fuente de la aplicacion (frontend React + backend si aplica).
- `salidas/` — Build generado u otros artefactos listos para desplegar.
- `changelog/` — Historial de cambios del proyecto.

## Requisitos
- Node.js 18 o superior.
- Acceso a Azure AD (mismo tenant de Microsoft 365 de SOMACOR).
- Base de datos Azure SQL o SharePoint Lists (por definir).

## Como usarlo
(Por completar cuando empiece el desarrollo.)

## Estado
Planificacion lista (ver PLANIFICACION.md en la raiz) — pendiente iniciar desarrollo.

## Notas / pendientes
- Revisar preguntas abiertas del PLANIFICACION.md (cantidad de CC, permisos de jefatura, tenant Azure, etc.).
- Definir si BD sera Azure SQL o SharePoint.
- Los scripts de extraccion de empleados (check_cargos.js, extract_data.js, etc.) que estan en la raiz deben moverse aqui a datos/ o scripts/ segun corresponda.
