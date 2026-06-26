# Planificación: App de Remuneraciones — SOMACOR

> **Documento único.** Reúne en un solo plan los dos grandes módulos de la app:
> **Registro de Asistencia** y **Horas Extras y Bonos**. Reemplaza a los antiguos
> `PLAN-app-horasextras-bonos.md` y `PLAN-registro-asistencia.md` (ahora es **una sola app**).

---

## 1. Objetivo

Reemplazar las herramientas actuales (Power Apps + planillas Excel) por **una sola aplicación web
moderna en React** para la gestión de remuneraciones de los trabajadores de los centros de costo de
SOMACOR Servicios Integrales. Debe mantener compatibilidad con Power BI para reportería.

La app se compone de **dos módulos**, que el usuario elige al ingresar:

| Módulo | Para qué sirve |
|---|---|
| **Registro de Asistencia** | Registrar la asistencia diaria de los trabajadores por centro de costo, mes a mes (reemplaza la hoja "Registro Asistencia" de los Excel `CCXXX - Remuneraciones`). |
| **Horas Extras y Bonos** | Registrar, consultar y validar horas extras y bonos (reemplaza la app Power Apps actual). |

---

## 2. Contexto del sistema actual

| Aspecto | Hoy |
|---|---|
| Frontend HE/Bonos | Power Apps |
| Base de datos | Listas SharePoint |
| Empleados | Excel descargado desde TALANA → subido a SharePoint |
| Asistencia | Planilla Excel mensual por CC (`CCXXX - Remuneraciones - (mes).xlsx`) |
| Reportería | Power BI conectado a SharePoint |

**Hacia dónde vamos:** una app web única + base de datos compartida (a futuro alimentada por la
**API de Talana**) + Power BI conectado a esa base.

---

## 3. Roles y permisos (comunes a ambos módulos)

| Rol | Capacidades |
|---|---|
| **Supervisor** | Registrar HE/bonos y asistencia en sus CC asignados. Consultar lo de sus CC. |
| **Administrador de contrato** | Igual que supervisor, en sus CC asignados. |
| **Jefe de operaciones** | Igual que supervisor, en sus CC asignados. |
| **Jefatura** | Validar registros de HE/Bonos de cualquier CC. Ver todos los CC. |
| **Admin sistema** | Gestión de usuarios, permisos y carga de empleados. Ve todos los CC. |

**Regla clave:** cada usuario registrador tiene asignado uno o más centros de costo y solo ve/registra
en los suyos. Jefatura y admin ven todos. La asignación se gestiona desde el panel de administración.

---

## 4. Pantalla de entrada — Selector de módulo

Tras el login, la ruta `/` muestra un **selector de módulo** con dos tarjetas grandes:

```
┌─────────────────────────────────────────────────────────┐
│  SOMACOR · Remuneraciones              [Nombre usuario] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌───────────────────────┐   ┌───────────────────────┐ │
│   │  Registro de          │   │  Horas Extras y       │ │
│   │  Asistencia           │   │  Bonos                │ │
│   └───────────────────────┘   └───────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Registro de Asistencia** → `/registro-asistencia`
- **Horas Extras y Bonos** → `/horas-extras` (dashboard con Registrar / Consultar / Validar / Administrar)
- **Botón "Volver atrás" en todas las pantallas** internas de ambos módulos.

---

# MÓDULO A — Registro de Asistencia

## A.1 Flujo del usuario

```
[Selector de módulo] → elige "Registro de Asistencia"
   ▼
[Paso 1] Centro de Costo + Mes y Año  (en UNA sola pantalla)
   │  - CC: solo los asignados al usuario; jefatura/admin ven todos
   │  - Mes y Año: define qué registro se abre/crea (ej. Mayo 2026)
   ▼
[Paso 2] Grilla de Asistencia del CC para ese mes/año
   │  (tabla igual al Excel, editable, una sigla por día)
   ▼
Guardar  →  queda persistido para ese CC + año + mes
```

**Regla central — no sobreescribir entre meses:** cada combinación **(centro de costo, año, mes)** es
un registro independiente. El de Marzo es distinto del de Abril, etc. Por eso se elige **mes y año
antes** de abrir la grilla: así se carga (o se crea si no existe) el registro exacto de ese período.

## A.2 La grilla (mismo formato que el Excel)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Registro Asistencia - SOMACOR                                                   │
│ Junio 2026                                                                      │
│ Lavandería - Iquique                          [CC 029]                          │
├────┬───────────┬───────────────┬───────────┬─────────┬───┬───┬───┬─── ... ──┬───┤
│    │           │               │           │         │lun│mar│mié│   ...    │mar│  ← día de la semana
│ CC │   RUT     │    Nombre     │   Cargo   │ Ingreso │ 1 │ 2 │ 3 │   ...    │30 │  ← número de día
├────┼───────────┼───────────────┼───────────┼─────────┼───┼───┼───┼─── ... ──┼───┤
│ 29 │25841920-0 │Alejandro Moret│ Lavandero │22-12-2020│TO│TO│TO│   ...    │TO │
│ ...│           │               │           │         │   │   │   │          │   │
└────┴───────────┴───────────────┴───────────┴─────────┴───┴───┴───┴─── ... ──┴───┘
```

- **Encabezado (3 líneas):** `Registro Asistencia - SOMACOR` · `<Mes> <Año>` · nombre del CC.
- **Columnas fijas (5):** `CC`, `RUT`, `Nombre`, `Cargo`, `Ingreso` (fecha de ingreso `dd-mm-aaaa`).
- **Columnas de día (dinámicas):** una por día real del mes (Junio = 30, Mayo = 31, Feb = 28/29…).
  Doble encabezado: día de la semana abreviado (`lun, mar, mié…`) + número de día. Fines de semana
  resaltados.
- **Celdas:** un selector (dropdown) con las **12 siglas** por cada trabajador-día. Vacía = día aún
  no registrado (normal en un mes en curso). Color por sigla para leer rápido.
- **Filas:** un trabajador del CC por fila.

## A.3 Siglas de Asistencia (lista cerrada de 12)

| Sigla | Significado | Sigla | Significado |
|---|---|---|---|
| `TG` | Turno Guardia | `VAC` | Vacaciones |
| `TO` | Turno Operario | `LIC` | Licencia |
| `HA` | Horario Administrativo | `F` | Falta |
| `T4X3` | Turno 4x3 | `PCGS` | Permiso con Goce de Sueldo |
| `DESC` | Descanso | `PSGS` | Permiso sin Goce de Sueldo |
| | | `DESV` | Desvinculado |
| | | `NI` | Nuevo Ingreso |

Fijas por ahora (se cargan como catálogo; si cambian, se editan en un solo lugar).

## A.4 Modelo de datos — Asistencia (formato largo recomendado)

Una fila por **trabajador-día** (ideal para Power BI y para que cada mes sea independiente):

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | |
| `codigo_cc` / `nombre_cc` | string | centro de costo |
| `rut_empleado` / `nombre_empleado` | string | |
| `cargo` | string | cargo al momento del registro |
| `fecha_ingreso` | date | columna "Ingreso" |
| `anio` | integer | ej. 2026 |
| `mes` | integer | 1–12 |
| `dia` | integer | 1–31 |
| `sigla` | string (FK siglas) | una de las 12 |
| `registrado_por` | string | email del usuario |
| `fecha_registro` | timestamp | |

**Clave única:** (`codigo_cc`, `rut_empleado`, `anio`, `mes`, `dia`) → un mes no pisa a otro.
**Sin validación:** la asistencia solo se registra (no lleva estados ni aprobación).

## A.5 Decisiones tomadas (asistencia)

1. **Origen de datos = base de datos (luego Talana).** El dato principal es el **trabajador**
   (nombre/RUT); el CC es un atributo suyo. Puede faltar el CC de un trabajador, pero nunca un CC
   con trabajadores "sin nombre". Por eso: **siempre se crea grilla para un CC que tiene
   trabajadores**; si no tiene, no se crea. `cargo` y `Fecha de Ingreso` salen de la ficha del trabajador.
2. **Días sin llenar = normal** (típico en un mes en curso).
3. **Las 12 siglas son fijas por ahora** (sin CRUD de siglas).
4. **La asistencia solo se registra** (sin validación, a diferencia de HE/Bonos).
5. **Trabajador en más de un CC:** ocurre al **migrar** el CC (ej. 203→209); aparece en el/los CC
   que tenga asignado(s).

---

# MÓDULO B — Horas Extras y Bonos

## B.1 Modelo de datos

### Empleados
| Campo | Tipo |
|---|---|
| `rut` | string |
| `nombre` | string |
| `cargo` | string |
| `fecha_ingreso` | date |
| `codigo_cc` / `nombre_cc` | string |
| `activo` | boolean |

### Usuarios del sistema
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | |
| `nombre` / `email` | string | email corporativo (auth) |
| `rol` | enum | supervisor / adc / jefe_operaciones / jefatura / admin |
| `centros_de_costo` | string[] | CC asignados |

### Registros — Horas Extras
`id`, `rut_empleado`, `nombre_empleado`, `codigo_cc`, `nombre_cc`, `cantidad_he` (int),
`motivo`, `fecha`, `estado` (pendiente/validado/rechazado), `registrado_por`, `fecha_registro`,
`validado_por` (nullable), `fecha_validacion` (nullable).

### Registros — Bonos
Igual que HE pero con `monto_bono` (int, CLP) en vez de `cantidad_he`.

## B.2 Pantallas y flujos

- **Dashboard (`/horas-extras`):** tarjetas Registrar / Consultar / Validar (jefatura) / Administrar (admin).
- **Registrar:** (1) elegir CC → (2) seleccionar trabajadores + completar formulario (tipo HE o Bono,
  fecha, cantidad/monto, motivo) → (3) confirmar → envío. Quedan en estado `pendiente`.
- **Consultar:** filtros (CC, tipo, rango de fechas, estado); tabla con selección múltiple, eliminar
  pendientes y exportar a Excel.
- **Validar (jefatura):** lista de pendientes de todos los CC; validar / rechazar (registra validador y fecha).
- **Administración (admin):** gestión de usuarios y permisos; importación de empleados desde Excel (TALANA).

---

## 5. Stack tecnológico

### Frontend (lo implementado hoy)
| Capa | Tecnología |
|---|---|
| Framework | React + TypeScript + Vite |
| Estilos | Tailwind CSS v4 (tema SOMACOR) |
| Estado global | Zustand (persistido en `localStorage`) |
| Navegación | React Router |
| Iconos | lucide-react |
| Export Excel | xlsx (SheetJS) |

### Backend (a futuro — aún no existe)
| Capa | Tecnología recomendada |
|---|---|
| Runtime | Node.js + Express o Azure Functions |
| Base de datos | **Azure SQL Database** (Power BI por DirectQuery) |
| Auth | Microsoft Entra ID (Azure AD) |
| Datos empleados | API de Talana (carga/sincronización) |

> **Estado actual del backend:** no hay. Mientras tanto, los empleados y CC salen de un JSON estático
> y todo lo que se escribe (registros de HE/Bonos, usuarios y asistencia) se guarda en el navegador
> (`localStorage` vía Zustand). Al conectar la base de datos, esa persistencia local se reemplaza por
> llamadas a la API.

---

## 6. Estructura del frontend

La app vive en `proyectos/app_registroasistencia/scripts/app/`.

### 6.1 Cómo ejecutarla
```bash
cd proyectos/app_registroasistencia/scripts/app
npm install        # solo la primera vez
npm run dev        # arranca en http://localhost:5173
```
Usuarios demo (clave `123456`): `adc@somacor.cl` (CC 029 Lavandería), `supervisor@somacor.cl`,
`jefatura@somacor.cl`, `admin@somacor.cl`.

### 6.2 Árbol de archivos (lo relevante)
```
scripts/app/
├── package.json            <- dependencias y scripts (dev / build / preview)
├── vite.config.ts          <- configuración de Vite + Tailwind
├── index.html              <- HTML raíz donde monta React
├── public/                 <- estáticos (logo-somacor.png, favicon, etc.)
└── src/
    ├── main.tsx            <- punto de entrada: monta <App/>
    ├── App.tsx             <- define TODAS las rutas (selector, asistencia, HE/Bonos)
    ├── index.css           <- tema SOMACOR (colores) y clases .card/.btn-*/.input
    │
    ├── types/
    │   └── index.ts        <- tipos: Empleado, CentroCosto, Registro, Sigla, AsistenciaMes
    │
    ├── store/
    │   └── useStore.ts     <- estado global Zustand (login, registros, usuarios,
    │                          asistencias{} y la acción guardarAsistencia)
    │
    ├── data/
    │   ├── somacor-data.json   <- empleados + centros de costo (fuente temporal; incluye fechaIngreso)
    │   ├── supervisores.json   <- usuarios supervisores/ADC
    │   └── siglas.ts           <- las 12 siglas, sus colores, meses, días de la semana
    │                              y la función claveAsistencia(cc, año, mes)
    │
    ├── components/
    │   ├── Header.tsx          <- barra superior (logo + usuario + salir)
    │   └── ProtectedRoute.tsx  <- protege rutas según rol del usuario
    │
    └── pages/
        ├── Login.tsx             <- inicio de sesión
        ├── Inicio.tsx            <- selector de módulo (Asistencia / HE y Bonos)
        ├── RegistroAsistencia.tsx<- MÓDULO A: selección (CC+mes+año) + grilla
        ├── Home.tsx              <- MÓDULO B: dashboard HE/Bonos (en /horas-extras)
        ├── Registrar.tsx         <- registro de HE/Bonos
        ├── Consultar.tsx         <- consulta de HE/Bonos
        ├── Validar.tsx           <- validación HE/Bonos
        └── Admin.tsx             <- administración de usuarios/CC
```

### 6.3 Rutas
```
/                       → Selector de módulo (Inicio.tsx)
/registro-asistencia    → Módulo A (selección + grilla en la misma página)
/horas-extras           → Dashboard Módulo B
/registrar /consultar /validar /admin → pantallas del Módulo B
```

### 6.4 De dónde sale cada cosa en la grilla de asistencia
- **Filas (trabajadores):** `somacor-data.json`, filtrando empleados cuyo `centrosCosto` incluye el CC elegido.
- **Columnas de día:** `new Date(año, mes, 0).getDate()` (días del mes) y `getDay()` para el día de la semana.
- **Siglas del selector:** `src/data/siglas.ts`.
- **Valor de cada celda:** del estado `asistencias` del store, clave `CC-AAAA-MM`, forma
  `{ [rut]: { [día]: sigla } }`. Al guardar se escribe esa clave; por eso un mes no pisa a otro.
- **Columna "Ingreso":** `fechaIngreso` de cada empleado en `somacor-data.json` (extraída de
  `Lista Empleados de somacor.xlsx`, cruzando por RUT, formato `dd-mm-aaaa`). En producción vendrá de Talana.

---

## 7. Diseño visual

- **Paleta:** azul SOMACOR (`#1a3d68` / `#2d67aa`) + acentos del logo (teal `#17a6a4`, naranja
  `#e45021`, rojo `#df0847`, cyan `#0cc0df`).
- **Tipografía:** Inter. **Estilo:** limpio, profesional, responsive (tablet y desktop).
- **Logo SOMACOR** en el header.

---

## 8. Estado del proyecto

**LISTO PARA REVISAR (staging).**

- ✅ Módulo de **Registro de Asistencia** implementado y verificado (grilla igual al Excel, guardado
  por CC+mes+año, columna Ingreso con fecha real).
- ✅ Módulo de **Horas Extras y Bonos** funcionando (registrar, consultar, validar, admin).
- ✅ Selector de módulo y navegación con botón "Volver" en todas las pantallas.
- ⏳ **Pendiente:** backend + base de datos compartida e integración con **API de Talana** (hoy todo
  se guarda en el navegador vía `localStorage`).

---

## 9. Preguntas abiertas (Módulo B / generales)

1. ¿Cuántos centros de costo aprox.? (afecta dropdowns y permisos)
2. ¿La Jefatura valida todos los CC o solo algunos?
3. ¿Se pueden editar registros de HE/Bonos después de enviados?
4. ¿Hay tenant de Azure AD disponible (el mismo de Microsoft 365)?
5. ¿Dónde se despliega? (Azure u otra opción)
