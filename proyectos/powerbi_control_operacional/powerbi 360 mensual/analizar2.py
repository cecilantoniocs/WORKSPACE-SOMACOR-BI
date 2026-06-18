import zipfile, json, re

with zipfile.ZipFile('Control Operacional 360 - ENGIE - copia.pbix', 'r') as z:
    engie = json.loads(z.read('Report/Layout').decode('utf-16-le'))

for section in engie['sections']:
    name = section.get('displayName', '')
    if name not in ['Vigilancia', 'Control Documental', 'Dotación']:
        continue
    print('=== ' + name + ' ===')
    all_imgs = set()
    for i, vc in enumerate(section.get('visualContainers', [])):
        cfg = json.loads(vc.get('config', '{}'))
        sv = cfg.get('singleVisual', {})
        vtype = sv.get('visualType', '?')
        x = round(vc.get('x', 0))
        y = round(vc.get('y', 0))
        w = round(vc.get('width', 0))
        h = round(vc.get('height', 0))
        vc_str = json.dumps(vc, ensure_ascii=False)
        # buscar ItemName en el json del visual
        imgs = re.findall(r'ItemName.*?([A-Za-z0-9_]+\.(?:png|jpg|json))', vc_str)
        if imgs:
            all_imgs.update(imgs)
        print('  [%d] %-25s @ (%d,%d) %dx%d  imgs=%s' % (i, vtype, x, y, w, h, imgs))
    print('  Imagenes usadas:', sorted(all_imgs))
    print()
