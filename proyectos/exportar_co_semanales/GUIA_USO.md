# Cómo exportar los reportes de PowerBI a PDF

Esta guía explica paso a paso cómo usar el script para exportar los reportes del
workspace **"C.O - Semanales"** a archivos PDF.

---

## ¿Qué hace el script?

1. Abre tu navegador para que entres con tu cuenta Microsoft (igual que cuando entras a office.com)
2. Se conecta automáticamente al workspace **"C.O - Semanales"** en PowerBI
3. Exporta **todos** los reportes que hay ahí a formato PDF
4. Los guarda en tu computador con la fecha del día en el nombre

---

## ¿Dónde quedan los PDF?

Los archivos quedan en esta carpeta de tu computador:

```
c:\WORKSPACE SOMACOR\proyectos\exportar_co_semanales\salidas\
```

Los nombres de los archivos son así:
```
2026-06-19_Nombre_Del_Reporte.pdf
```

---

## Preparación (solo la primera vez)

Antes de correr el script por primera vez hay que hacer dos cosas:

### 1. Habilitar ejecución de scripts en Windows

Abre PowerShell **como Administrador** (clic derecho en el ícono → "Ejecutar como administrador")
y pega este comando:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Cuando pregunte, escribe `S` y Enter.

### 2. Instalar el módulo de PowerBI

En la misma ventana, pega esto:

```powershell
Install-Module -Name MicrosoftPowerBIMgmt -Scope CurrentUser -Force
```

Si pregunta si confías en el repositorio, escribe `S` y Enter. Espera que termine (puede tardar
un par de minutos).

---

## Cómo correr el script (cada vez que lo necesites)

**Paso 1** — Abre PowerShell
> Presiona `Windows + R`, escribe `powershell` y presiona Enter.
> Aparece una ventana azul o negra con texto.

**Paso 2** — Pega este comando y presiona Enter:

```powershell
& "c:\WORKSPACE SOMACOR\proyectos\exportar_co_semanales\scripts\exportar_reportes.ps1"
```

**Paso 3** — Haz login en el navegador
> Se abre Chrome o Edge automáticamente. Entra con tu cuenta Microsoft (usuario y contraseña
> de Somacor). Cuando te pida confirmación, acepta.

**Paso 4** — Espera que termine
> En la ventana de PowerShell van apareciendo mensajes como:
> ```
> Exportando: Reporte Semanal...
>   Esperando... Running (50%) — 10s
>   OK — guardado como: 2026-06-19_Reporte_Semanal.pdf
> ```
> Al final aparece un resumen con cuántos archivos se exportaron.

**Paso 5** — Busca los PDF
> Ve a la carpeta `salidas\` y ahí están los archivos.

---

## Si algo falla

| Mensaje de error | Qué hacer |
|---|---|
| "no se reconoce el nombre" | Falta instalar el módulo (ver Preparación, paso 2) |
| "no tiene acceso" | Verificar que tu cuenta tiene acceso al workspace en PowerBI |
| "tiempo de espera agotado" | El reporte es muy grande, volver a correr el script |
| El navegador no abre | Correr el script de nuevo |

---

## Preguntas frecuentes

**¿Tengo que instalar el módulo cada vez?**
No, solo la primera vez.

**¿Tengo que hacer login cada vez?**
Sí, cada vez que corras el script te va a pedir que entres con tu cuenta. Es por seguridad.

**¿Se borran los PDF anteriores?**
No. Cada vez que exportas se crean archivos nuevos con la fecha del día. Los anteriores
quedan guardados.

**¿Qué pasa si corro el script dos veces el mismo día?**
Los archivos se sobreescriben (quedan los de la segunda vez). No se duplican.
