# Changelog — somacor_app

## 2026-06-22
- Corregido bug crítico: el JSON usa `centrosDeCosto` pero el código buscaba `centrosCosto`. Causaba pantalla blanca en Registrar y Admin.
- Actualizada paleta de colores: azul principal #2d67aa, teal #17a6a4, acento naranja #e45021, rojo #df0847, cyan #0cc0df.
- Rediseñado Header con logo SOMACOR (SVG del ícono cuadrado+círculo) y barra de colores del logo bajo el encabezado.
- Actualizadas tarjetas del Home con los nuevos colores por sección.
- Actualizado fondo del Login con gradiente de los colores SOMACOR.

## 2026-06-19
- Recreada la app React completa en scripts/app/ (el código se perdió al reorganizar carpetas).
- Configurado vite.config.ts con @tailwindcss/vite y tsconfig.app.json con resolveJsonModule.
- Creado src/index.css con Tailwind v4, tema SOMACOR y clases utilitarias (.btn-primary, .card, etc.).
- Creados todos los archivos fuente: types, store Zustand, componentes Header y ProtectedRoute, páginas Login, Home, Registrar, Consultar, Validar y Admin.
- Generado scripts/app/src/data/supervisores.json (69 personas: 54 supervisores + 15 ADC).
- Copiado data_output.json como src/data/somacor-data.json (1068 empleados, 101 CC).
- App verificada y corriendo en http://localhost:5173.

## 2026-06-18
- Proyecto creado en el repo puente. Planificacion completa disponible en PLANIFICACION.md (raiz del workspace).
- Se creo la estructura de carpetas datos/, scripts/, salidas/, changelog/ y el PLAN.md del proyecto.
- Scripts de extraccion de empleados movidos a scripts/: check_cargos.js, extract_data.js, extract_supervisores.js, playwright-verify.js, read_excel.js.
- Lista Empleados de somacor.xlsx movida a datos/.
- data_output.json movido a salidas/.
- PLANIFICACION.md movido a PLAN.md en la raiz del proyecto.

