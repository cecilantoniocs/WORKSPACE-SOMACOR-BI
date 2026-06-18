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
proyectos/<nombre-del-proyecto>/
```

- Usa un nombre corto, en minúsculas y con guiones (ejemplo: `proyectos/control-asistencia/`).
- TODO lo del proyecto (código, datos, scripts, subcarpetas) va **dentro** de esa carpeta.
  No dejes archivos del proyecto sueltos en la raíz del repo.

### 2. Crear el markdown de documentación del proyecto

Dentro de la carpeta del proyecto, crea un archivo `README.md` **bien documentado**, con
al menos estas secciones:

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
En qué va el proyecto (en progreso / probando / listo para pasar a producción).

## Notas / pendientes
Cosas por resolver, dudas, decisiones importantes.
```

> ✅ Recién **después** de crear la carpeta y este `README.md` puedes empezar a programar
> lo que se pidió. Si el usuario no te dio el nombre del proyecto, pregúntaselo antes.

---

## Ejemplo de cómo debe quedar

```
workspace-somacor-bi/
├── proyectos/
│   ├── control-asistencia/
│   │   ├── README.md          <- documentación del proyecto
│   │   └── ...                 <- todo el código y archivos acá adentro
│   └── reporte-mensual/
│       ├── README.md
│       └── ...
├── auto-sync.ps1
└── ...
```

---

## Otras reglas de la casa

- **No toques** `auto-sync.ps1` ni la configuración de sincronización, salvo que te lo
  pidan explícitamente.
- Esto es **staging**: no es producción. No asumas que algo de acá ya está en producción.
- Nunca guardes contraseñas, tokens ni archivos `.env` en el repo (ya están en `.gitignore`).
- Comenta el código en español, claro y simple, para que se entienda fácil.
