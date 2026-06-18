# rrhh_dashboard

## Objetivo
Dashboard web de RRHH para SOMACOR. Aplicacion frontend en React + Vite para visualizar y gestionar informacion de recursos humanos.

## Alcance
- Incluye: interfaz web, componentes de visualizacion, integracion con fuentes de datos RRHH.
- No incluye: backend ni base de datos (eso es responsabilidad de otro servicio).

## Estructura de carpetas
- `datos/` — Archivos de entrada: Excel, CSV con datos de RRHH.
- `scripts/` — Codigo fuente de la aplicacion React (package.json, src/, etc.) y scripts auxiliares.
- `salidas/` — Build generado (dist/) u otros artefactos listos para desplegar.
- `changelog/` — Historial de cambios del proyecto.

## Requisitos
- Node.js (version 18 o superior).
- npm o pnpm para instalar dependencias.
- Ejecutar `npm install` dentro de scripts/ antes de usar.

## Como usarlo
1. Ir a la carpeta scripts/ del proyecto.
2. Ejecutar `npm install` (solo la primera vez).
3. Ejecutar `npm run dev` para modo desarrollo.
4. Ejecutar `npm run build` para generar el build en salidas/.

## Estado
En progreso — estructura base del proyecto lista.

## Notas / pendientes
- Definir las vistas y componentes principales.
- Conectar con la fuente de datos de RRHH.
