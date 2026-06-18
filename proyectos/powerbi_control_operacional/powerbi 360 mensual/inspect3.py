import zipfile, json

# Leer tema custom de ENGIE
with zipfile.ZipFile('Control Operacional 360 - ENGIE - copia.pbix', 'r') as z:
    theme_custom = json.loads(z.read('Report/StaticResources/RegisteredResources/plantilla_control_operacional8077515877737694.json'))

print('=== Tema custom ENGIE ===')
print(json.dumps(theme_custom, ensure_ascii=False, indent=2)[:3000])

print()

# Leer report.json de ENGIE para ver resourcePackages
with zipfile.ZipFile('Control Operacional 360 - ENGIE - copia.pbix', 'r') as z:
    report = json.loads(z.read('Report/definition/report.json'))

print('=== report.json resourcePackages (ENGIE) ===')
print(json.dumps(report.get('resourcePackages', []), ensure_ascii=False, indent=2)[:2000])

print()

# Ver report.json de CMPC
with zipfile.ZipFile('Control Operacional 360 - CMPC - copia.pbix', 'r') as z:
    report_cmpc = json.loads(z.read('Report/definition/report.json'))

print('=== report.json resourcePackages (CMPC) ===')
print(json.dumps(report_cmpc.get('resourcePackages', []), ensure_ascii=False, indent=2)[:1000])
print()
print('=== report.json themeCollection (CMPC) ===')
print(json.dumps(report_cmpc.get('themeCollection', {}), ensure_ascii=False, indent=2))
