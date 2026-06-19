# Exportar reportes PowerBI a PDF - via navegador (Playwright)

Este es el metodo que funciona con licencia Pro sin necesitar permisos de empresa.
El script abre Chrome automaticamente, entra a tu cuenta PowerBI, y descarga
cada reporte como PDF, igual que si lo hicieras tu a mano pero solo.

---

## Por que este metodo y no el anterior

El script anterior (exportar_reportes.ps1) usaba la API de PowerBI, que exige
capacidad Premium o Fabric dedicada. Tu workspace esta en capacidad compartida (Pro),
asi que la API rechaza la solicitud.

Este script usa el navegador directamente: hace clic en "Exportar > PDF" igual
que lo harias tu. Eso no tiene restriccion de licencia.

---

## Lo que necesitas instalar (solo una vez)

### 1. Python
Si no tienes Python instalado, descargalo desde https://www.python.org/downloads/
Instala la version 3.10 o superior. Durante la instalacion, marca la opcion
"Add Python to PATH".

Para verificar que quedo bien, abre PowerShell y escribe:
```
python --version
```
Debe mostrar algo como "Python 3.11.x"

### 2. Playwright (la libreria que controla el navegador)

Abre PowerShell y ejecuta estos dos comandos, uno por uno:

```powershell
pip install playwright
```

```powershell
playwright install chromium
```

El segundo comando descarga el navegador Chromium (puede tardar unos minutos).

---

## Como ejecutar el script

**Paso 1** - Abre PowerShell
> Presiona Windows + R, escribe "powershell", presiona Enter.

**Paso 2** - Ejecuta el script:

```powershell
python "c:\WORKSPACE SOMACOR\proyectos\exportar_co_semanales\scripts\exportar_reportes_playwright.py"
```

**Paso 3** - Se abre Chrome automaticamente
> El script abre el navegador y va directamente a tu workspace de PowerBI.
> Si es la primera vez que lo corres, te va a pedir login con tu cuenta Microsoft.
> Ingresa tu usuario y contrasena normalmente. El navegador guarda la sesion,
> asi que las proximas veces NO te pide login de nuevo.

**Paso 4** - Espera que termine
> El script navega a cada reporte, lo exporta y descarga el PDF.
> En PowerShell vas a ver mensajes como:
>
> ```
> Exportando: Reporte Semanal KPIs...
>   Cargando reporte (espera 10s)...
>   OK - guardado: 2026-06-19_Reporte_Semanal_KPIs.pdf
> ```

**Paso 5** - Busca los PDF
> Al terminar aparece un resumen y los archivos quedan en:
> ```
> c:\WORKSPACE SOMACOR\proyectos\exportar_co_semanales\salidas\
> ```

---

## Donde queda guardada la sesion del navegador

La primera vez que haces login, Chrome guarda tu sesion en:
```
c:\WORKSPACE SOMACOR\proyectos\exportar_co_semanales\datos\sesion_browser\
```

Esa carpeta guarda las cookies y el login. Las proximas veces que corras el script,
el navegador ya esta con sesion iniciada y va directo a exportar.

Si algun dia el script te pide login de nuevo, es normal: las sesiones de Microsoft
expiran cada cierto tiempo. Solo vuelves a ingresar usuario y contrasena y listo.

---

## Si algo falla

| Que aparece | Que hacer |
|---|---|
| "python no se reconoce" | Python no esta instalado o no se agrego al PATH (reinstalar con "Add to PATH" marcado) |
| "playwright no se reconoce" | Correr: pip install playwright |
| El navegador abre pero no hace nada | Esperar un poco mas, PowerBI puede tardar en cargar |
| "No se encontraron reportes" | El workspace cargo sin reportes visibles, correr el script de nuevo |
| El login expiro | Ingresar usuario y contrasena cuando el navegador lo pida |

---

## Preguntas frecuentes

**El script tarda mucho, es normal?**
Si. Playwright abre un navegador real, navega y espera que PowerBI cargue (10-15 segundos
por reporte). Con varios reportes puede tardar 2-5 minutos en total. Es normal.

**Puedo hacer otras cosas mientras corre?**
Si, pero no cierres ni minimices la ventana del navegador que abrio el script.
Playwright necesita ver la pagina para hacer los clics.

**Cuantas veces puedo correrlo?**
Las veces que quieras. Cada vez genera los PDF con la fecha del dia en el nombre.
Si lo corres dos veces el mismo dia, los archivos se sobreescriben.
