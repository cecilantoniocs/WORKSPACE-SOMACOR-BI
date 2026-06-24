"""
exportar_reportes_playwright.py

Abre Chrome, entra a PowerBI con tu cuenta Microsoft y exporta todos los
reportes del workspace "C.O - Mensuales" a PDF.

Uso:
    python exportar_reportes_playwright.py
"""

from playwright.sync_api import sync_playwright
from pathlib import Path
from datetime import datetime
import re
import sys
import time

# === CONFIGURACION ===
WORKSPACE_ID  = "8d1feccb-ce91-445f-bca4-bf45815f0e24"
WORKSPACE_URL = f"https://app.powerbi.com/groups/{WORKSPACE_ID}/list?experience=power-bi"

BASE_DIR       = Path(__file__).parent.parent
CARPETA_SESION = BASE_DIR / "datos" / "sesion_browser"
CARPETA_SALIDA = BASE_DIR / "salidas"

ESPERA_CARGA   = 12    # segundos que espera a que cargue cada reporte
TIMEOUT_LOGIN  = 180   # segundos maximos para que el usuario haga login
TIMEOUT_PDF    = 120   # segundos maximos esperando que se genere el PDF
LIMITE_ABIERTOS = 15   # tras exportar estos reportes, cerrar la pestana y abrir una nueva
                       # (Fabric no permite mas de 20 reportes abiertos a la vez)


# ─── UTILIDADES ───────────────────────────────────────────────────────────────

def limpiar_nombre(nombre: str) -> str:
    return re.sub(r"[^\w\s-]", "", nombre).strip()


def click_primero_visible(page, selectores: list, espera_ms=3000) -> bool:
    """Hace click en el primer elemento de la lista que este visible."""
    for sel in selectores:
        try:
            elem = page.locator(sel).first
            elem.wait_for(state="visible", timeout=espera_ms)
            elem.click()
            return True
        except Exception:
            pass
    return False


# ─── OBTENER LISTA DE REPORTES DEL WORKSPACE ──────────────────────────────────

def obtener_reportes(page) -> list:
    """Extrae IDs y nombres de los reportes desde la pagina del workspace."""

    # Esperar que la pagina termine de navegar/redirigir
    try:
        page.wait_for_load_state("networkidle", timeout=20000)
    except Exception:
        pass

    time.sleep(5)

    # Scroll progresivo acumulando reportes a medida que aparecen en pantalla
    # (PowerBI borra del DOM los items que quedan fuera de la vista)
    reportes_acumulados = {}

    try:
        page.mouse.click(800, 400)
        time.sleep(1)

        sin_cambios = 0

        for _ in range(30):
            # Capturar los reportes visibles en este momento
            visibles = page.evaluate("""
                () => {
                    const links = document.querySelectorAll('a[href*="/reports/"]');
                    const lista = [];
                    links.forEach(link => {
                        const match = link.href.match(/\\/reports\\/([a-f0-9\\-]{36})/);
                        if (!match) return;
                        let nombre = (link.textContent || "").replace(/\\s+/g, " ").trim();
                        if (!nombre) nombre = link.getAttribute("aria-label") || "";
                        if (!nombre) nombre = link.getAttribute("title") || "";
                        if (nombre) lista.push({ id: match[1], nombre: nombre });
                    });
                    return lista;
                }
            """)

            nuevos = 0
            for r in visibles:
                if r["id"] not in reportes_acumulados:
                    reportes_acumulados[r["id"]] = r["nombre"]
                    nuevos += 1

            print(f"  Scroll... {len(reportes_acumulados)} reporte(s) acumulados")

            if nuevos == 0:
                sin_cambios += 1
                if sin_cambios >= 3:
                    break
            else:
                sin_cambios = 0

            page.mouse.wheel(0, 500)
            time.sleep(2)

    except Exception:
        time.sleep(3)

    return [{"id": k, "nombre": v} for k, v in reportes_acumulados.items()]


# ─── EXPORTAR UN REPORTE A PDF ────────────────────────────────────────────────

def exportar_reporte(page, reporte_id: str, reporte_nombre: str,
                     fecha: str) -> tuple:
    """
    Navega al reporte y lo exporta a PDF.
    Retorna (True, ruta_archivo) o (False, mensaje_error).
    """
    url_reporte = (
        f"https://app.powerbi.com/groups/{WORKSPACE_ID}"
        f"/reports/{reporte_id}/ReportSection"
    )
    nombre_archivo = f"{limpiar_nombre(reporte_nombre)}.pdf"
    ruta_archivo   = CARPETA_SALIDA / nombre_archivo

    # Navegar al reporte
    try:
        page.goto(url_reporte, wait_until="domcontentloaded", timeout=60000)
    except Exception as e:
        return False, f"No se pudo abrir el reporte: {e}"

    print(f"    Cargando reporte ({ESPERA_CARGA}s)...")
    time.sleep(ESPERA_CARGA)

    try:
        page.wait_for_load_state("networkidle", timeout=20000)
    except Exception:
        pass

    time.sleep(3)

    # Paso 1: Click en "Exportar" de la barra superior
    print("    Paso 1/3: Haciendo click en 'Exportar' de la barra...")
    exportar_barra = click_primero_visible(page, [
        'button[aria-label="Exportar"]',
        'button[title="Exportar"]',
        'button:has-text("Exportar")',
        '[role="button"]:has-text("Exportar")',
    ])

    if not exportar_barra:
        return False, "No se encontro el boton 'Exportar' en la barra del reporte."

    time.sleep(2)

    # Paso 2: Click en "PDF" del menu desplegable
    print("    Paso 2/3: Seleccionando PDF...")
    pdf_ok = click_primero_visible(page, [
        '[role="menuitem"]:has-text("PDF")',
        'li:has-text("PDF")',
        'button:has-text("PDF")',
        'span:has-text("PDF")',
        'a:has-text("PDF")',
    ])

    if not pdf_ok:
        return False, "No se encontro la opcion PDF en el menu desplegable."

    time.sleep(3)

    # Paso 3: En el dialogo que aparece, click en el boton verde "Exportar"
    # y capturar la descarga automaticamente (sin cuadro de Guardar como)
    print("    Paso 3/3: Confirmando exportacion y esperando descarga...")
    try:
        with page.expect_download(timeout=TIMEOUT_PDF * 1000) as descarga_info:
            click_primero_visible(page, [
                '[role="dialog"] button:has-text("Exportar")',
                'div[class*="dialog"] button:has-text("Exportar")',
                'div[class*="modal"] button:has-text("Exportar")',
                'button[class*="primary"]:has-text("Exportar")',
            ], espera_ms=10000)
            print("    Boton Exportar clickeado. Generando PDF...")

        descarga = descarga_info.value
        descarga.save_as(str(ruta_archivo))
        return True, nombre_archivo

    except Exception as e:
        return False, f"Error al esperar la descarga: {e}"


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    fecha_hoy = datetime.now().strftime("%Y-%m-%d")

    CARPETA_SESION.mkdir(parents=True, exist_ok=True)
    CARPETA_SALIDA.mkdir(parents=True, exist_ok=True)

    print()
    print("=" * 54)
    print("  Exportador PowerBI a PDF - C.O Mensuales")
    print("=" * 54)
    print()

    with sync_playwright() as p:

        print("Abriendo Chrome...")
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(CARPETA_SESION),
            headless=False,
            accept_downloads=True,
            viewport={"width": 1920, "height": 1080},
        )

        page = context.new_page()

        # Ir al workspace
        print()
        print("Paso 1: Abriendo workspace de PowerBI en el navegador...")
        print()
        print("  >> Si el navegador pide login, ingresa tu usuario y contrasena")
        print("     de Microsoft. Tienes 5 minutos.")
        print("  >> Si ya tienes sesion guardada, el script continua solo.")
        print()

        page.goto(WORKSPACE_URL, wait_until="domcontentloaded", timeout=30000)

        # Esperar que el workspace cargue (da tiempo para login si es necesario)
        print("  Esperando que el workspace cargue...")
        try:
            page.wait_for_url(f"**/{WORKSPACE_ID}/**", timeout=TIMEOUT_LOGIN * 1000)
            # Esperar que PowerBI termine de cargar completamente tras el login
            print("  Login detectado. Esperando que PowerBI cargue (1 minuto)...")
            time.sleep(60)
        except Exception:
            print()
            print("ERROR: El workspace no cargo en 5 minutos.")
            print("       Verifica tu conexion o intenta de nuevo.")
            context.close()
            sys.exit(1)

        # Obtener reportes
        print()
        print("Paso 2: Buscando reportes en el workspace...")
        reportes = obtener_reportes(page)

        if not reportes:
            # Guardar screenshot para diagnostico
            ruta_debug = CARPETA_SALIDA / "debug_workspace.png"
            page.screenshot(path=str(ruta_debug))
            print()
            print("ERROR: No se encontraron reportes.")
            print("       Se guardo una captura de pantalla para diagnostico:")
            print(f"       {ruta_debug}")
            print("       Comparte esa imagen para revisar que estaba viendo el script.")
            context.close()
            sys.exit(1)

        print(f"  Se encontraron {len(reportes)} reporte(s):")
        for r in reportes:
            print(f"    - {r['nombre']}")

        # Exportar cada reporte
        print()
        print("Paso 3: Exportando reportes a PDF...")
        print()

        exitosos = []
        fallidos  = []
        abiertos_en_pestana = 0   # cuenta cuantos reportes lleva abiertos la pestana actual

        for indice, reporte in enumerate(reportes, start=1):

            # Si la pestana ya abrio el limite de reportes, cerrarla y abrir una nueva
            # limpia para liberar lo que Fabric tiene "abierto". El bucle NO se reinicia:
            # continua con el siguiente reporte de la lista.
            if abiertos_en_pestana >= LIMITE_ABIERTOS:
                print(f"  -- Limite de {LIMITE_ABIERTOS} reportes abiertos alcanzado.")
                print("  -- Cerrando pestana para liberar los PowerBI abiertos...")
                page.close()
                time.sleep(3)
                page = context.new_page()
                print("  -- Pestana nueva lista. Continuando la exportacion...")
                print()
                abiertos_en_pestana = 0

            print(f"  Exportando ({indice}/{len(reportes)}): {reporte['nombre']}")

            ok, resultado = exportar_reporte(
                page           = page,
                reporte_id     = reporte["id"],
                reporte_nombre = reporte["nombre"],
                fecha          = fecha_hoy,
            )
            abiertos_en_pestana += 1

            if ok:
                print(f"    OK - guardado: {resultado}")
                exitosos.append(resultado)
            else:
                print(f"    ERROR - {resultado}")
                fallidos.append(reporte["nombre"])

            print()
            time.sleep(2)

        # Resumen
        print("=" * 54)
        print("  RESUMEN")
        print("=" * 54)
        print(f"  Exitosos : {len(exitosos)}")
        print(f"  Fallidos : {len(fallidos)}")

        if exitosos:
            print()
            print(f"  Archivos guardados en:")
            print(f"  {CARPETA_SALIDA.resolve()}")
            for f in exitosos:
                print(f"    - {f}")

        if fallidos:
            print()
            print("  Reportes con error:")
            for f in fallidos:
                print(f"    - {f}")

        print()
        input("  Presiona Enter para cerrar el navegador y terminar...")
        context.close()


if __name__ == "__main__":
    main()
