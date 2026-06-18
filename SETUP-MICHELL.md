# 🛠️ Configuración del computador de Michell — Repo Puente (workspace-somacor-bi)

Esta guía es para hacerla **una sola vez**, juntos, en la reunión. Sigue los pasos
**en orden**. Copia y pega los comandos tal cual. No te saltes ninguno.

> 💡 Trabajamos en **una sola carpeta**: la que Michell ya tiene, `C:\workspace somacor`.
> No se crea ninguna carpeta nueva ni se copian archivos: esa misma carpeta se conecta
> al repo puente y empieza a subir sola.
>
> ⚠️ OJO: esa carpeta tiene un **espacio** en el nombre (`workspace somacor`), por eso en
> los comandos la ruta va **siempre entre comillas dobles** `"..."`. No las quites.

> 💡 Al final, Michell **NO vuelve a usar git nunca más**: solo abre su editor, trabaja
> y guarda. Cada 10 minutos el computador sube los cambios solo.

---

## ✅ Antes de empezar

Necesitas:
- El **usuario y clave de GitHub de Michell** (la cuenta que ya está invitada como
  colaboradora al repo `workspace-somacor-bi`).
- El **correo de GitHub de Michell**.
- La contraseña del **usuario de Windows** de Michell (la pedirá el Paso 6).
- Conexión a internet.

---

## Paso 1 — Instalar Git y GitHub CLI

Abre **PowerShell normal** (menú Inicio → escribe "PowerShell" → Enter) y pega esto:

```powershell
winget install --id Git.Git -e --source winget
winget install --id GitHub.cli -e --source winget
```

➡️ **Cierra PowerShell y vuelve a abrirlo** (obligatorio para que reconozca los
programas recién instalados). Si no reinicias la ventana, `git` y `gh` van a tirar
error de "no se reconoce".

Para confirmar, en la **ventana nueva** pega:

```powershell
git --version
gh --version
```

Si ambos muestran un número de versión, vamos bien. 👍

---

## Paso 2 — Decirle a git quién es Michell

Pega estos dos comandos (cambia el nombre y el correo por los de Michell):

```powershell
git config --global user.name "Michell Apellido"
git config --global user.email "correo-de-michell@gmail.com"
```

> Usa el **mismo correo** que tiene la cuenta de GitHub de Michell.

---

## Paso 3 — Conectar la cuenta de GitHub (login con navegador)

Pega:

```powershell
gh auth login
```

Te va a hacer preguntas con flechitas ⬆️⬇️ y Enter. Elige así:

1. **What account do you want to log into?** → `GitHub.com`
2. **What is your preferred protocol for Git operations?** → `HTTPS`
3. **Authenticate Git with your GitHub credentials?** → `Yes` (¡importante! esto deja
   guardadas las credenciales para que el subir-automático funcione sin pedir clave)
4. **How would you like to authenticate?** → `Login with a web browser`
5. Te muestra un **código** (anótalo) y abre el navegador. Pega el código, inicia
   sesión con la cuenta de Michell y autoriza.

Para confirmar, pega:

```powershell
gh auth status
```

Debe decir algo como "Logged in to github.com as ...". 👍

---

## Paso 4 — Conectar la carpeta de Michell al repo puente

Aquí tomamos la carpeta que Michell **ya tiene** (`C:\workspace somacor`) y la conectamos
al repo puente. **No se borra nada de lo que ella ya tiene adentro.**

Pega los comandos uno por uno (fíjate en las **comillas** por el espacio del nombre):

```powershell
cd "C:\workspace somacor"
git init
git branch -M main
git remote add origin https://github.com/cecilantoniocs/workspace-somacor-bi.git
git fetch origin
git pull origin main --allow-unrelated-histories
```

> Qué hace esto, en simple:
> - `git init` → convierte su carpeta en un repo de git.
> - `git remote add origin ...` → la conecta con el repo puente en GitHub.
> - `git pull ... --allow-unrelated-histories` → baja los archivos base que ya están en
>   el puente (`CLAUDE.md`, `.gitignore`, `auto-sync.ps1`, etc.) y los junta con lo que
>   Michell ya tenía en la carpeta.

> ⚠️ Si git avisa de un **conflicto de archivos** (que un archivo del puente y uno suyo
> se llaman igual), no fuercen nada: que **Claude** lo resuelva en el momento.

---

## Paso 5 — Ordenar el trabajo de Michell

Con la carpeta ya conectada, hay que dejar el trabajo de Michell **ordenado** según las
reglas del proyecto (las define el archivo `CLAUDE.md` que se acaba de bajar):

- Cada proyecto va en su propia carpeta dentro de `proyectos/<nombre_del_proyecto>/`.
- Cada proyecto lleva su archivo `PLAN.md` bien documentado.
- Nombres **sin tildes, sin espacios, con guión bajo `_` y en minúsculas**.

👉 De esto se encarga **Claude**: pídele que ordene tu trabajo actual dentro de
`proyectos/` siguiendo el `CLAUDE.md`. Él arma las carpetas, los `PLAN.md` y va moviendo
tus archivos. Tú solo le dices qué es cada cosa.

---

## Paso 6 — Revisar qué se va a subir (rápido)

Antes de prender la subida automática, una mirada rápida para no subir cosas que no
deben (claves, archivos enormes):

```powershell
cd "C:\workspace somacor"
git status
```

Si aparece algún archivo con contraseñas o datos personales, avísale a Claude para
agregarlo al `.gitignore` antes de seguir. (Los `.env` y logs ya están ignorados.)

---

## Paso 7 — Registrar la tarea automática (cada 10 minutos)

Aquí dejamos programado que Windows ejecute el `auto-sync.ps1` solo, cada 10 minutos.
Lo hacemos **por terminal** (sin abrir el Programador de Tareas).

### 7.1 — Abrir PowerShell COMO ADMINISTRADOR

Menú Inicio → escribe "PowerShell" → **clic derecho** sobre "Windows PowerShell" →
**"Ejecutar como administrador"**. Acepta el aviso de Windows. La ventana debe decir
**"Administrador"** en el título.

### 7.2 — Crear la tarea

Pega este comando **completo, en una sola línea**. Fíjate que la ruta del script va con
comillas **escapadas** `\"` por dentro (por el espacio del nombre):

```powershell
schtasks /create /tn "AutoSync-Somacor-BI" /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File \"C:\workspace somacor\auto-sync.ps1\"" /sc minute /mo 10 /st 09:00 /ru "%USERNAME%"
```

> Qué significa, en simple:
> - `/tn` → nombre de la tarea: **AutoSync-Somacor-BI**
> - `/tr` → lo que ejecuta: PowerShell corriendo el script, **sin ventana** (`Hidden`)
> - `/sc minute /mo 10` → **cada 10 minutos**
> - `/st 09:00` → empieza a las 9:00 AM
> - `/ru "%USERNAME%"` → corre con el usuario de Michell

Si te pide contraseña, ingresa la del **usuario de Windows** de Michell.

### 7.3 — Verificar que quedó creada

```powershell
schtasks /query /tn "AutoSync-Somacor-BI"
```

Debe aparecer la tarea en la lista. 👍

### 7.4 — Probarla al toque (sin esperar 10 minutos)

```powershell
schtasks /run /tn "AutoSync-Somacor-BI"
```

Esto la ejecuta de inmediato. Para ver que funcionó, revisa el registro:

```powershell
Get-Content "C:\workspace somacor\auto-sync.log" -Tail 10
```

Deberías ver una línea con "OK: ..." y la fecha/hora.

### 7.5 — Borrar la tarea (SOLO si hace falta rehacerla)

```powershell
schtasks /delete /tn "AutoSync-Somacor-BI" /f
```

---

## 🎉 Listo

Desde ahora, **Michell solo tiene que**:

1. Abrir su editor.
2. Trabajar en los archivos dentro de **`C:\workspace somacor`**.
3. **Guardar** (Ctrl + S).

El computador sube todo solo cada 10 minutos. **Michell NO escribe ningún comando de
git nunca más.** ✋

---

## 🆘 Si algo falla

- Revisa el archivo **`C:\workspace somacor\auto-sync.log`**: ahí queda escrito cada
  intento y cualquier error.
- Si dice **"conflicto"** o **"pull --rebase fallo"**: no toques nada y avísale a Cecil.
  El script está hecho para detenerse solo y no romper nada en ese caso.

---

## 👤 Para Cecil — cómo reviso los avances de Michell

En **tu** máquina tienes tu propia copia del puente en `C:\workspace-somacor-bi`. Para
ver lo último que subió Michell, abre PowerShell y corre:

```powershell
git -C C:\workspace-somacor-bi pull
```

Eso baja sus avances para revisarlos. Lo que te sirva, lo copias **a mano** a tu
producción (`C:\WORKSPACE`). Nunca conectes tu producción con el puente.
