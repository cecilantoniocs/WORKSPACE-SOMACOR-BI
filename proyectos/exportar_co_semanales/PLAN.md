# Exportar C.O - Semanales

## Objetivo
Exportar todos los reportes del workspace "C.O - Semanales" de Microsoft Fabric/PowerBI
a formato PDF, guardándolos en la carpeta `salidas/` con el nombre exacto del reporte.

## Alcance
- **Incluye:** exportar todos los reportes del workspace a PDF, controlando el navegador
  Chrome con Playwright (hace los mismos clics que una persona: Exportar > PDF > Exportar).
- **No incluye:** ejecución completamente automática sin intervención humana. El usuario
  debe correr el script manualmente; el navegador queda con sesión guardada para no pedir
  login cada vez.

## Por qué Playwright y no la API de PowerBI
Primero se intentó con la API oficial (script `exportar_reportes.ps1`, ya descartado),
pero esa API exige capacidad **Premium/Fabric dedicada**. El workspace está en capacidad
**Pro compartida**, así que la API rechaza la exportación. Por eso se cambió a Playwright,
que usa la interfaz normal de PowerBI y no tiene restricción de licencia.

## Estructura de carpetas
```
exportar_co_semanales/
├── PLAN.md                 <- este archivo (documentación del proyecto)
├── GUIA_PLAYWRIGHT.md      <- guía de uso paso a paso para el usuario
├── datos/
│   └── sesion_browser/     <- sesión guardada de Chrome (login de PowerBI)
├── scripts/
│   ├── exportar_reportes_playwright.py  <- SCRIPT PRINCIPAL (el que se usa)
│   └── exportar_reportes.ps1            <- script viejo por API (descartado, no usar)
├── salidas/                <- aquí se guardan los PDF exportados
└── changelog/
    └── CHANGELOG.md
```

## Requisitos
- Windows con Python 3.10 o superior (marcado "Add to PATH" al instalar)
- Librería `playwright` (`pip install playwright` y luego `playwright install chromium`)
- Cuenta Microsoft con acceso al workspace "C.O - Semanales"
- Acceso al workspace (ID: ab83f335-7756-4fc0-8e2c-00246483403d)
- Conexión a internet

## Cómo usarlo
1. Abrir CMD o PowerShell
2. Ejecutar:
   ```
   python "c:\WORKSPACE SOMACOR\proyectos\exportar_co_semanales\scripts\exportar_reportes_playwright.py"
   ```
3. Se abre Chrome. Si pide login, ingresar la cuenta Microsoft (solo la primera vez).
4. El script busca todos los reportes, los exporta a PDF y los guarda en `salidas/`.
5. Al terminar muestra un resumen.

> La guía detallada paso a paso está en `GUIA_PLAYWRIGHT.md`.

## Estado
LISTO PARA REVISAR — el script exporta los reportes correctamente.
Pendiente: resolver el límite de Microsoft Fabric (no permite más de 20 reportes abiertos
a la vez), que hace fallar algunos de los últimos reportes cuando son más de 20.

## Notas / pendientes
- Los PDF se guardan con el nombre exacto del reporte en PowerBI (sin fecha, con espacios).
  Ejemplo: `Control Operacional 360 Semanal - ANGLO WEST WALL.pdf`.
- Como no llevan fecha, al correr el script de nuevo los archivos se sobreescriben.
- PENDIENTE: Microsoft Fabric limita a 20 reportes abiertos por sesión. Con 25 reportes,
  los últimos fallan. La solución en evaluación es refrescar la pestaña del navegador
  cada cierto número de reportes para liberar el contador de Fabric.
- Workspace ID fijo en el script: `ab83f335-7756-4fc0-8e2c-00246483403d`
