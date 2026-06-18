import zipfile, json
from PIL import Image
import os

# Ver contenido del CMPC
print('=== Contenido CMPC ===')
with zipfile.ZipFile('Control Operacional 360 - CMPC - copia.pbix', 'r') as z:
    for item in z.infolist():
        print('  %s (%d bytes)' % (item.filename, item.file_size))

print()

# Ver paginas ENGIE
print('=== Paginas ENGIE ===')
with zipfile.ZipFile('Control Operacional 360 - ENGIE - copia.pbix', 'r') as z:
    engie = json.loads(z.read('Report/Layout').decode('utf-16-le'))
for s in engie['sections']:
    print('  - ' + s.get('displayName','?') + '  (%dx%d)' % (s.get('width',0), s.get('height',0)))

print()

# Ver tamanos plantillas
print('=== Tamanos plantillas en "plantilla 1" ===')
for f in os.listdir('plantilla 1'):
    img = Image.open(os.path.join('plantilla 1', f))
    print('  %s: %dx%d' % (f, img.size[0], img.size[1]))
