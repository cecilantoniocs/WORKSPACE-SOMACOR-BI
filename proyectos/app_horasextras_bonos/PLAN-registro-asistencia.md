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
[Paso 1] Seleccionar Centro de Costo
   │  (solo los CC asignados al usuario; jefatura/admin ven todos)
   ▼
[Paso 2] Seleccionar Mes y Año
   │  (ej. Mayo 2026)  ← clave: define qué registro se abre/crea
   ▼
[Paso 3] Grilla de Asistencia del CC para ese mes/año
   │  (tabla igual al Excel, editable, una sigla por día)
   ▼
Guardar  →  queda persistido para ese CC + año + mes
```

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
/                          → Selector de módulo (Asistencia / Horas Extras y Bonos)
/registro-asistencia
  /registro-asistencia/cc        → Paso 1: seleccionar centro de costo
  /registro-asistencia/periodo   → Paso 2: seleccionar mes y año
  /registro-asistencia/grilla    → Paso 3: grilla de asistencia (CC + mes + año)
```

- El **Home actual** pasa a ser, o a vivir detrás de, un **selector de módulo**. Al elegir
  "Horas Extras y Bonos" se entra al flujo ya existente; al elegir "Registro de Asistencia" se
  entra a `/registro-asistencia/cc`.
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

**LISTO PARA REVISAR** — Documento de planificación del módulo de Registro de Asistencia completo,
con las decisiones ya confirmadas (§8). Falta la aprobación de Cecil/Michell para empezar a
programar. No se ha escrito código todavía.
