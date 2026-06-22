# Changelog — exportar_co_semanales

## 2026-06-19
- Creé la estructura del proyecto (carpetas datos/, scripts/, salidas/, changelog/).
- Creé el script exportar_reportes.ps1 (via API REST de PowerBI) - descartado porque
  la API exige capacidad Premium/Fabric dedicada y el workspace es Pro compartido.
- Cambio de enfoque: creé exportar_reportes_playwright.py que usa el navegador Chrome
  directamente para exportar via la UI de PowerBI, sin restriccion de licencia.
- Creé GUIA_PLAYWRIGHT.md con instrucciones de instalacion y uso paso a paso.
- Prueba exitosa: el script exporto 10 reportes PDF correctamente a la carpeta salidas/.
- Flujo confirmado: click en "Exportar" (barra) > "PDF" > "Exportar" (boton verde del dialogo).
- La sesion del navegador queda guardada en datos/sesion_browser/, no pide login la proxima vez.
