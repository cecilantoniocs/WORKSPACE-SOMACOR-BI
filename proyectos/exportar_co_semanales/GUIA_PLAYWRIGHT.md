# Guia completa - Exportar reportes PowerBI a PDF (via navegador)

Esta guia explica todo sobre el script `exportar_reportes_playwright.py`:
que hace, por que lo hace de esa forma, como usarlo y como resolver problemas.

El script abre Chrome automaticamente, entra a tu cuenta de PowerBI y descarga
todos los reportes del workspace **"C.O - Semanales"** como archivos PDF, igual
que si lo hicieras tu a mano, pero solo y de corrido.

---

## 1. Por que este metodo (y no la API)

Al principio se intento usar la **API oficial de PowerBI** (script `exportar_reportes.ps1`).
No funciono porque esa API exige que el workspace este en **capacidad Premium o Fabric
dedicada**. El workspace "C.O - Semanales" esta en **capacidad compartida (Pro)**, asi
que la API rechaza la exportacion con el error *"Report requested for export is not on
dedicated capacity"*.

Por eso se cambio a este metodo con **Playwright**, que controla un navegador real y
hace los mismos clics que haria una persona (Exportar > PDF > Exportar). Como usa la
interfaz normal de PowerBI, **no tiene restriccion de licencia** y funciona con la
cuenta Pro.

---

## 2. Que hace el script, paso a paso

El script funciona en 3 grandes pasos:

### Paso 1 - Abrir el navegador e iniciar sesion
- Abre Chrome usando una carpeta de sesion guardada (ver seccion 5).
- Entra al workspace "C.O - Semanales" en PowerBI.
- Si hay sesion guardada, entra solo. Si no, te da hasta **3 minutos** para que
  ingreses tu cuenta Microsoft en el navegador.
- Una vez dentro, espera **1 minuto** a que PowerBI termine de cargar.

### Paso 2 - Buscar todos los reportes
- PowerBI **no muestra todos los reportes de una vez**: los va cargando a medida que
  bajas con el scroll, y **borra de la pagina los que quedan arriba** (esto se llama
  "virtualizacion"). Por eso el script no puede simplemente leer la lista una vez.
- Para resolverlo, el script **baja poco a poco simulando la rueda del mouse** y va
  **guardando cada reporte apenas aparece en pantalla**, antes de que PowerBI lo borre.
- Asi arma la lista completa de los 25 reportes sin perder ninguno. Mientras lo hace,
  muestra en pantalla cuantos lleva acumulados.

### Paso 3 - Exportar cada reporte a PDF
Para cada reporte de la lista, el script:
1. Navega a la pagina del reporte y espera a que cargue (12 segundos).
2. Hace clic en **"Exportar"** (barra superior).
3. Selecciona **"PDF"** del menu.
4. En el cuadro que aparece, hace clic en el boton verde **"Exportar"**.
5. **Intercepta la descarga automaticamente** y guarda el PDF en la carpeta `salidas/`.
   > Importante: el cuadro de Windows "Guardar como" NO aparece. Playwright captura
   > el archivo antes y lo guarda solo, con el nombre exacto del reporte.

Al final muestra un **resumen** con cuantos se exportaron bien y cuantos fallaron.

---

## 3. El limite de Microsoft Fabric (importante)

Microsoft Fabric **no permite tener mas de 20 reportes abiertos a la vez** en una misma
sesion. Como el script abre un reporte tras otro, al llegar al numero 21 Fabric lo
bloquea y ese reporte (y los siguientes) fallan.

**Como lo resuelve el script:**
- Lleva la cuenta de cuantos reportes ha abierto la pestana actual.
- Al llegar a **15 reportes** (margen de seguridad antes del limite de 20), **cierra
  la pestana completa**. Cerrar la pestana cierra de golpe todos los PowerBI abiertos
  y libera el contador de Fabric.
- Abre una **pestana nueva y limpia** (la sesion se mantiene, no pide login de nuevo).
- **Continua exportando desde donde iba** (por ejemplo, el reporte 16). NO reinicia ni
  vuelve a exportar los que ya estaban listos.

Esto se nota en pantalla con el mensaje:
```
-- Limite de 15 reportes abiertos alcanzado.
-- Cerrando pestana para liberar los PowerBI abiertos...
-- Pestana nueva lista. Continuando la exportacion...
```

---

## 4. Como se llaman los archivos

Los PDF se guardan con **el nombre exacto del reporte en PowerBI**, sin fecha y con
espacios normales. Ejemplo:

```
Control Operacional 360 Semanal - ANGLO WEST WALL.pdf
```

> Nota: como no llevan fecha, si corres el script de nuevo los archivos se
> **sobreescriben** (se reemplazan por la version nueva). No se acumulan copias.

Quedan todos en:
```
c:\WORKSPACE SOMACOR\proyectos\exportar_co_semanales\salidas\
```

---

## 5. Donde queda guardada tu sesion

La primera vez que haces login, Chrome guarda tu sesion (cookies y datos de login) en:
```
c:\WORKSPACE SOMACOR\proyectos\exportar_co_semanales\datos\sesion_browser\
```

Gracias a eso, **las proximas veces el script entra solo sin pedir tu cuenta**.

Si algun dia te vuelve a pedir login, es normal: las sesiones de Microsoft expiran cada
cierto tiempo. Solo ingresas tu cuenta de nuevo en el navegador y el script continua.

---

## 6. Instalacion (solo la primera vez)

### Python
Descargalo desde https://www.python.org/downloads/ (version 3.10 o superior).
Durante la instalacion marca la opcion **"Add Python to PATH"**.

Para verificar, abre PowerShell o CMD y escribe:
```
python --version
```
Debe mostrar algo como "Python 3.11.x".

### Playwright (la libreria que controla el navegador)
Abre PowerShell o CMD y ejecuta estos dos comandos, uno por uno:
```
pip install playwright
```
```
playwright install chromium
```
El segundo descarga el navegador y puede tardar unos minutos.

---

## 7. Como ejecutar el script

**Paso 1** - Abre CMD o PowerShell
> Presiona `Windows + R`, escribe `cmd` (o `powershell`) y presiona Enter.

**Paso 2** - Pega este comando y presiona Enter:
```
python "c:\WORKSPACE SOMACOR\proyectos\exportar_co_semanales\scripts\exportar_reportes_playwright.py"
```

**Paso 3** - Se abre Chrome
> Si pide login, ingresa tu cuenta Microsoft. Si ya hay sesion, el script sigue solo.

**Paso 4** - Espera que termine
> Veras los reportes acumularse, luego exportarse uno a uno, y al final un resumen.
> No cierres ni minimices el navegador mientras trabaja.

**Paso 5** - Busca los PDF en la carpeta `salidas/`.

---

## 8. Si algo falla

| Que aparece | Que significa / que hacer |
|---|---|
| "python no se reconoce" | Python no esta instalado o sin PATH. Reinstalar marcando "Add to PATH". |
| "playwright no se reconoce" | Falta la libreria. Correr: `pip install playwright` |
| El navegador abre pero no hace nada | PowerBI esta cargando lento. Esperar; el script tiene esperas automaticas. |
| "No se encontraron reportes" | El workspace no cargo bien. Correr el script de nuevo. Se guarda una captura en `salidas/debug_workspace.png` para revisar. |
| Faltan reportes en la lista | El scroll no alcanzo a cargar todos. Volver a correr el script. |
| Algunos reportes fallan al final | Puede ser el limite de Fabric (ver seccion 3) o que un reporte tardo demasiado. Volver a correr para reintentar los que faltaron. |
| El login expiro | Ingresar la cuenta cuando el navegador lo pida. |

---

## 9. Preguntas frecuentes

**El script tarda mucho, es normal?**
Si. Playwright abre un navegador real y espera a que PowerBI cargue cada reporte
(unos 12-15 segundos por reporte). Con 25 reportes puede tardar entre 8 y 12 minutos.
Es normal.

**Puedo usar el computador mientras corre?**
Si, pero **no cierres ni minimices la ventana del navegador** que abrio el script.
Playwright necesita la pagina visible para hacer los clics.

**Cuantas veces puedo correrlo?**
Las que quieras. Cada vez reemplaza los PDF anteriores con la version nueva.

**Donde puedo ver el detalle tecnico de los cambios?**
En `changelog/CHANGELOG.md`, ordenado por fecha.

---

## 10. Parametros que se pueden ajustar

Si en el futuro hay que afinar el script, estos valores estan al inicio del archivo
`scripts/exportar_reportes_playwright.py` y se pueden cambiar facil:

| Parametro | Que controla | Valor actual |
|---|---|---|
| `ESPERA_CARGA` | Segundos que espera a que cargue cada reporte | 12 |
| `TIMEOUT_LOGIN` | Segundos maximos para hacer login | 180 (3 min) |
| `TIMEOUT_PDF` | Segundos maximos esperando que se genere el PDF | 120 (2 min) |
| `LIMITE_ABIERTOS` | Reportes abiertos antes de reciclar la pestana | 15 |
| `WORKSPACE_ID` | ID del workspace de PowerBI a exportar | ab83f335-...403d |
