import zipfile, json, os, re

BASE_PBIX   = "Control Operacional 360 - CMPC - copia.pbix"
ENGIE_PBIX  = "Control Operacional 360 - ENGIE - copia.pbix"
OUTPUT_PBIX = "Control Operacional 360 - CMPC - copia2.pbix"
OUTPUT_ENGIE_TEMA = "Control Operacional 360 - ENGIE - copia.pbix"  # actualizar tema en ENGIE tambien

RES_PREFIX   = "Report/StaticResources/RegisteredResources/"
THEME_PATH   = "Report/StaticResources/SharedResources/BaseThemes/CY22SU11.json"
PAGES_PREFIX = "Report/definition/pages/"

PLANTILLAS = {
    "Vigilancia":          os.path.join("plantilla 1", "plantilla página para vigilancia.png"),
    "Rendimientos":        os.path.join("plantilla 1", "plantilla rendimientos.png"),
    "Control Somnolencia": os.path.join("plantilla 1", "plantilla control somnolencia.png"),
    "Control Vehicular":   os.path.join("plantilla 1", "plantilla control vehicular.png"),
    "Control Documental":  os.path.join("plantilla 1", "plantilla página para control documental.png"),
    "Dotación":            os.path.join("plantilla 1", "plantilla página para dotación.png"),
    "Análisis Financiero": os.path.join("plantilla 1", "plantilla analisis financiero.png"),
}

def plantilla_internal(page_name):
    safe = re.sub(r'[^a-z0-9]', '_', page_name.lower())
    return 'plantilla_cmpc_' + safe + '.png'

# ── Colores del tema ──────────────────────────────────────────────────────────
THEME_COLORS = ["#2D67AA","#1C1B21","#DF0847","#F3F2F1","#B4BAC3","#E45021","#17A6A4","#2D67AA"]

def build_theme(original_theme):
    theme = json.loads(json.dumps(original_theme))
    # Colores principales (repetir para completar los 40 slots)
    base = THEME_COLORS
    extended = (base * 10)[:40]
    theme['dataColors'] = extended
    # Tendencia de opiniones
    theme['bad']     = "#2D67AA"   # Negativo
    theme['good']    = "#17A6A4"   # Positivo
    theme['neutral'] = "#B4BAC3"   # Neutro
    # Colores divergentes
    theme['maximum'] = "#00C71B"   # Max
    theme['center']  = "#B4BAC3"   # Medio
    theme['minimum'] = "#DA0000"   # Min
    return theme

# ── Leer archivos ─────────────────────────────────────────────────────────────
def read_all(pbix_path):
    contents = {}
    with zipfile.ZipFile(pbix_path, 'r') as z:
        for item in z.infolist():
            contents[item.filename] = (z.read(item.filename), item.compress_type)
    return contents

engie_files = read_all(ENGIE_PBIX)
cmpc_files  = read_all(BASE_PBIX)

# Actualizar tema con colores correctos
original_theme = json.loads(engie_files[THEME_PATH][0])
new_theme = build_theme(original_theme)
new_theme_bytes = json.dumps(new_theme, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
engie_files[THEME_PATH] = (new_theme_bytes, zipfile.ZIP_DEFLATED)
print("Tema actualizado con colores de ENGIE")
print("  dataColors[0-7]: " + str(THEME_COLORS))

# ── Leer páginas ──────────────────────────────────────────────────────────────
def read_pages(files):
    pages = {}
    idx = json.loads(files[PAGES_PREFIX + 'pages.json'][0])
    for entry in idx.get('pageOrder', []):
        page_id = entry if isinstance(entry, str) else entry.get('id', '')
        page_path = PAGES_PREFIX + page_id + '/page.json'
        if page_path not in files:
            continue
        page_data = json.loads(files[page_path][0])
        display_name = page_data.get('displayName', page_id)
        visuals = {}
        for fname in files:
            if fname.startswith(PAGES_PREFIX + page_id + '/visuals/') and fname.endswith('/visual.json'):
                vid = fname.split('/')[-2]
                visuals[vid] = files[fname][0]
        pages[display_name] = {'pageId': page_id, 'page_data': page_data, 'visuals': visuals}
    return pages

engie_pages = read_pages(engie_files)
cmpc_pages  = read_pages(cmpc_files)

# ── Logos ─────────────────────────────────────────────────────────────────────
logo_engie = next((f.split('/')[-1] for f in engie_files if f.startswith(RES_PREFIX) and 'engie' in f.lower() and f.endswith('.png')), None)
logo_cmpc  = next((f.split('/')[-1] for f in cmpc_files  if f.startswith(RES_PREFIX) and 'cmpc'  in f.lower() and f.endswith('.png')), None)
print('Logo ENGIE: ' + str(logo_engie))
print('Logo CMPC:  ' + str(logo_cmpc))

# ── Recursos de ENGIE necesarios ─────────────────────────────────────────────
needed = set()
for pd in engie_pages.values():
    txt = json.dumps(pd['page_data'], ensure_ascii=False)
    for v in pd['visuals'].values():
        txt += v.decode('utf-8', errors='replace')
    for img in re.findall(r'([A-Za-z0-9_]+\.(?:png|jpg))', txt):
        if img != logo_engie:
            needed.add(img)

cmpc_res  = {f.split('/')[-1] for f in cmpc_files  if f.startswith(RES_PREFIX)}
engie_res = {f.split('/')[-1] for f in engie_files if f.startswith(RES_PREFIX)}
to_copy   = (needed & engie_res) - cmpc_res

# ── Construir output ──────────────────────────────────────────────────────────
output = dict(cmpc_files)
pages_done = []

for ename, epage in engie_pages.items():
    if ename not in cmpc_pages:
        print('  Sin equivalente en CMPC: ' + ename)
        continue

    cpage = cmpc_pages[ename]
    cpid  = cpage['pageId']

    new_page = json.loads(json.dumps(epage['page_data'], ensure_ascii=False))
    new_page['name'] = cpid

    # Preservar filterConfig de CMPC
    if 'filterConfig' in cpage['page_data']:
        new_page['filterConfig'] = cpage['page_data']['filterConfig']
    elif 'filterConfig' in new_page:
        del new_page['filterConfig']

    # Background con plantilla de CMPC
    if ename in PLANTILLAS:
        pint   = plantilla_internal(ename)
        plocal = PLANTILLAS[ename]
        bg = {"properties": {"image": {"image": {
            "name": {"expr": {"Literal": {"Value": "'" + os.path.basename(plocal) + "'"}}},
            "url":  {"expr": {"ResourcePackageItem": {"PackageName": "RegisteredResources", "PackageType": 1, "ItemName": pint}}},
            "scaling": {"expr": {"Literal": {"Value": "'Fit'"}}}
        }}, "transparency": {"expr": {"Literal": {"Value": "0D"}}}}}
        if "objects" not in new_page:
            new_page["objects"] = {}
        new_page["objects"]["background"] = [bg]

    output[PAGES_PREFIX + cpid + '/page.json'] = (
        json.dumps(new_page, ensure_ascii=False, separators=(',',':')).encode('utf-8'),
        zipfile.ZIP_DEFLATED
    )

    # Eliminar visuals anteriores de CMPC
    for fname in list(output.keys()):
        if fname.startswith(PAGES_PREFIX + cpid + '/visuals/'):
            del output[fname]

    # Copiar visuals de ENGIE reemplazando logo
    for vid, vbytes in epage['visuals'].items():
        if logo_engie and logo_cmpc:
            vbytes = vbytes.decode('utf-8', errors='replace').replace(logo_engie, logo_cmpc).encode('utf-8')
        output[PAGES_PREFIX + cpid + '/visuals/' + vid + '/visual.json'] = (vbytes, zipfile.ZIP_DEFLATED)

    pages_done.append(ename)
    print('  OK: ' + ename + ' (' + str(len(epage['visuals'])) + ' visuals)')

# ── Tema actualizado ──────────────────────────────────────────────────────────
output[THEME_PATH] = (new_theme_bytes, zipfile.ZIP_DEFLATED)

# ── Recursos de ENGIE ────────────────────────────────────────────────────────
for res in to_copy:
    src = RES_PREFIX + res
    if src in engie_files:
        output[src] = engie_files[src]

# ── Plantillas ────────────────────────────────────────────────────────────────
plantillas_done = set()
for pname, plocal in PLANTILLAS.items():
    if pname not in pages_done:
        continue
    pint = plantilla_internal(pname)
    if pint not in plantillas_done and os.path.exists(plocal):
        with open(plocal, 'rb') as f:
            output[RES_PREFIX + pint] = (f.read(), zipfile.ZIP_DEFLATED)
        plantillas_done.add(pint)

# ── SecurityBindings ─────────────────────────────────────────────────────────
if 'SecurityBindings' in output:
    output['SecurityBindings'] = (b'', output['SecurityBindings'][1])

# ── Escribir CMPC ─────────────────────────────────────────────────────────────
if os.path.exists(OUTPUT_PBIX):
    os.remove(OUTPUT_PBIX)
with zipfile.ZipFile(OUTPUT_PBIX, 'w', allowZip64=False) as zout:
    for fname, (fdata, fcomp) in output.items():
        zout.writestr(fname, fdata, compress_type=fcomp)

print()
print('Generado: ' + OUTPUT_PBIX)
print('Páginas procesadas: ' + str(len(pages_done)))
print()

# ── Actualizar tema en ENGIE tambien ─────────────────────────────────────────
print('Actualizando tema en ENGIE...')
engie_output = dict(engie_files)
engie_output[THEME_PATH] = (new_theme_bytes, zipfile.ZIP_DEFLATED)
if 'SecurityBindings' in engie_output:
    engie_output['SecurityBindings'] = (b'', engie_output['SecurityBindings'][1])

engie_tmp = OUTPUT_ENGIE_TEMA + '.tmp'
with zipfile.ZipFile(engie_tmp, 'w', allowZip64=False) as zout:
    for fname, (fdata, fcomp) in engie_output.items():
        zout.writestr(fname, fdata, compress_type=fcomp)
os.replace(engie_tmp, OUTPUT_ENGIE_TEMA)
print('Tema actualizado en ENGIE: ' + OUTPUT_ENGIE_TEMA)
