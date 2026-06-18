import zipfile, json, os, re

# ── Configuracion ──────────────────────────────────────────────────────────────
BASE_PBIX   = "Control Operacional 360 - ACCIONA PLANTA CAP.pbix"
ENGIE_PBIX  = "Control Operacional 360 - ENGIE - copia.pbix"
OUTPUT_PBIX = "Control Operacional 360 - ACCIONA - copia.pbix"

PAGES_TO_EDIT = ["Vigilancia", "Control Documental", "Dotación"]

PLANTILLAS = {
    "Vigilancia":         ("plantilla página para vigilancia.png",          "plantilla_vigilancia_acciona.png"),
    "Control Documental": ("plantilla página para control documental.png",   "plantilla_control_documental_acciona.png"),
    "Dotación":           ("plantilla página para dotación.png",             "plantilla_dotacion_acciona.png"),
}

LOGO_ENGIE  = "logo_engie23476909604594336.png"
LOGO_ACCIONA = "LOGO_ACCIONA26932212538310503.png"

NEW_W, NEW_H = 1920, 1080
RES_PREFIX = "Report/StaticResources/RegisteredResources/"

# ── 1. Leer layouts ────────────────────────────────────────────────────────────
with zipfile.ZipFile(BASE_PBIX, "r") as z:
    acciona_raw = z.read("Report/Layout")
    acciona_resources = {
        item.filename: z.read(item.filename)
        for item in z.infolist()
        if item.filename.startswith(RES_PREFIX)
    }

with zipfile.ZipFile(ENGIE_PBIX, "r") as z:
    engie_raw = z.read("Report/Layout")
    engie_resources = {
        item.filename: z.read(item.filename)
        for item in z.infolist()
        if item.filename.startswith(RES_PREFIX)
    }

acciona_layout = json.loads(acciona_raw.decode("utf-16-le"))
engie_layout   = json.loads(engie_raw.decode("utf-16-le"))

# ── 2. Construir mapa de secciones ENGIE ──────────────────────────────────────
engie_sections = {s.get("displayName"): s for s in engie_layout["sections"]}

# ── 3. Recopilar recursos necesarios de ENGIE para las 3 paginas ──────────────
needed_engie_resources = set()
for page_name in PAGES_TO_EDIT:
    section = engie_sections.get(page_name, {})
    section_str = json.dumps(section, ensure_ascii=False)
    imgs = re.findall(r'ItemName.*?([A-Za-z0-9_]+\.(?:png|jpg|json))', section_str)
    for img in imgs:
        if img != LOGO_ENGIE:  # el logo lo reemplazamos, no lo copiamos
            needed_engie_resources.add(img)

print("Recursos a copiar de ENGIE:")
for r in sorted(needed_engie_resources):
    print("  " + r)

# ── 4. Modificar el layout de ACCIONA ─────────────────────────────────────────
for section in acciona_layout["sections"]:
    page_name = section.get("displayName", "")
    if page_name not in PAGES_TO_EDIT:
        continue

    engie_section = engie_sections.get(page_name)
    if not engie_section:
        print("ADVERTENCIA: pagina no encontrada en ENGIE: " + page_name)
        continue

    print("\nProcesando: " + page_name)

    # 4a. Copiar visualContainers de ENGIE
    engie_vcs = json.loads(json.dumps(engie_section.get("visualContainers", []), ensure_ascii=False))

    # 4b. Reemplazar logo ENGIE por logo ACCIONA en los visuals
    vcs_str = json.dumps(engie_vcs, ensure_ascii=False)
    vcs_str = vcs_str.replace(LOGO_ENGIE, LOGO_ACCIONA)
    engie_vcs = json.loads(vcs_str)

    section["visualContainers"] = engie_vcs
    print("  %d visuales copiados de ENGIE" % len(engie_vcs))

    # 4c. Cambiar tamano de pagina a 1920x1080
    section["width"]  = NEW_W
    section["height"] = NEW_H

    # 4d. Agregar background con la plantilla de ACCIONA
    local_file, internal_name = PLANTILLAS[page_name]
    section_config = json.loads(section.get("config", "{}"))
    if "objects" not in section_config:
        section_config["objects"] = {}
    section_config["objects"]["background"] = [
        {
            "properties": {
                "image": {
                    "image": {
                        "name": {"expr": {"Literal": {"Value": "'" + local_file + "'"}}},
                        "url": {
                            "expr": {
                                "ResourcePackageItem": {
                                    "PackageName": "RegisteredResources",
                                    "PackageType": 1,
                                    "ItemName": internal_name
                                }
                            }
                        },
                        "scaling": {"expr": {"Literal": {"Value": "'Fit'"}}}
                    }
                },
                "transparency": {"expr": {"Literal": {"Value": "0D"}}}
            }
        }
    ]
    section["config"] = json.dumps(section_config, ensure_ascii=False, separators=(",", ":"))
    print("  Background asignado: " + internal_name)

# 4e. Registrar nuevos recursos en resourcePackages
for rp_wrapper in acciona_layout.get("resourcePackages", []):
    rp = rp_wrapper.get("resourcePackage", {})
    if rp.get("name") == "RegisteredResources":
        items = rp.get("items", [])
        existing = {item.get("path") for item in items}
        # Registrar plantillas
        for page_name, (_, internal_name) in PLANTILLAS.items():
            if internal_name not in existing:
                items.append({"type": 100, "path": internal_name, "name": internal_name})
        # Registrar recursos de ENGIE
        for res in needed_engie_resources:
            if res not in existing:
                items.append({"type": 100, "path": res, "name": res})
        rp["items"] = items
        break

print("\nResourcePackages actualizado con %d nuevos items" % (len(PLANTILLAS) + len(needed_engie_resources)))

# ── 5. Serializar Layout modificado ───────────────────────────────────────────
new_layout_bytes = json.dumps(acciona_layout, ensure_ascii=False, separators=(",", ":")).encode("utf-16-le")
print("Layout: %d bytes" % len(new_layout_bytes))

# ── 6. Construir nuevo pbix ────────────────────────────────────────────────────
if os.path.exists(OUTPUT_PBIX):
    os.remove(OUTPUT_PBIX)

with zipfile.ZipFile(BASE_PBIX, "r") as zin, \
     zipfile.ZipFile(OUTPUT_PBIX, "w", allowZip64=False) as zout:

    for item in zin.infolist():
        if item.filename == "Report/Layout":
            zout.writestr(item, new_layout_bytes)
        elif item.filename == "SecurityBindings":
            zout.writestr(item, b"")
        elif item.filename.startswith(RES_PREFIX):
            # Mantener recursos originales de ACCIONA
            zout.writestr(item, zin.read(item.filename))
        else:
            zout.writestr(item, zin.read(item.filename))

    # Agregar plantillas nuevas
    for page_name, (local_file, internal_name) in PLANTILLAS.items():
        arc = RES_PREFIX + internal_name
        with open(local_file, "rb") as f:
            zout.writestr(arc, f.read(), compress_type=zipfile.ZIP_DEFLATED)
        print("Plantilla: " + internal_name)

    # Agregar recursos de ENGIE necesarios
    for res in needed_engie_resources:
        arc = RES_PREFIX + res
        engie_arc = RES_PREFIX + res
        if engie_arc in engie_resources:
            zout.writestr(arc, engie_resources[engie_arc], compress_type=zipfile.ZIP_DEFLATED)
            print("Recurso ENGIE: " + res)
        else:
            print("ADVERTENCIA: recurso no encontrado en ENGIE: " + res)

print("\nArchivo generado: " + OUTPUT_PBIX)
print("Listo. Abre en Power BI Desktop.")
