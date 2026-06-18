import zipfile, json

# Ver todos los archivos de ENGIE nuevo formato
print('=== ENGIE archivos ===')
with zipfile.ZipFile('Control Operacional 360 - ENGIE - copia.pbix', 'r') as z:
    for item in z.infolist():
        if 'Static' in item.filename or 'theme' in item.filename.lower() or 'Theme' in item.filename or 'strawberry' in item.filename.lower() or 'Strawberry' in item.filename:
            print('  ' + item.filename + ' (%d bytes)' % item.file_size)

print()

# Ver report.json de ENGIE para ver que tema usa
with zipfile.ZipFile('Control Operacional 360 - ENGIE - copia.pbix', 'r') as z:
    report = json.loads(z.read('Report/definition/report.json'))
print('report.json claves:', list(report.keys()))
theme_ref = report.get('themeCollection', report.get('theme', report.get('themes', '?')))
print('theme ref:', json.dumps(theme_ref, ensure_ascii=False)[:500])

print()

# Ver page.json de Vigilancia para ver si background se aplico
with zipfile.ZipFile('Control Operacional 360 - CMPC - copia2.pbix', 'r') as z:
    idx = json.loads(z.read('Report/definition/pages/pages.json'))
    for entry in idx.get('pageOrder', []):
        page_id = entry if isinstance(entry, str) else entry.get('id','')
        page_data = json.loads(z.read('Report/definition/pages/' + page_id + '/page.json'))
        if page_data.get('displayName') == 'Vigilancia':
            print('CMPC Vigilancia page.json (objects):')
            print(json.dumps(page_data.get('objects', {}), ensure_ascii=False, indent=2)[:500])
            break
