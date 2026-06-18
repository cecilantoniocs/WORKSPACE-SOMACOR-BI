# 🛠️ Configuración del computador de Michell — Repo Puente (workspace-somacor-bi)

Esta guía es para hacerla **una sola vez**, juntos, en la reunión. Sigue los pasos
**en orden**. Copia y pega los comandos tal cual. No te saltes ninguno.

> 💡 Al final de esta guía, Michell **NO vuelve a usar git nunca más**: solo abre su
> editor, trabaja y guarda. Cada 10 minutos el computador sube los cambios solo.

---

## ✅ Antes de empezar

Necesitas:
- El **usuario y clave de GitHub de Michell** (la cuenta que ya está invitada como
  colaboradora al repo `workspace-somacor-bi`).
- El **correo de GitHub de Michell**.
- Conexión a internet.

---

## Paso 1 — Instalar Git y GitHub CLI

Abre **PowerShell normal** (menú Inicio → escribe "PowerShell" → Enter) y pega esto:

```powershell
winget install --id Git.Git -e --source winget
winget install --id GitHub.cli -e --source winget
```

➡️ **Cierra PowerShell y vuelve a abrirlo** (esto es obligatorio para que reconozca
los programas recién instalados). Si no reinicias la ventana, los comandos `git` y
`gh` van a tirar error de "no se reconoce".

Para confirmar que quedaron instalados, en la **ventana nueva** pega:

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

Cuando termine, para confirmar pega:

```powershell
gh auth status
```

Debe decir algo como "Logged in to github.com as ...". 👍

---

## Paso 4 — Bajar (clonar) el repo puente

Pega:

```powershell
git clone https://github.com/cecilantoniocs/workspace-somacor-bi.git C:\workspace-somacor-bi
```

Esto crea la carpeta **`C:\workspace-somacor-bi`** con todo adentro (incluido el
script `auto-sync.ps1`). **Esa es la carpeta donde Michell va a trabajar siempre.**

---

## Paso 5 — Registrar la tarea automática (cada 10 minutos)

Aquí dejamos programado que Windows ejecute el `auto-sync.ps1` solo, cada 10 minutos.
Lo hacemos **por terminal** (sin abrir ninguna ventana del Programador de Tareas).

### 5.1 — Abrir PowerShell COMO ADMINISTRADOR

Menú Inicio → escribe "PowerShell" → **clic derecho** sobre "Windows PowerShell" →
**"Ejecutar como administrador"**. Acepta el aviso de Windows. La ventana debe decir
**"Administrador"** en el título.

### 5.2 — Crear la tarea

Pega este comando **completo, en una sola línea**:

```powershell
schtasks /create /tn "AutoSync-Somacor-BI" /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\workspace-somacor-bi\auto-sync.ps1" /sc minute /mo 10 /st 09:00 /ru "%USERNAME%"
```

> Qué significa, en simple:
> - `/tn` → nombre de la tarea: **AutoSync-Somacor-BI**
> - `/tr` → lo que ejecuta: PowerShell corriendo el script, **sin ventana** (`Hidden`)
> - `/sc minute /mo 10` → **cada 10 minutos**
> - `/st 09:00` → empieza a las 9:00 AM
> - `/ru "%USERNAME%"` → corre con el usuario de Michell

Si te pide contraseña, ingresa la del usuario de Windows de Michell.

### 5.3 — Verificar que quedó creada

```powershell
schtasks /query /tn "AutoSync-Somacor-BI"
```

Debe aparecer la tarea en la lista. 👍

### 5.4 — Probarla al toque (sin esperar 10 minutos)

```powershell
schtasks /run /tn "AutoSync-Somacor-BI"
```

Esto la ejecuta de inmediato. Para ver que funcionó, revisa el registro:

```powershell
Get-Content C:\workspace-somacor-bi\auto-sync.log -Tail 10
```

Deberías ver una línea con "OK: ..." y la fecha/hora.

### 5.5 — Borrar la tarea (SOLO si hace falta rehacerla)

```powershell
schtasks /delete /tn "AutoSync-Somacor-BI" /f
```

---

## 🎉 Listo

Desde ahora, **Michell solo tiene que**:

1. Abrir su editor.
2. Trabajar en los archivos dentro de **`C:\workspace-somacor-bi`**.
3. **Guardar** (Ctrl + S).

El computador sube todo solo cada 10 minutos. **Michell NO escribe ningún comando de
git nunca más.** ✋

---

## 🆘 Si algo falla

- Revisa el archivo **`C:\workspace-somacor-bi\auto-sync.log`**: ahí queda escrito
  cada intento y cualquier error.
- Si dice **"conflicto"** o **"pull --rebase fallo"**: no toques nada y avísale a
  Cecil. El script está hecho para detenerse solo y no romper nada en ese caso.
