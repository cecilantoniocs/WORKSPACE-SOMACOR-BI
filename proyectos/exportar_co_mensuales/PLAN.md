# exportar_co_mensuales

## Objetivo
Exportar de forma automática los CO (centros de operación / órdenes de compra) mensuales
a un formato de salida (Excel/CSV) listo para revisar o cargar en otro sistema.

> ⚠️ Pendiente confirmar con el usuario el detalle exacto de qué significa "CO" y de dónde
> salen los datos. Ver sección **Notas / pendientes**.

## Alcance
**Incluye:**
- Leer los insumos mensuales desde `datos/`.
- Procesarlos y generar el export mensual en `salidas/`.

**No incluye (por ahora):**
- Subir los resultados a otro sistema de forma automática.
- Conexión directa a base de datos (a definir).

## Estructura de carpetas
- `datos/`     → archivos de entrada del mes (Excel, CSV, insumos que llegan).
- `scripts/`   → código que hace la exportación (.py, .ps1).
- `salidas/`   → resultados generados (el export mensual final).
- `changelog/` → `CHANGELOG.md` con el registro de todos los cambios por fecha.

## Requisitos
- Por definir (Python + librerías, o PowerShell). Se completa cuando se confirme el flujo.

## Cómo usarlo
- Por definir. Se documentará el paso a paso cuando exista el primer script.

## Estado
En progreso — carpeta y documentación inicial creadas. Falta confirmar detalles del flujo.

## Notas / pendientes
- Confirmar qué significa "CO" exactamente (centro de operación, orden de compra, etc.).
- Confirmar el formato de los insumos de entrada y el formato de salida esperado.
- Confirmar periodicidad y de dónde llegan los datos cada mes.
