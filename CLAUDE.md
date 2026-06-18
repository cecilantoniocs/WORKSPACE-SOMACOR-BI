# Instrucciones para Claude — Repo Puente (workspace-somacor-bi)

Este es el repo **puente / staging** de Somacor. Acá se prueban avances antes de pasarlos
a producción. Cuando trabajes en esta carpeta, sigue SIEMPRE las reglas de abajo.

---

## 🚨 REGLA OBLIGATORIA: antes de empezar CUALQUIER proyecto nuevo

Cuando el usuario te pida empezar **un proyecto nuevo** (algo que todavía no existe en
esta carpeta), ANTES de escribir cualquier código tienes que hacer estos dos pasos:

### 1. Crear la carpeta del proyecto

Todo proyecto nuevo vive en su **propia carpeta** dentro de `proyectos/`:

```
proyectos/<nombre_del_proyecto>/
```

- TODO lo del proyecto (código, datos, scripts, subcarpetas) va **dentro** de esa carpeta.
  No dejes archivos del proyecto sueltos en la raíz del repo.

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

### Ejemplo de cómo debe quedar

```
workspace-somacor-bi/
├── proyectos/
│   ├── control_asistencia/
│   │   ├── PLAN.md            <- documentación del proyecto
│   │   └── ...                <- todo el código y archivos acá adentro
│   └── reporte_mensual/
│       ├── PLAN.md
│       └── ...
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
