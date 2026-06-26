# 🧱 Stack estándar para aplicaciones de Somacor

Este documento define **con qué tecnologías se construyen las aplicaciones de Somacor**.
Aplica a **toda aplicación nueva**. La idea es que todo lo que construyamos use el mismo
stack, para mantenerlo entre pocas personas, reusar lo que ya tenemos y que los usuarios
tengan una buena experiencia (incluido el celular).

> Acordado el 2026-06-26. Ver el detalle de la decisión al final del documento.

---

## 🎯 Resumen del stack (una mirada)

| Capa | Tecnología | Quién la mantiene |
|---|---|---|
| **Frontend** | React 19 + Vite + TypeScript + Tailwind (como **PWA**) | Michell |
| **Backend** | Python + **FastAPI** | Cecil |
| **Autenticación** | Entra ID / MSAL (cuenta corporativa Microsoft) | Cecil (backend) |
| **Datos** | Según el caso: MySQL Azure o SharePoint Online | Cecil (backend) |
| **Hosting** | VM Windows de Somacor (hoy) → VPS dedicado (después) | Cecil |

**Un solo stack para todo: React (frontend) + FastAPI (backend).** Dos roles claros:
Michell ve el frontend, Cecil ve el backend y los datos.

---

## 1. Frontend — React (PWA)

Es el stack que ya usamos y conocemos. Toda app nueva parte así:

- **React 19** + **Vite** (bundler/dev server)
- **TypeScript** (no JavaScript pelado)
- **Tailwind CSS v4** para estilos (con el tema corporativo de Somacor)
- **Zustand** para el estado de la app
- **React Router** para la navegación
- **PWA**: la app debe poder "instalarse" en el celular y verse bien en pantalla chica
  (mobile-first cuando el uso es en terreno).

Librerías de apoyo habituales: `lucide-react` (iconos), `date-fns` (fechas),
`xlsx` (exportar a Excel).

Comandos:
```bash
npm install      # primera vez
npm run dev      # desarrollo -> http://localhost:5173
npm run build    # compila para producción
```

> ⚠️ El frontend **nunca** se conecta directo a la base de datos ni guarda datos
> productivos en `localStorage`. Todo pasa por el backend (ver punto 2).

## 2. Backend — Python + FastAPI

El backend es **siempre Python con FastAPI**. Acá vive la lógica, los datos y la
seguridad, y se reutiliza todo lo que Somacor ya tiene en Python:

- Autenticación corporativa: `lib_somacor_auth` (SSO compartido).
- Integraciones existentes: **SharePoint**, **API de Talana**, **MySQL Azure**.

Dependencias base: `fastapi`, `uvicorn`, `pydantic`, `python-dotenv`, `msal`/`requests`
(auth), conector de MySQL, `openpyxl` (Excel) cuando aplique.

Comandos:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload    # desarrollo
```

## 3. Autenticación — Entra ID / MSAL

- Los usuarios entran con su **cuenta corporativa de Microsoft** (Entra ID).
- **Prohibido** inventar login propio, claves hardcodeadas o usuarios de demo en
  producción.
- El token se valida **en el backend**. El frontend solo gatilla el login y guarda la
  sesión; nunca decide permisos por su cuenta.
- Reutilizar `lib_somacor_auth` para no rehacer el SSO en cada app.

## 4. Datos — según el caso

No hay una sola base obligatoria; se elige según la app, pero **siempre se accede a
través del backend**:

- **MySQL Azure** → cuando hay datos transaccionales, muchos registros o consultas
  (lo normal para apps con harta entrada de datos).
- **SharePoint Online** → cuando el negocio necesita ver o editar las listas
  directamente, o el volumen es chico.

> Datos personales (RUT, nombres, sueldos, salud): cuidado especial por la **Ley 21.719**.
> Nunca en el repo, nunca en el frontend; van en la base, detrás del backend y del login.

## 5. Hosting — VM Windows hoy, VPS después

- **Hoy:** la app corre en la **VM Windows de Somacor**.
- **Después:** se migrará a un **VPS dedicado**.
- El stack está pensado para que esa migración **no obligue a reescribir nada**:
  - El frontend React compila a **archivos estáticos**.
  - El backend FastAPI es **un solo proceso** que se sirve con `uvicorn` detrás de un
    reverse proxy (IIS/nginx).
  - Sin amarres a un proveedor específico → corre igual en Windows hoy y en Linux mañana.

---

## 6. Estructura de carpetas de una app

Una app es un proyecto dentro de `proyectos/`, pero con frontend y backend separados:

```
proyectos/<nombre_app>/
├── PLAN.md                 <- documentación del proyecto
├── changelog/
│   └── CHANGELOG.md        <- bitácora de cambios por fecha
├── frontend/               <- React (Vite) — lo de Michell
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/                <- FastAPI (Python) — lo de Cecil
│   ├── app/
│   ├── requirements.txt
│   └── ...
└── datos/                  <- opcional: insumos de referencia (NO datos productivos)
```

Reglas:
- Nombres en `minusculas_con_guion_bajo`, sin tildes ni espacios.
- `frontend/` y `backend/` van siempre que la app tenga ambas partes.
- Los secretos (claves, tokens, conexión a BD) van en un `.env` que **no se sube**
  (ya está en `.gitignore`).

---

## 7. Registro de la decisión — 2026-06-26

Lo que acordamos Cecil y el equipo este día:

1. **Stack único para todas las apps nuevas:** React (Vite + TypeScript + Tailwind, como
   PWA) en el frontend y **FastAPI (Python)** en el backend.
2. **El backend siempre en Python** para reutilizar las integraciones que Somacor ya tiene
   (SharePoint, Talana, MySQL, `lib_somacor_auth`) y que Cecil pueda mantenerlas.
3. **Autenticación con Entra ID / MSAL** (cuenta corporativa). Se elimina el login falso
   y las claves hardcodeadas.
4. **Datos según el caso** (MySQL Azure o SharePoint), siempre detrás del backend.
5. **Hosting:** VM Windows ahora, migración a VPS dedicado después, sin reescribir el
   stack.
6. **Roles:** Michell mantiene el frontend React; Cecil mantiene el backend Python y los
   datos.

> Las apps que ya existen y funcionan no se tocan por este estándar; cualquier cambio en
> ellas lo decide su dueño caso a caso. Este documento rige para lo que construyamos de
> ahora en adelante.
