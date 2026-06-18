# powerbi_control_operacional

## Objetivo
Dashboards Power BI de Control Operacional 360 para los distintos clientes (faenas) de SOMACOR. Permiten ver en tiempo real el estado operacional de cada contrato.

## Alcance
- Incluye: reportes .pbix por cliente (ACCIONA, ANGLO, BHP, CMPC, ENGIE, etc.) y un consolidado general.
- No incluye: carga de datos (los insumos llegan por separado a datos/), ni despliegue en Power BI Service.

## Estructura de carpetas
- `datos/` — Archivos de entrada: Excel, CSV o conexiones de datos para los reportes.
- `scripts/` — Scripts auxiliares si se automatizan cargas o transformaciones.
- `salidas/` — Archivos .pbix listos para publicar o entregar.
- `changelog/` — Historial de cambios del proyecto.

## Requisitos
- Power BI Desktop (para abrir y editar los .pbix).
- Acceso a las fuentes de datos de cada cliente.

## Como usarlo
1. Abrir el .pbix del cliente correspondiente en Power BI Desktop.
2. Actualizar fuente de datos si corresponde.
3. Guardar y publicar en Power BI Service cuando esté listo para revisión.

## Estado
En progreso — hay 25 reportes .pbix en salidas/.

## Notas / pendientes
- Revisar si los archivos .pbix necesitan actualizacion de fuentes de datos.
- Definir proceso de publicacion a Power BI Service.
