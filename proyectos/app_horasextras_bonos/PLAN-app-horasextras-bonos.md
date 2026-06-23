# Planificación: Sistema de Registro Horas Extras y Bonos — SOMACOR

## 1. Objetivo del Proyecto

Reemplazar la aplicación Power Apps actual por una aplicación web moderna en React que permita registrar, consultar y validar horas extras y bonos de los trabajadores de los distintos centros de costo de SOMACOR Servicios Integrales. La nueva app debe mantener compatibilidad con Power BI para reportería.

---

## 2. Contexto del Sistema Actual

| Aspecto | Power Apps actual |
|---|---|
| Frontend | Power Apps |
| Base de datos | Listas SharePoint |
| Empleados | Excel descargado desde TALANA → subido a SharePoint |
| Permisos | Tabla Excel (nombre, email, centros de costo) vinculada a SharePoint |
| Reportería | Power BI conectado a SharePoint |

---

## 3. Roles y Permisos

| Rol | Capacidades |
|---|---|
| **Supervisor** | Registrar HE y bonos en sus CC asignados. Consultar registros de sus CC. |
| **Administrador de contrato** | Registrar HE y bonos en sus CC asignados. Consultar registros de sus CC. |
| **Jefe de operaciones** | Registrar HE y bonos en sus CC asignados. Consultar registros de sus CC. |
| **Jefatura** | Validar registros de cualquier CC. Ver todos los registros. |
| **Admin sistema** | Gestión de usuarios, permisos y carga de empleados. |

**Regla clave:** Cada usuario registrador tiene asignado uno o más centros de costo. Solo puede ver y registrar en sus CC asignados. La asignación se gestiona desde un panel de administración.

---

## 4. Modelo de Datos

### 4.1 Empleados
| Campo | Tipo | Descripción |
|---|---|---|
| `rut` | string | RUT chileno (ej: 25183084-3) |
| `nombre` | string | Nombre completo |
| `cargo` | string | Ej: Guardia de seguridad |
| `codigo_cc` | string | Código del centro de costo |
| `nombre_cc` | string | Nombre del centro de costo |
| `activo` | boolean | Si el empleado está activo |

### 4.2 Centros de Costo
| Campo | Tipo |
|---|---|
| `codigo` | string (PK) |
| `nombre` | string |

### 4.3 Usuarios del Sistema
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | |
| `nombre` | string | |
| `email` | string | Email corporativo (usado para auth) |
| `rol` | enum | supervisor / admin_contrato / jefe_operaciones / jefatura / admin |
| `centros_de_costo` | string[] | Códigos CC asignados |

### 4.4 Registros — Horas Extras
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | |
| `rut_empleado` | string | |
| `nombre_empleado` | string | |
| `codigo_cc` | string | |
| `nombre_cc` | string | |
| `cantidad_he` | integer | Número de horas extras |
| `motivo` | string | Texto libre |
| `fecha` | date | Fecha de las HE |
| `estado` | enum | pendiente / validado / rechazado |
| `registrado_por` | string | Email del usuario que registró |
| `fecha_registro` | timestamp | |
| `validado_por` | string | Email de quien validó (nullable) |
| `fecha_validacion` | timestamp | (nullable) |

### 4.5 Registros — Bonos
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid | |
| `rut_empleado` | string | |
| `nombre_empleado` | string | |
| `codigo_cc` | string | |
| `nombre_cc` | string | |
| `monto_bono` | integer | Monto en pesos CLP |
| `motivo` | string | Texto libre |
| `fecha` | date | Fecha del bono |
| `estado` | enum | pendiente / validado / rechazado |
| `registrado_por` | string | |
| `fecha_registro` | timestamp | |
| `validado_por` | string | (nullable) |
| `fecha_validacion` | timestamp | (nullable) |

---

## 5. Pantallas y Flujos

### 5.1 Pantalla de Login
- Autenticación con Microsoft (Azure AD / Microsoft Entra ID)
- Al ingresar se detecta el rol y los CC asignados automáticamente desde la BD
- Si el email no está registrado, se muestra mensaje de acceso denegado

---

### 5.2 Dashboard / Inicio
Menú principal según rol:

```
┌─────────────────────────────────────────┐
│  Logo SOMACOR          [Nombre usuario] │
├─────────────────────────────────────────┤
│                                         │
│    [ Registrar ]  [ Consultar ]         │
│                                         │
│    (solo jefatura y admin):             │
│    [ Validar ]    [ Administrar ]       │
│                                         │
└─────────────────────────────────────────┘
```

---

### 5.3 Flujo — Registrar

**Paso 1: Seleccionar Centro de Costo**
- Dropdown con los CC asignados al usuario (solo los suyos)
- Al seleccionar muestra el nombre del CC
- Botones: `Horas Extras` / `Bonos`

**Paso 2: Seleccionar Empleados y completar formulario**
- Panel izquierdo: Lista de empleados del CC seleccionado
  - Checkbox por empleado (nombre, RUT, cargo)
  - Checkbox "Seleccionar todo"
- Panel derecho: Formulario
  - Fecha (datepicker, por defecto hoy)
  - Cantidad HE (número) **o** Monto Bono en pesos (número)
  - Motivo (textarea, obligatorio)
  - Botón `Revisar`
- Validación: todos los campos obligatorios, al menos 1 empleado seleccionado

**Paso 3: Confirmar antes de enviar**
- Tabla resumen con todos los registros a crear:
  | Nombre | RUT | Fecha | HE / Bono | Motivo |
  |---|---|---|---|---|
- Botones: `Modificar` (vuelve al paso 2) / `Enviar`

**Paso 4: Confirmación de envío**
- Mensaje de éxito con resumen
- Los registros quedan en estado `pendiente`

---

### 5.4 Flujo — Consultar

**Filtros:**
- Centro de costo (dropdown, solo los del usuario; jefatura ve todos)
- Tipo: HE / Bonos / Ambos
- Rango de fechas (inicio – fin)
- Estado: todos / pendiente / validado

**Tabla de resultados:**
| Nombre | RUT | CC | HE / Bono | Motivo | Fecha | Estado | Acciones |
|---|---|---|---|---|---|---|---|

- Selección múltiple con checkboxes + "Seleccionar todo"
- Botón `Eliminar seleccionados` (solo registros en estado pendiente)
- Botón `Exportar a Excel` (genera .xlsx con los filtros aplicados)

---

### 5.5 Flujo — Validar _(solo Jefatura)_

- Misma vista que Consultar pero mostrando registros `pendiente` de todos los CC
- Selección múltiple
- Botones: `Validar seleccionados` / `Rechazar seleccionados`
- Al validar/rechazar se registra el email del validador y la fecha

---

### 5.6 Administración _(solo Admin sistema)_

#### Gestión de Usuarios
- Tabla de usuarios: nombre, email, rol, CC asignados
- Agregar / editar / desactivar usuarios
- Asignar centros de costo a cada usuario

#### Carga de Empleados (desde TALANA)
- Botón "Importar desde Excel"
- Sube el archivo .xlsx descargado de TALANA
- Preview de los datos antes de confirmar
- Actualiza empleados existentes (por RUT) y agrega nuevos
- Muestra resumen: X nuevos, X actualizados, X sin cambios

---

## 6. Stack Tecnológico Recomendado

### Frontend
| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | **React + TypeScript + Vite** | Estándar de la industria, tipado seguro |
| UI Components | **shadcn/ui + Tailwind CSS** | Diseño moderno, personalizable |
| Estado global | **Zustand** | Liviano, simple |
| Formularios | **React Hook Form + Zod** | Validación robusta |
| Tablas | **TanStack Table** | Tablas con filtros, sort y selección |
| Datepicker | **react-day-picker** | Liviano, en español |
| Auth | **@azure/msal-react** | Login con Microsoft (Azure AD) |
| HTTP Client | **Axios** | Llamadas a la API |
| Export Excel | **xlsx (SheetJS)** | Exportar registros a .xlsx |

### Backend
| Capa | Tecnología | Justificación |
|---|---|---|
| Runtime | **Node.js + Express** o **Azure Functions** | Integración natural con Azure |
| ORM | **Prisma** | Migraciones y tipado de BD |
| Validación | **Zod** | Compartido con frontend |
| Auth | **Azure AD token validation** | JWT de Microsoft |

### Base de Datos
**Opción A — Azure SQL Database** *(Recomendada)*
- Power BI con DirectQuery nativo (mejor que SharePoint)
- Consultas SQL complejas para reportes
- Backup automático
- Escalable

**Opción B — SharePoint Lists** *(Solo si se requiere compatibilidad 100% con setup actual)*
- Sin backend extra
- Conector Power BI disponible
- Limitado en consultas complejas

> **Recomendación:** Azure SQL Database. Power BI se conecta via DirectQuery con mejor rendimiento que SharePoint, y permite joins entre tablas HE y Bonos directamente.

### Infraestructura (Azure)
```
┌─────────────────────────────────────────────────────────┐
│  Azure                                                  │
│                                                         │
│  [Static Web Apps] ──► React App                        │
│  [App Service]     ──► API Node.js                      │
│  [Azure SQL]       ──► Base de datos                    │
│  [Azure AD]        ──► Autenticación                    │
│                                                         │
│  Power BI ──────────────► Azure SQL (DirectQuery)       │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Flujo de Datos — Empleados (TALANA → App)

```
TALANA (sistema RRHH)
      │
      │ Descarga manual .xlsx
      ▼
Administrador sube el Excel en la app
      │
      │ API procesa el archivo
      ▼
Azure SQL (tabla empleados) ──── actualiza / inserta por RUT
```

No hay sincronización automática en esta fase. El admin carga el Excel cuando hay cambios de dotación.

---

## 8. Flujo de Datos — Registros → Power BI

```
Supervisor/Admin registra HE o Bono
      │
      ▼
API → Azure SQL (tabla horas_extras o bonos)
      │
      ▼
Power BI (DirectQuery o Import mode)
      │
      ▼
Dashboard reportes mensuales por CC, tipo, estado
```

---

## 9. Diseño Visual — Lineamientos

- **Paleta de colores:** Azul marino SOMACOR `#1e3a5f` + blanco + grises neutros
- **Acento:** Azul medio `#3b5fa0` para botones primarios
- **Tipografía:** Inter (sans-serif, legible en tablas)
- **Estilo general:** Limpio, profesional, dashboard moderno (sin exceso de decoración)
- **Logo:** SOMACOR Servicios Integrales en header
- **Responsive:** Funcional en tablet y desktop (los supervisores pueden usar tablet en terreno)

---

## 10. Estructura de Rutas

```
/login
/                          → Dashboard (home con botones de acción)
/registrar
  /registrar/cc            → Selección de CC
  /registrar/horas-extras  → Formulario HE
  /registrar/bonos         → Formulario Bonos
  /registrar/confirmar     → Paso de confirmación
/consultar
  /consultar/horas-extras  → Tabla HE con filtros
  /consultar/bonos         → Tabla Bonos con filtros
/validar                   → (jefatura) Tabla pendientes para validar
/admin
  /admin/usuarios          → CRUD usuarios y permisos
  /admin/empleados         → Importar Excel desde TALANA
```

---

## 11. Fases de Desarrollo

### Fase 1 — MVP (funcionalidad equivalente a Power Apps)
- [ ] Setup del proyecto (React + Vite + TS + Tailwind + shadcn/ui)
- [ ] Auth con Azure AD (login / logout)
- [ ] Gestión de usuarios y permisos (panel admin)
- [ ] Importación de empleados desde Excel (TALANA)
- [ ] Registro de Horas Extras (flujo completo con confirmación)
- [ ] Registro de Bonos (flujo completo con confirmación)
- [ ] Consultar HE y Bonos (filtros + eliminar)
- [ ] Validar registros (jefatura)
- [ ] Conexión Azure SQL ↔ Power BI

### Fase 2 — Mejoras
- [ ] Exportar a Excel desde Consultar
- [ ] Dashboard con métricas (totales HE/bonos por CC y período)
- [ ] Historial de cambios / auditoría
- [ ] Notificaciones por email al validar

---

## 12. Preguntas Abiertas

1. **¿Cuántos centros de costo existen aprox.?** — Determina la complejidad del dropdown y los permisos.
2. **¿El Validar implica rechazo también, o solo aprobación?** — Para definir los estados posibles.
3. **¿Se pueden editar registros después de enviados?** — En Power Apps solo hay Modificar antes de Enviar.
4. **¿La Jefatura ve todos los CC o solo algunos?** — Para definir su scope de validación.
5. **¿Hay tenant de Azure AD disponible?** — El mismo de Microsoft 365 que usan actualmente sirve.
6. **¿Dónde se desplegará?** — Si ya tienen suscripción Azure o si se evalúa otra opción (Vercel + Railway, etc.).
