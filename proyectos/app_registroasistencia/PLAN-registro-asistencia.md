# Planificación: Módulo de Registro de Asistencia — App de Remuneraciones SOMACOR

> **Importante:** Este documento es un **agregado**, no reemplaza nada. Todo lo descrito en
> `PLAN-app-horasextras-bonos.md` (registro de Horas Extras y Bonos) se mantiene **tal cual**.
> Acá solo se especifica el **nuevo módulo de Registro de Asistencia** que se suma a la app.

---

## 1. Objetivo

La app deja de ser solo de Horas Extras y Bonos y pasa a ser una **App de Remuneraciones**
más grande. Al ingresar, el usuario podrá elegir entre dos módulos:

- **Registro de Asistencia** (lo nuevo, este documento)
- **Registro de Horas Extras y Bonos** (lo ya existente, ver `PLAN-app-horasextras-bonos.md`)

El módulo de Registro de Asistencia reemplaza la planilla mensual en Excel
(`CCXXX - Remuneraciones - (mes).xlsx`, hoja **"Registro Asistencia"**) por una tabla web
con **el mismo formato del Excel**, donde cada centro de costo registra la asistencia diaria
de sus trabajadores, mes a mes, sin que un mes pise a otro.

---

## 2. Alcance

**Incluye:**
- Una pantalla inicial (selector de módulo) para elegir entre Asistencia y Horas Extras/Bonos.
- Flujo de Registro de Asistencia: seleccionar CC → seleccionar mes y año → grilla de asistencia.
- Grilla editable que replica el formato del Excel (encabezados, días del mes, días de la semana,
  una fila por trabajador y un selector de sigla por día).
- Persistencia separada por **CC + año + mes** (los registros de cada mes son independientes y
  no se sobreescriben entre sí).
- Las **12 siglas** oficiales como opciones del selector de cada celda.

**No incluye (por ahora):**
- Integración con la API de Talana (se hará más adelante; se usa la **misma base de datos** que
  el módulo de Horas Extras y Bonos).
- Cálculo de remuneraciones a partir de la asistencia.
- Generación del archivo Excel `CCXXX - Remuneraciones...` (eso lo hace hoy un script externo;
  acá la asistencia vive en la app/BD, no en el Excel).

---

## 3. Flujo del usuario (Registro de Asistencia)

```
[Selector de módulo]
   │  elige "Registro de Asistencia"
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

> **Navegación:** el Paso 1 junta CC + mes + año en una sola pantalla, para que el usuario no
> navegue de más. Además, **todas las pantallas tienen un botón "Volver atrás"** (la grilla
> vuelve a la selección; la selección vuelve al selector de módulo).

**Regla central — no sobreescribir entre meses:**
cada combinación **(centro de costo, año, mes)** es un registro independiente. El registro de
Marzo es distinto del de Abril, distinto del de Mayo, etc. Por eso se elige **mes y año antes**
de abrir la grilla: así se carga (o se crea si no existe) el registro exacto de ese período.

---

## 4. La grilla de asistencia (mismo formato que el Excel)

La tabla debe verse y comportarse como la hoja **"Registro Asistencia"** del Excel. Estructura:

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
│ 29 │28726015-6 │Alejandro Lupa │Op. Lavand.│05-03-2026│TO│TO│TO│   ...    │TO │
│ ...│           │               │           │         │   │   │   │          │   │
└────┴───────────┴───────────────┴───────────┴─────────┴───┴───┴───┴─── ... ──┴───┘
```

### 4.1 Encabezado (3 líneas, como el Excel)
- Línea 1: `Registro Asistencia - SOMACOR`
- Línea 2: `<Mes> <Año>` (ej. `Junio 2026`)
- Línea 3: nombre del centro de costo (ej. `Lavandería - Iquique`)

### 4.2 Columnas fijas (las primeras 5, idealmente "congeladas" al hacer scroll horizontal)
| Columna | Origen | Notas |
|---|---|---|
| `CC` | código del centro de costo | el mismo del paso 1 (ej. `29`) |
| `RUT` | empleado | |
| `Nombre` | empleado | |
| `Cargo` | empleado | |
| `Ingreso` | empleado (Fecha de Ingreso) | formato `dd-mm-aaaa` |

### 4.3 Columnas de días (dinámicas según el mes)
- **La cantidad de columnas de día = días reales del mes elegido.** Junio = 30, Mayo = 31,
  Febrero = 28/29, etc. Se calculan a partir de año + mes; **no van fijas a 31**.
- Cada columna de día tiene **dos encabezados**: arriba el día de la semana abreviado
  (`lun, mar, mié, jue, vie, sáb, dom`) y abajo el número del día (`1, 2, 3, …`).
- El día de la semana se calcula con la fecha real (locale `es-CL`). Así el calendario calza
  con el mes elegido (ej. junio 2026 parte en `lun` el día 1; mayo 2026 parte en `vie`).

### 4.4 Celdas de asistencia (una por trabajador-día)
- Cada celda es un **selector (dropdown)** con las **12 siglas** (ver punto 5).
- Por defecto la celda puede ir vacía hasta que el usuario elija una sigla.
- Sugerido (mejora visual, opcional): colorear la celda según la sigla para leer rápido la grilla.

### 4.5 Filas de trabajadores
- Una fila por trabajador del CC (vienen de la base de datos, filtrados por `codigo_cc`).
- **Días sin llenar = normal.** Una celda vacía simplemente significa que ese día aún no se registra
  (ej. en un mes en curso como junio, los días que todavía no ocurren quedan vacíos). No tiene un
  significado especial: se va completando a medida que avanza el mes.

---

## 5. Siglas de Asistencia (lista de 12)

Son las que vienen en la hoja **"Siglas Asistencia"** del Excel. Es una lista cerrada de 12:

| Sigla | Significado |
|---|---|
| `TG`   | Turno Guardia |
| `TO`   | Turno Operario |
| `HA`   | Horario Administrativo |
| `T4X3` | Turno 4x3 |
| `DESC` | Descanso |
| `VAC`  | Vacaciones |
| `LIC`  | Licencia |
| `F`    | Falta |
| `PCGS` | Permiso con Goce de Sueldo |
| `PSGS` | Permiso sin Goce de Sueldo |
| `DESV` | Desvinculado |
| `NI`   | Nuevo Ingreso |

> Estas 12 siglas se cargan como catálogo de la app. Si el día de mañana cambian, se editan en
> un solo lugar (ver §8, pendiente de confirmar si son fijas o administrables).

---

## 6. Modelo de datos

Se usa la **misma base de datos** que Horas Extras y Bonos (más adelante alimentada por Talana).

### 6.1 Catálogo de siglas
| Campo | Tipo | Descripción |
|---|---|---|
| `sigla` | string (PK) | ej. `TO`, `DESC` |
| `nombre` | string | ej. `Turno Operario` |

### 6.2 Registro de asistencia — formato largo (recomendado)
Una fila por **trabajador-día**. Es el formato ideal para reportería (Power BI) y para garantizar
que cada mes sea independiente.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | |
| `codigo_cc` | string | centro de costo |
| `nombre_cc` | string | |
| `rut_empleado` | string | |
| `nombre_empleado` | string | |
| `cargo` | string | cargo al momento del registro |
| `fecha_ingreso` | date | columna "Ingreso" |
| `anio` | integer | ej. 2026 |
| `mes` | integer | 1–12 |
| `dia` | integer | 1–31 |
| `sigla` | string (FK siglas) | una de las 12 |
| `registrado_por` | string | email del usuario |
| `fecha_registro` | timestamp | |

**Clave única:** (`codigo_cc`, `rut_empleado`, `anio`, `mes`, `dia`).
Esto asegura que **un mes no pisa a otro** y que cada celda tiene un único valor.

> **Sin validación:** la asistencia **solo se registra**. No lleva estados
> (pendiente/validado/rechazado) ni flujo de aprobación, a diferencia de Horas Extras y Bonos.
> Una celda sin sigla = día aún no registrado (no es un error).

> La grilla del UI se arma a partir de estas filas (pivot: filas = trabajadores, columnas = días).
> Alternativa simple: guardar un registro por trabajador-mes con un arreglo de siglas
> (`siglas: ["TO","TO","DESC", …]`). Es más parecido al Excel pero peor para reportes; se deja
> como opción si se prefiere simplicidad. **Recomendación: formato largo.**

---

## 7. Rutas y pantallas (agregadas, sin tocar las existentes)

Las rutas actuales de `PLAN-app-horasextras-bonos.md` se mantienen. Se **agregan**:

```
/                       → Selector de módulo (Asistencia / Horas Extras y Bonos)
/horas-extras           → Dashboard de Horas Extras y Bonos (las tarjetas actuales)
/registro-asistencia    → Módulo de asistencia (selección + grilla en la misma página)
```

- El **Home actual** (las 4 tarjetas: Registrar/Consultar/Validar/Administrar) pasa a vivir en
  `/horas-extras`. La ruta `/` pasa a ser el **selector de módulo**: al elegir "Horas Extras y
  Bonos" entra al dashboard ya existente; al elegir "Registro de Asistencia" entra al módulo nuevo.
- Dentro del módulo de asistencia, la selección (CC + mes + año) y la grilla son **una misma
  pantalla con dos pasos internos**; no se usan rutas separadas para no complicar la navegación.
- **Botón "Volver atrás" en todas las pantallas** (grilla → selección → selector de módulo).
- Permisos: se reutiliza el esquema actual (cada usuario ve solo sus CC; jefatura/admin ven todos).
- La asistencia **no tiene flujo de validación**: solo se registra (ver §6.2).

---

## 8. Decisiones tomadas

1. **Origen de los datos = base de datos (luego Talana).** El dato principal es el **trabajador**
   (nombre/RUT); el CC es un atributo del trabajador. La base puede equivocarse y no asignarle CC
   a un trabajador, pero **nunca** va a haber un CC con trabajadores "sin nombre". Por eso:
   - **Siempre se crea grilla de asistencia para un CC que tiene trabajadores.**
   - Si un CC **no tiene** trabajadores, no se crea (en la práctica no debería pasar).
   - El `cargo` y la `Fecha de Ingreso` salen de la ficha del trabajador en la BD.
   > Nota: el archivo `somacor-data.json` fue solo una prueba para validar VS Code; **no se usa**
   > como fuente de datos de este módulo.

2. **Días sin llenar = normal.** Una celda vacía significa que ese día todavía no se registra
   (típico en un mes en curso, como junio: los días que aún no pasan quedan vacíos). No es error
   ni tiene significado especial; se completa a medida que avanza el mes.

3. **Las 12 siglas son fijas por ahora.** Se cargan como catálogo. No se necesita CRUD de siglas
   de momento (si más adelante cambian, se reevalúa).

4. **La asistencia solo se registra.** Sin estados ni flujo de validación (a diferencia de HE/Bonos).

5. **Trabajador en más de un CC:** puede ocurrir cuando se está **migrando** el CC de un trabajador
   (ej. de 203 a 209). Es un caso de detalle; la regla simple se mantiene: el trabajador aparece en
   la grilla del/los CC que tenga asignado(s) en la BD.

6. **Talana:** más adelante la base de trabajadores y la asistencia se conectarán a la API de Talana.
   Se usa la **misma base de datos** que el módulo de Horas Extras y Bonos.

---

## 9. Estado

**LISTO PARA REVISAR** — Módulo de Registro de Asistencia **implementado y verificado** en la app
(staging). La columna `Ingreso` ya viene cargada con la fecha de ingreso real (extraída del Excel
`Lista Empleados de somacor.xlsx` y agregada a `somacor-data.json`). Pendiente solo la conexión a
la base de datos real / Talana (hoy los datos de asistencia se guardan en el navegador vía
`localStorage`).

### Lo que quedó hecho (en `scripts/app/`)
- Selector de módulo al ingresar (`/` → `Inicio.tsx`): *Registro de Asistencia* / *Horas Extras y Bonos*.
- Dashboard de HE y Bonos movido a `/horas-extras` (sus pantallas internas no se tocaron).
- Módulo de asistencia (`/registro-asistencia` → `RegistroAsistencia.tsx`):
  - Pantalla de selección con CC + mes + año en una sola vista.
  - Grilla editable con el formato del Excel (cabecera de 3 líneas, columnas fijas, días del mes con
    día de la semana, fines de semana resaltados y selector con las 12 siglas por celda).
  - Guardado por `(CC + año + mes)` en el store Zustand (persistido); un mes no pisa a otro.
  - Botón "Volver" en todas las pantallas.
- Catálogo de siglas y helpers en `scripts/app/src/data/siglas.ts`.

---

## 10. Estructura del frontend

La app vive en `proyectos/app_horasextras_bonos/scripts/app/`. Es una app **React + TypeScript +
Vite**, con **Tailwind CSS v4** para estilos, **Zustand** para el estado (persistido en el
`localStorage` del navegador), **React Router** para la navegación y **lucide-react** para iconos.
Mientras no exista backend/Talana, los empleados y CC salen de un JSON estático y todo lo que se
escribe (registros y asistencia) queda en el navegador.

### 10.1 Cómo ejecutarla
```bash
cd proyectos/app_horasextras_bonos/scripts/app
npm install        # solo la primera vez
npm run dev        # arranca en http://localhost:5173
```
Usuarios demo (clave `123456`): `adc@somacor.cl`, `supervisor@somacor.cl`, `jefatura@somacor.cl`,
`admin@somacor.cl`.

### 10.2 Árbol de archivos (lo relevante) — 🆕 = nuevo del módulo de asistencia
```
scripts/app/
├── package.json            <- dependencias y scripts (dev / build / preview)
├── vite.config.ts          <- configuración de Vite + Tailwind
├── index.html              <- HTML raíz donde monta React
├── public/                 <- estáticos (logo-somacor.png, favicon, etc.)
└── src/
    ├── main.tsx            <- punto de entrada: monta <App/>
    ├── App.tsx             <- define TODAS las rutas (incl. las 🆕 de asistencia)
    ├── index.css           <- tema SOMACOR (colores) y clases .card/.btn-*/.input
    │
    ├── types/
    │   └── index.ts        <- tipos: Empleado, CentroCosto, Registro… + 🆕 Sigla, AsistenciaMes
    │
    ├── store/
    │   └── useStore.ts     <- estado global Zustand (login, registros, usuarios,
    │                          🆕 asistencias{} y la acción guardarAsistencia)
    │
    ├── data/
    │   ├── somacor-data.json   <- empleados + centros de costo (fuente temporal)
    │   ├── supervisores.json   <- usuarios supervisores/ADC
    │   └── siglas.ts           <- 🆕 las 12 siglas, sus colores, meses, días de la
    │                              semana y la función claveAsistencia(cc, año, mes)
    │
    ├── components/
    │   ├── Header.tsx          <- barra superior (logo + usuario + salir)
    │   └── ProtectedRoute.tsx  <- protege rutas según rol del usuario
    │
    └── pages/
        ├── Login.tsx             <- inicio de sesión
        ├── Inicio.tsx            <- 🆕 selector de módulo (Asistencia / HE y Bonos)
        ├── Home.tsx              <- dashboard de Horas Extras y Bonos (ahora en /horas-extras)
        ├── RegistroAsistencia.tsx<- 🆕 módulo de asistencia: selección (CC+mes+año) + grilla
        ├── Registrar.tsx         <- registro de HE/Bonos (sin cambios)
        ├── Consultar.tsx         <- consulta de HE/Bonos (sin cambios)
        ├── Validar.tsx           <- validación HE/Bonos (sin cambios)
        └── Admin.tsx             <- administración de usuarios/CC (sin cambios)
```

### 10.3 De dónde sale cada cosa en la grilla
- **Filas (trabajadores):** `somacor-data.json`, filtrando los empleados cuyo `centrosCosto`
  incluye el CC elegido.
- **Columnas de día:** se calculan con `new Date(año, mes, 0).getDate()` (días reales del mes) y
  el día de la semana con `new Date(año, mes-1, día).getDay()`.
- **Siglas del selector:** `src/data/siglas.ts` (las 12, con su color de celda).
- **Valor de cada celda:** del estado `asistencias` del store, bajo la clave `CC-AAAA-MM`,
  con la forma `{ [rut]: { [día]: sigla } }`. Al guardar, se escribe esa clave; por eso un mes
  no pisa a otro.
- **Columna "Ingreso":** sale de `fechaIngreso` de cada empleado en `somacor-data.json`. Ese
  campo se agregó extrayendo la "Fecha de Ingreso" del Excel `Lista Empleados de somacor.xlsx`
  (cruzando por RUT, formato `dd-mm-aaaa`). En producción vendrá de Talana.
