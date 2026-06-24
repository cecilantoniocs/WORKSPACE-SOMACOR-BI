# Changelog — somacor_app

## 2026-06-24
- App fusionada como "Remuneraciones": al ingresar ahora hay un selector de módulo (Registro de Asistencia / Horas Extras y Bonos). El dashboard de HE y Bonos se movió a /horas-extras (sin tocar sus pantallas internas).
- Nuevo módulo Registro de Asistencia: pantalla de selección (CC + mes + año en una sola vista) y grilla editable con el mismo formato del Excel (cabecera de 3 líneas, columnas CC/RUT/Nombre/Cargo/Ingreso, días del mes con día de la semana, fines de semana resaltados y selector de las 12 siglas por celda).
- Cada (CC + año + mes) se guarda por separado en el store (persistido en el navegador): el registro de un mes no pisa al de otro. Verificado: junio=30 días, mayo=31 días y vacío; persistencia OK; sin errores JS.
- Botón "Volver" en todas las pantallas del módulo. Agregados tipos, catálogo de siglas (src/data/siglas.ts) y estado de asistencia en el store.

## 2026-06-23
- Analizados los Excel "CCXXX - Remuneraciones" (hojas "Registro Asistencia" y "Siglas Asistencia") para entender el formato de la planilla mensual de asistencia.
- Creado PLAN-registro-asistencia.md: documento del nuevo módulo de Registro de Asistencia que se suma a la app (ahora "App de Remuneraciones"). No se tocó PLAN-app-horasextras-bonos.md.
- Afinado PLAN-registro-asistencia.md con las decisiones confirmadas: datos vienen de la BD (no de somacor-data.json), días vacíos son normales (mes en curso), 12 siglas fijas, asistencia solo se registra (sin validación). Estado: LISTO PARA REVISAR.

## 2026-06-22
- Admin: selector de CC reemplazado por tabla con columnas "Nombre CC" y "Centro de Costo". Checkbox en encabezado para seleccionar/descartar todos los visibles + botón de texto equivalente.
- Registrar: pasos 2 y 3 fusionados en una sola pantalla dividida (izquierda: lista de trabajadores, derecha: formulario de detalle).
- Registrar: agregado botón "Seleccionar/Descartar todos los visibles" en la lista de trabajadores.
- Registrar: indicador de pasos actualizado de 4 a 3 etapas.

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

