# Instrucciones para Claude — Repo Puente (workspace-somacor-bi)

Este es el repo **puente / staging** de Somacor. Acá se prueban avances antes de pasarlos
a producción. Cuando trabajes en esta carpeta, sigue SIEMPRE las reglas de abajo.

---

## 🚨 REGLA OBLIGATORIA: antes de empezar CUALQUIER proyecto nuevo

Cuando el usuario te pida empezar **un proyecto nuevo** (algo que todavía no existe en
esta carpeta), ANTES de escribir cualquier código tienes que hacer los pasos 1 y 2. El
paso 3 (changelog) se hace a medida que vas trabajando.

### 1. Crear la carpeta del proyecto con su estructura interna

Todo proyecto nuevo vive en su **propia carpeta** dentro de `proyectos/`, y SIEMPRE con
esta estructura interna fija:

```
proyectos/<nombre_del_proyecto>/
├── PLAN.md       <- documentación del proyecto (ver punto 2)
├── datos/        <- archivos de entrada: Excel, CSV, insumos que llegan
├── scripts/      <- el código: .py, .ps1, etc.
├── salidas/      <- resultados generados: reportes, Excel finales, etc.
└── changelog/    <- contiene UN solo CHANGELOG.md con todos los cambios por fecha (ver punto 3)
```

Reglas:
- TODO lo del proyecto va **dentro** de su carpeta. No dejes archivos sueltos en la raíz
  del repo ni en `proyectos/` directamente.
- Crea SIEMPRE las cuatro subcarpetas (`datos/`, `scripts/`, `salidas/`, `changelog/`)
  aunque alguna empiece vacía. Si una carpeta va a quedar vacía al inicio, déjale adentro
  un archivo `.gitkeep` para que git la conserve.
- Cada archivo va donde corresponde: insumos en `datos/`, código en `scripts/`, lo que
  el código produce en `salidas/`.
- Si el proyecto necesita una carpeta extra (ej. `docs/`), agrégala, pero las cuatro de
  arriba van siempre.

### 2. Crear el `PLAN.md` del proyecto

Dentro de la carpeta del proyecto, crea un archivo llamado **`PLAN.md`** (siempre con ese
nombre) **bien documentado**, con al menos estas secciones:

```markdown
# <Nombre del proyecto>

## Objetivo
Para qué sirve el proyecto, qué problema resuelve.

## Alcance
Qué incluye y qué NO incluye.

## Estructura de carpetas
Descripción de las carpetas/archivos principales y para qué es cada uno.

## Requisitos
Programas, librerías, credenciales o accesos que se necesitan.

## Cómo usarlo
Pasos para correr o usar lo que se haga.

## Estado
En qué va el proyecto (en progreso / probando / listo para revisar).

## Notas / pendientes
Cosas por resolver, dudas, decisiones importantes.
```

> ✅ Recién **después** de crear la carpeta y este `PLAN.md` puedes empezar a programar
> lo que se pidió. Si el usuario no te dio el nombre del proyecto, pregúntaselo antes.

### 3. Registrar los cambios en `changelog/CHANGELOG.md`

Cada proyecto lleva **un solo archivo** de cambios: `changelog/CHANGELOG.md`. NO crees un
archivo por fecha; todas las fechas van **dentro del mismo archivo**, cada una en su
sección.

```
proyectos/<nombre_del_proyecto>/changelog/CHANGELOG.md
```

Cada vez que hagas un avance con sentido (crear algo, arreglar un error, cambiar lógica,
generar un resultado), anótalo en ese archivo:

- Usa **la fecha real de hoy** (formato `AAAA-MM-DD`, ej. `2026-06-18`). Si no estás
  seguro de la fecha, averíguala antes de escribir.
- Si **ya existe** la sección de la fecha de hoy, **agrega** una línea más debajo de ella
  (no la dupliques).
- Si es una **fecha nueva**, crea su sección **arriba de todo** (la fecha más reciente
  queda primera, así lo último se ve al tiro).
- Cada línea: qué se hizo, en simple. Si aplica, por qué.

Así se ve el archivo `CHANGELOG.md` (un único archivo que va creciendo hacia arriba):

```markdown
# Changelog — <nombre del proyecto>

## 2026-06-19
- Agregué el filtro por centro de costo al reporte.

## 2026-06-18
- Creé el script que lee el Excel de asistencia y arma el consolidado.
- Arreglé el error que dejaba filas en blanco al final.
- Generé el primer reporte de prueba en salidas/.
```

> Esto sirve para que Cecil pueda mirar rápido qué se avanzó cada día sin tener que
> revisar todo el código.

### Ejemplo de cómo debe quedar

```
workspace-somacor-bi/
├── proyectos/
│   ├── control_asistencia/
│   │   ├── PLAN.md            <- documentación del proyecto
│   │   ├── datos/             <- insumos (Excel, CSV)
│   │   ├── scripts/           <- código (.py, .ps1)
│   │   ├── salidas/           <- resultados generados
│   │   └── changelog/
│   │       └── CHANGELOG.md   <- un solo archivo con todos los cambios por fecha
│   └── reporte_mensual/
│       ├── PLAN.md
│       ├── datos/
│       ├── scripts/
│       ├── salidas/
│       └── changelog/
│           └── CHANGELOG.md
├── auto-sync.ps1
└── ...
```

---

## 1. Qué NO puedes tocar (lista negra)

- **NO edites** estos archivos sin permiso explícito de Cecil:
  `auto-sync.ps1`, `.gitignore`, `SETUP-MICHELL.md`, `README.md` y este `CLAUDE.md`.
- **NO borres** las carpetas de otros proyectos dentro de `proyectos/`. Cada quien trabaja
  en lo suyo; no toques proyectos ajenos salvo que te lo pidan.

## 2. Convención de nombres (obligatoria)

Para nombres de **archivos y carpetas**:

- **Sin tildes** ni eñes (usa `n` en vez de `ñ`).
- **Sin espacios** ni separaciones.
- **Usa guión bajo `_`** para separar palabras.
- Todo en **minúsculas**.

Ejemplos: `control_asistencia/`, `reporte_mensual.py`, `datos_junio.csv`.
❌ Mal: `Control Asistencia/`, `reporte-mensual.py`, `Cálculo Final.xlsx`.

## 3. Manejo de secretos (refuerzo)

- **Nunca** pegues contraseñas, tokens, claves ni datos personales (RUTs, nombres,
  remuneraciones, datos de salud) directamente en el código.
- Todo dato sensible va en un archivo `.env` (que ya está ignorado por `.gitignore` y
  no se sube al repo).
- Esto es parte del cumplimiento de la **Ley 21.719** de protección de datos: tratar mal
  un dato personal acá puede ser un problema legal, no solo técnico.

## 4. Hábito de guardar seguido

- Recuérdale al usuario **guardar los archivos (Ctrl + S)** apenas un cambio quede
  funcionando. El sistema sube todo solo a GitHub **cada 10 minutos**; no hay que correr
  comandos de git a mano.

## 5. Qué hacer al terminar un avance

- Deja el **`PLAN.md`** del proyecto **actualizado**, sobre todo la sección **Estado**.
- Anota lo que hiciste en el **`changelog/CHANGELOG.md`** del proyecto, bajo la fecha de
  hoy (ver punto 3 de la regla obligatoria).
- Cuando algo ya sirva y esté listo para que Cecil lo revise, déjalo marcado claramente
  en el `PLAN.md` como **"LISTO PARA REVISAR"**, así él sabe qué mirar.

## 6. Qué hacer si algo se rompe

- **No fuerces git** (nada de `--force`, `reset --hard`, etc.).
- **No borres** la carpeta del repo ni archivos para "arreglar" un error.
- **Avísale a Cecil** y deja anotado qué pasó. El sistema de sincronización está hecho
  para detenerse solo ante conflictos; no intentes saltártelo.

## 7. Tono e idioma

- Responde y comenta el código **en español chileno simple y claro**, pensando en que lo
  lea alguien sin experiencia técnica.

---

## Recordatorio general

Esto es **staging**, no producción. No asumas que algo de acá ya está en producción: el
traspaso a producción lo hace Cecil a mano cuando algo está OK.
