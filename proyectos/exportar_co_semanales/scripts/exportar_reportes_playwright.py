"""
exportar_reportes_playwright.py

Abre Chrome, entra a PowerBI con tu cuenta Microsoft y exporta todos los
reportes del workspace "C.O - Semanales" a PDF.

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
WORKSPACE_ID  = "ab83f335-7756-4fc0-8e2c-00246483403d"
WORKSPACE_URL = f"https://app.powerbi.com/groups/{WORKSPACE_ID}/list?experience=power-bi"

BASE_DIR       = Path(__file__).parent.parent
CARPETA_SESION = BASE_DIR / "datos" / "sesion_browser"
CARPETA_SALIDA = BASE_DIR / "salidas"

ESPERA_CARGA   = 12    # segundos que espera a que cargue cada reporte
TIMEOUT_LOGIN  = 180   # segundos maximos para que el usuario haga login
TIMEOUT_PDF    = 120   # segundos maximos esperando que se genere el PDF


# ─── UTILIDADES ───────────────────────────────────────────────────────────────

def limpiar_nombre(nombre: str) -> str:
    limpio = re.sub(r"[^\w\s-]", "", nombre).strip()
    return re.sub(r"\s+", "_", limpio)


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
    time.sleep(3)

    # Scroll para cargar todos los items si la lista es larga
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(1)

    reportes = page.evaluate("""
        () => {
            const links = document.querySelectorAll('a[href*="/reports/"]');
            const vistos = new Set();
            const lista  = [];

            links.forEach(link => {
                const match = link.href.match(/\\/reports\\/([a-f0-9\\-]{36})/);
                if (!match || vistos.has(match[1])) return;
                vistos.add(match[1]);

                let nombre = (link.textContent || "")
                    .replace(/\\s+/g, " ").trim();

                if (!nombre) {
                    nombre = link.getAttribute("aria-label") ||
                             link.getAttribute("title") ||
                             "Reporte_" + match[1].substring(0, 8);
                }

                lista.push({ id: match[1], nombre: nombre });
            });

            return lista;
        }
    """)

    return reportes or []


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
    nombre_archivo = f"{fecha}_{limpiar_nombre(reporte_nombre)}.pdf"
    ruta_archivo   = CARPETA_SALIDA / nombre_archivo

    # Navegar al reporte
    try:
        page.goto(url_reporte, wait_until="domcontentloaded", timeout=60000)
    except Exception as e:
        return False, f"No se pudo abrir el reporte: {e}"

    print(f"    Cargando reporte ({ESPERA_CARGA}s)...")
    time.sleep(ESPERA_CARGA)

    # Paso 1: Abrir menu File / Archivo
    abierto = click_primero_visible(page, [
        'button[aria-label="File"]',
        'button[aria-label="Archivo"]',
        'button:has-text("File")',
        'button:has-text("Archivo")',
        '[role="menuitem"]:has-text("File")',
        '[role="menuitem"]:has-text("Archivo")',
    ])

    if not abierto:
        return False, (
            "No se encontro el menu File/Archivo. "
            "Es posible que el reporte no haya cargado bien o cambio la interfaz de PowerBI."
        )

    time.sleep(1)

    # Paso 2: Click en Export / Exportar
    click_primero_visible(page, [
        '[role="menuitem"]:has-text("Export")',
        '[role="menuitem"]:has-text("Exportar")',
        'li:has-text("Export")',
        'li:has-text("Exportar")',
        'button:has-text("Export")',
        'button:has-text("Exportar")',
    ])

    time.sleep(1)

    # Paso 3 y 4: Click en PDF y capturar la descarga.
    # La descarga puede dispararse al hacer click en "PDF" (directamente)
    # o al hacer click en el boton "Export" de un dialogo de confirmacion.
    # expect_download captura la descarga sin importar cual de los dos la dispara.
    try:
        with page.expect_download(timeout=TIMEOUT_PDF * 1000) as descarga_info:

            # Click en la opcion PDF del menu
            click_primero_visible(page, [
                '[role="menuitem"]:has-text("PDF")',
                'li:has-text("PDF")',
                'button:has-text("PDF")',
                '[role="menuitem"]:has-text("Export to PDF")',
                '[role="menuitem"]:has-text("Exportar a PDF")',
            ])

            time.sleep(3)

            # Si aparecio un dialogo de confirmacion, hacer click en Export
            click_primero_visible(page, [
                'div[role="dialog"] button:has-text("Export")',
                'div[role="dialog"] button:has-text("Exportar")',
                '.export-dialog button:has-text("Export")',
                'button.primary-button:has-text("Export")',
                'button.primary-button:has-text("Exportar")',
            ], espera_ms=8000)

        descarga = descarga_info.value
        descarga.save_as(str(ruta_archivo))
        return True, nombre_archivo

    except Exception as e:
        return False, f"No se pudo capturar la descarga del PDF: {e}"


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    fecha_hoy = datetime.now().strftime("%Y-%m-%d")

    CARPETA_SESION.mkdir(parents=True, exist_ok=True)
    CARPETA_SALIDA.mkdir(parents=True, exist_ok=True)

    print()
    print("=" * 54)
    print("  Exportador PowerBI a PDF - C.O Semanales")
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
        print("     de Microsoft. Tienes 3 minutos.")
        print("  >> Si ya tienes sesion guardada, el script continua solo.")
        print()

        page.goto(WORKSPACE_URL, wait_until="domcontentloaded", timeout=30000)

        # Esperar que el workspace cargue (da tiempo para login si es necesario)
        print("  Esperando que el workspace cargue...")
        try:
            page.wait_for_url(f"**/{WORKSPACE_ID}/**", timeout=TIMEOUT_LOGIN * 1000)
            time.sleep(4)
        except Exception:
            print()
            print("ERROR: El workspace no cargo en 3 minutos.")
            print("       Verifica tu conexion o intenta de nuevo.")
            context.close()
            sys.exit(1)

        # Obtener reportes
        print()
        print("Paso 2: Buscando reportes en el workspace...")
        reportes = obtener_reportes(page)

        if not reportes:
            print()
            print("ERROR: No se encontraron reportes.")
            print("       Asegurate de que el workspace este visible en el navegador")
            print("       y que tengas acceso a los reportes.")
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

        for reporte in reportes:
            print(f"  Exportando: {reporte['nombre']}")

            ok, resultado = exportar_reporte(
                page           = page,
                reporte_id     = reporte["id"],
                reporte_nombre = reporte["nombre"],
                fecha          = fecha_hoy,
            )

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
