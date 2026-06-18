import zipfile, json, re

with zipfile.ZipFile('Control Operacional 360 - ENGIE - copia.pbix', 'r') as z:
    engie = json.loads(z.read('Report/Layout').decode('utf-16-le'))

TARGET_PAGES = ['Vigilancia', 'Control Documental', 'Dotacion']

for section in engie['sections']:
    name = section.get('displayName', '')
    name_clean = name.replace('ó','o').replace('é','e').replace('ô','o')
    if name in ['Vigilancia', 'Control Documental', 'Dotación']:
        section_str = json.dumps(section, ensure_ascii=False)
        items = re.findall(r'"ItemName":"([^"]+)"', section_str)
        print('Pagina: %s (%d visuals)' % (name, len(section.get('visualContainers', []))))
        print('  Recursos:')
        for item in sorted(set(items)):
            print('    - ' + item)
        print()

# Ver tema de colores
print('Tema ENGIE:')
with zipfile.ZipFile('Control Operacional 360 - ENGIE - copia.pbix', 'r') as z:
    names = z.namelist()
    for n in names:
        if 'Theme' in n or 'theme' in n or 'BaseTheme' in n:
            print('  ' + n)
print()
print('Tema ACCIONA:')
with zipfile.ZipFile('Control Operacional 360 - ACCIONA PLANTA CAP.pbix', 'r') as z:
    names = z.namelist()
    for n in names:
        if 'Theme' in n or 'theme' in n or 'BaseTheme' in n:
            print('  ' + n)
