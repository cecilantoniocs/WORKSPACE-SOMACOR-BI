# Exportar C.O - Semanales

## Objetivo
Exportar automáticamente todos los reportes del workspace "C.O - Semanales" de Microsoft
Fabric/PowerBI a formato PDF, guardándolos en la carpeta `salidas/` con la fecha del día
en el nombre del archivo.

## Alcance
- **Incluye:** exportar todos los reportes del workspace a PDF, con login interactivo
  (el usuario hace login una vez por sesión en el navegador).
- **No incluye:** ejecución completamente automática sin intervención humana (eso requiere
  credenciales de app en Azure AD, que no está configurado).

## Estructura de carpetas
```
exportar_co_semanales/
├── PLAN.md         <- este archivo
├── datos/          <- vacío por ahora (no se necesitan insumos externos)
├── scripts/
│   └── exportar_reportes.ps1  <- script principal a ejecutar
├── salidas/        <- aquí se guardan los PDF exportados (nombre: fecha_reporte.pdf)
└── changelog/
    └── CHANGELOG.md
```

## Requisitos
- Windows con PowerShell 5.1 o superior
- Módulo `MicrosoftPowerBIMgmt` (el script lo instala solo si no está)
- Cuenta Microsoft con licencia Power BI Pro o Fabric
- Acceso al workspace "C.O - Semanales" (ID: ab83f335-7756-4fc0-8e2c-00246483403d)
- Conexión a internet

## Cómo usarlo
1. Abrir PowerShell (puede ser desde VS Code o directamente)
2. Navegar a la carpeta `scripts/` o ejecutar desde cualquier lugar con la ruta completa
3. Ejecutar:
   ```powershell
   .\scripts\exportar_reportes.ps1
   ```
4. Se abre el navegador para hacer login con tu cuenta Microsoft — ingresar usuario y contraseña
5. El script exporta todos los reportes del workspace y los guarda en `salidas/`
6. Al terminar, muestra un resumen con los archivos generados

## Estado
LISTO PARA REVISAR — script probado exitosamente. Exporto 10 reportes PDF el 2026-06-19.
Pendiente: probar con todos los reportes del workspace y validar que funcione en proximas ejecuciones.

## Notas / pendientes
- Si un reporte tiene muchas páginas o datos, la exportación puede tardar hasta 2 minutos
  por reporte. El script espera automáticamente.
- Los PDF se guardan con el nombre: `AAAA-MM-DD_nombre_reporte.pdf`
- Si el módulo `MicrosoftPowerBIMgmt` no está instalado, el script lo instala solo la
  primera vez (requiere conexión a internet).
- Workspace ID hardcodeado: `ab83f335-7756-4fc0-8e2c-00246483403d`
