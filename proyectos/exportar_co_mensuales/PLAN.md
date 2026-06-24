# Exportar C.O - Mensuales

## Objetivo
Exportar todos los reportes del workspace "C.O - Mensuales" de Microsoft Fabric/PowerBI
a formato PDF, guardándolos en la carpeta `salidas/` con el nombre exacto del reporte.

## Alcance
- **Incluye:** exportar todos los reportes del workspace a PDF, controlando el navegador
  Chrome con Playwright (hace los mismos clics que una persona: Exportar > PDF > Exportar).
- **No incluye:** ejecución completamente automática sin intervención humana. El usuario
  debe correr el script manualmente; el navegador queda con sesión guardada para no pedir
  login cada vez.

## Por qué Playwright y no la API de PowerBI
La API oficial exige capacidad **Premium/Fabric dedicada**. El workspace está en capacidad
**Pro compartida**, así que la API rechaza la exportación. Por eso se usa Playwright,
que usa la interfaz normal de PowerBI y no tiene restricción de licencia.

## Estructura de carpetas
```
exportar_co_mensuales/
├── PLAN.md                 <- este archivo (documentación del proyecto)
├── GUIA_PLAYWRIGHT.md      <- guía de uso paso a paso para el usuario
├── datos/
│   └── sesion_browser/     <- sesión guardada de Chrome (login de PowerBI)
├── scripts/
│   └── exportar_reportes_playwright.py  <- SCRIPT PRINCIPAL (el que se usa)
├── salidas/                <- aquí se guardan los PDF exportados
└── changelog/
    └── CHANGELOG.md
```

## Requisitos
- Windows con Python 3.10 o superior (marcado "Add to PATH" al instalar)
- Librería `playwright` (`pip install playwright` y luego `playwright install chromium`)
- Cuenta Microsoft con acceso al workspace "C.O - Mensuales"
- Acceso al workspace (ID: 8d1feccb-ce91-445f-bca4-bf45815f0e24)
- Conexión a internet

## Cómo usarlo
1. Abrir CMD o PowerShell
2. Ejecutar:
   ```
   python "c:\WORKSPACE SOMACOR\proyectos\exportar_co_mensuales\scripts\exportar_reportes_playwright.py"
   ```
3. Se abre Chrome. Si pide login, ingresar la cuenta Microsoft (solo la primera vez).
4. El script busca todos los reportes, los exporta a PDF y los guarda en `salidas/`.
5. Al terminar muestra un resumen.

> La guía detallada paso a paso está en `GUIA_PLAYWRIGHT.md`.

## Estado
LISTO PARA REVISAR — el script está armado igual que el de C.O Semanales, apuntando al
workspace "C.O - Mensuales". Falta la primera corrida de prueba para confirmar que exporta
bien (la primera vez pedirá login de Microsoft en el navegador).

## Notas / pendientes
- Los PDF se guardan con el nombre exacto del reporte en PowerBI (sin fecha, con espacios).
  Ejemplo: `Control Operacional 360 Mensual - ANGLO WEST WALL.pdf`.
- Como no llevan fecha, al correr el script de nuevo los archivos se sobreescriben.
- Microsoft Fabric limita a 20 reportes abiertos por sesión. El script cierra y reabre la
  pestaña cada 15 reportes para liberar ese contador y seguir desde donde iba.
- Workspace ID fijo en el script: `8d1feccb-ce91-445f-bca4-bf45815f0e24`
