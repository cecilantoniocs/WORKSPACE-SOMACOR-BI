import zipfile, json, os, re

BASE_PBIX   = "Control Operacional 360 - CMPC - copia.pbix"
ENGIE_PBIX  = "Control Operacional 360 - ENGIE - copia.pbix"
OUTPUT_PBIX = "Control Operacional 360 - CMPC - copia2.pbix"

RES_PREFIX   = "Report/StaticResources/RegisteredResources/"
THEME_PATH   = "Report/StaticResources/SharedResources/BaseThemes/CY22SU11.json"
PAGES_PREFIX = "Report/definition/pages/"
REPORT_JSON  = "Report/definition/report.json"

ENGIE_THEME_FILE = "plantilla_control_operacional8077515877737694.json"

# Plantillas locales para CMPC
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

# ── Leer todo en memoria ──────────────────────────────────────────────────────
def read_all(pbix_path):
    contents = {}
    with zipfile.ZipFile(pbix_path, 'r') as z:
        for item in z.infolist():
            contents[item.filename] = (z.read(item.filename), item.compress_type)
    return contents

engie_files = read_all(ENGIE_PBIX)
cmpc_files  = read_all(BASE_PBIX)

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

# ── Recursos de ENGIE a copiar ────────────────────────────────────────────────
needed = set()
for pd in engie_pages.values():
    txt = json.dumps(pd['page_data'], ensure_ascii=False)
    for v in pd['visuals'].values():
        txt += v.decode('utf-8', errors='replace')
    for img in re.findall(r'([A-Za-z0-9_]+\.(?:png|jpg))', txt):
        if img != logo_engie:
            needed.add(img)
needed.add(ENGIE_THEME_FILE)  # incluir el tema custom

cmpc_res  = {f.split('/')[-1] for f in cmpc_files  if f.startswith(RES_PREFIX)}
engie_res_map = {f.split('/')[-1]: f for f in engie_files if f.startswith(RES_PREFIX)}
to_copy = set(needed) - cmpc_res

print('Recursos a copiar de ENGIE: %d' % len(to_copy))

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

    # Eliminar visuals de CMPC
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

# ── Copiar tema base de ENGIE ─────────────────────────────────────────────────
output[THEME_PATH] = engie_files[THEME_PATH]

# ── Copiar recursos de ENGIE ──────────────────────────────────────────────────
for res in to_copy:
    src = engie_res_map.get(res)
    if src and src in engie_files:
        output[RES_PREFIX + res] = engie_files[src]

# ── Agregar plantillas CMPC ───────────────────────────────────────────────────
plantillas_done = {}
for pname, plocal in PLANTILLAS.items():
    if pname not in pages_done:
        continue
    pint = plantilla_internal(pname)
    if pint not in plantillas_done and os.path.exists(plocal):
        with open(plocal, 'rb') as f:
            output[RES_PREFIX + pint] = (f.read(), zipfile.ZIP_DEFLATED)
        plantillas_done[pint] = plocal

# ── Actualizar report.json ────────────────────────────────────────────────────
report = json.loads(cmpc_files[REPORT_JSON][0])

# 1. Cambiar tema custom a ENGIE
report['themeCollection']['customTheme'] = {
    "name": ENGIE_THEME_FILE,
    "reportVersionAtImport": {"visual": "2.10.0", "report": "3.4.0", "page": "2.3.1"},
    "type": "RegisteredResources"
}

# 2. Actualizar resourcePackages — copiar de ENGIE y agregar nuevos items
engie_report = json.loads(engie_files[REPORT_JSON][0])
engie_rp = next((rp for rp in engie_report.get('resourcePackages',[]) if rp['name'] == 'RegisteredResources'), None)

# Partir con los items de ENGIE (que ya incluye todos los recursos necesarios)
new_items = list(engie_rp['items']) if engie_rp else []

# Reemplazar logo ENGIE por logo CMPC en los items
for item in new_items:
    if item.get('name') == logo_engie:
        item['name'] = logo_cmpc
        item['path'] = logo_cmpc

# Agregar plantillas CMPC
existing_names = {i['name'] for i in new_items}
for pint in plantillas_done:
    if pint not in existing_names:
        new_items.append({"name": pint, "path": pint, "type": "Image"})

# Asegurar que logo CMPC esté registrado
if logo_cmpc and logo_cmpc not in existing_names:
    new_items.append({"name": logo_cmpc, "path": logo_cmpc, "type": "Image"})

# Asegurar somacor logo
somacor = "somacor_logo8015048964098406.png"
if somacor not in existing_names:
    new_items.append({"name": somacor, "path": somacor, "type": "Image"})

# Reconstruir resourcePackages
rp_registered = {"name": "RegisteredResources", "type": "RegisteredResources", "items": new_items}
rp_shared = next((rp for rp in report.get('resourcePackages',[]) if rp['name'] == 'SharedResources'), None)
if not rp_shared:
    rp_shared = next((rp for rp in engie_report.get('resourcePackages',[]) if rp['name'] == 'SharedResources'), None)

report['resourcePackages'] = [rp_registered]
if rp_shared:
    report['resourcePackages'].append(rp_shared)

output[REPORT_JSON] = (
    json.dumps(report, ensure_ascii=False, separators=(',',':')).encode('utf-8'),
    zipfile.ZIP_DEFLATED
)
print('report.json actualizado (tema + resourcePackages)')

# ── SecurityBindings ──────────────────────────────────────────────────────────
if 'SecurityBindings' in output:
    output['SecurityBindings'] = (b'', output['SecurityBindings'][1])

# ── Escribir pbix ─────────────────────────────────────────────────────────────
if os.path.exists(OUTPUT_PBIX):
    os.remove(OUTPUT_PBIX)
with zipfile.ZipFile(OUTPUT_PBIX, 'w', allowZip64=False) as zout:
    for fname, (fdata, fcomp) in output.items():
        zout.writestr(fname, fdata, compress_type=fcomp)

print()
print('Generado: ' + OUTPUT_PBIX)
print('Páginas: ' + str(len(pages_done)))
print('Plantillas fondos: ' + str(len(plantillas_done)))
