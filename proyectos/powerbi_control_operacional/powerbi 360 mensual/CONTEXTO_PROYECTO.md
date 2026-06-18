# Proyecto: Replicación de Diseño Power BI entre Clientes

## Objetivo

Tengo múltiples archivos `.pbix` para distintos clientes (ENGIE, ACCIONA, CMPC, etc.) que comparten la misma estructura de reporte pero con datos filtrados distintos. El objetivo es replicar automáticamente el diseño visual de **ENGIE** (archivo maestro) hacia los demás clientes, sin tocar sus filtros de datos.

**Lo que se copia:** fondos de pantalla, objetos visuales, gráficos, tema de colores, logo.  
**Lo que NO se toca:** `filterConfig` (filtros de datos específicos de cada faena/cliente).

---

## Estado actual

| Cliente | Script | Output | Estado |
|---------|--------|--------|--------|
| ACCIONA | `crear_acciona.py` | `Control Operacional 360 - ACCIONA - copia.pbix` | ✅ Completo |
| CMPC | `crear_cmpc.py` | `Control Operacional 360 - CMPC - copia2.pbix` | ✅ Completo |

---

## Archivos del proyecto

```
powerbi 360 mensual/
├── Control Operacional 360 - ENGIE - copia.pbix       ← Fuente maestra del diseño
├── Control Operacional 360 - ACCIONA PLANTA CAP.pbix  ← Base datos ACCIONA
├── Control Operacional 360 - CMPC - copia.pbix        ← Base datos CMPC
├── crear_acciona.py   ← Script ACCIONA (formato antiguo)
├── crear_cmpc.py      ← Script CMPC (formato nuevo) ← USAR ESTE COMO BASE
├── plantilla 1/       ← Fondos 1920x1080px para CMPC
│   ├── plantilla página para vigilancia.png
│   ├── plantilla rendimientos.png
│   ├── plantilla control somnolencia.png
│   ├── plantilla control vehicular.png
│   ├── plantilla página para control documental.png
│   ├── plantilla página para dotación.png
│   └── plantilla analisis financiero.png
└── CONTEXTO_PROYECTO.md
```

---

## Formatos internos de .pbix

Un `.pbix` es un archivo ZIP. Existen dos versiones:

### Formato antiguo
- Archivo: `Report/Layout` (JSON codificado en UTF-16-LE)
- Todas las páginas y visuales en un solo archivo
- ACCIONA usa este formato

### Formato nuevo (Enhanced Report Format)
- `Report/definition/report.json` — manifest (tema, resourcePackages)
- `Report/definition/pages/pages.json` — orden de páginas
- `Report/definition/pages/{pageId}/page.json` — config de cada página
- `Report/definition/pages/{pageId}/visuals/{visualId}/visual.json` — cada visual
- `Report/StaticResources/RegisteredResources/` — imágenes y tema custom
- `Report/StaticResources/SharedResources/BaseThemes/CY22SU11.json` — tema base
- **ENGIE y CMPC usan este formato**

---

## Reglas técnicas críticas (errores ya resueltos)

### 1. Nunca extraer archivos al disco al re-zipear
Corrompe el DataModel binario. Siempre copiar en memoria:
```python
contents[item.filename] = (z.read(item.filename), item.compress_type)
# luego:
zout.writestr(fname, fdata, compress_type=fcomp)
```

### 2. Serializar JSON con separadores compactos
```python
json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
```
El `json.dumps()` por defecto agrega espacios → cambia byte count → Power BI rechaza el archivo.

### 3. Limpiar SecurityBindings
```python
output['SecurityBindings'] = (b'', compress_type)
```
Si el archivo fue descargado del servicio Power BI, el SecurityBindings está cifrado con DPAPI de ese servidor. Cualquier cambio genera `MashupValidationError`. Limpiarlo a vacío hace que Power BI lo regenere al guardar.

### 4. Nunca copiar filterConfig entre clientes
```python
# Preservar filterConfig del cliente destino
if 'filterConfig' in cpage['page_data']:
    new_page['filterConfig'] = cpage['page_data']['filterConfig']
elif 'filterConfig' in new_page:
    del new_page['filterConfig']
```

### 5. Registrar imágenes en resourcePackages (formato nuevo)
Las imágenes nuevas deben registrarse en `report.json` bajo `resourcePackages`:
```json
{"name": "nombre_imagen.png", "path": "nombre_imagen.png", "type": "Image"}
```

### 6. El tema de colores va en report.json — no en CY22SU11.json
`CY22SU11.json` es el tema base de Power BI (no tocarlo).  
El tema custom de ENGIE es `plantilla_control_operacional8077515877737694.json` y se referencia así en `report.json`:
```json
"themeCollection": {
  "customTheme": {
    "name": "plantilla_control_operacional8077515877737694.json",
    "type": "RegisteredResources"
  }
}
```

---

## Tema de colores de ENGIE ("plantilla control operacional")

```json
{
  "dataColors": ["#2D67AA","#1C1B21","#DF0847","#F3F2F1","#B4BAC3","#E45021","#17A6A4","#2D67AA"],
  "bad":     "#2D67AA",
  "good":    "#17A6A4",
  "neutral": "#B4BAC3",
  "minimum": "#DA0000",
  "center":  "#B4BAC3",
  "maximum": "#00C71B"
}
```

---

## Script base para nuevo cliente (formato nuevo)

`crear_cmpc.py` es la plantilla a usar para cualquier cliente nuevo en formato nuevo. Los pasos que ejecuta:

1. Lee todos los archivos de ENGIE y del cliente base en memoria
2. Por cada página de ENGIE que exista en el cliente: copia `page.json` (con el `pageId` del cliente), preserva `filterConfig` del cliente, asigna fondo de pantalla
3. Reemplaza los visuals del cliente con los de ENGIE (sustituyendo el logo)
4. Copia recursos de imagen de ENGIE al cliente
5. Actualiza `report.json`: cambia `themeCollection` + reconstruye `resourcePackages` con items de ENGIE + plantillas nuevas
6. Limpia `SecurityBindings`
7. Escribe el `.pbix` final

---

## Para agregar un nuevo cliente

1. Duplicar `crear_cmpc.py` y renombrarlo (ej: `crear_cliente_x.py`)
2. Cambiar estas 3 variables al inicio:
```python
BASE_PBIX   = "nombre_del_pbix_cliente.pbix"
OUTPUT_PBIX = "nombre_output.pbix"
# Logo: el script lo detecta automáticamente buscando el nombre del cliente en RegisteredResources
```
3. Definir el diccionario `PLANTILLAS` con los fondos que corresponden a cada página
4. Si el logo del cliente no tiene su nombre en el filename, ajustar la detección del logo
5. Ejecutar: `python crear_cliente_x.py`

---

## Logos conocidos

| Cliente | Archivo |
|---------|---------|
| ENGIE | `logo_engie23476909604594336.png` |
| CMPC | `CMPC_LOGO022587674639730437.png` |
| Somacor | `somacor_logo8015048964098406.png` |

---

## Mapping fondos CMPC → páginas

| Página en Power BI | Archivo en `plantilla 1/` |
|--------------------|--------------------------|
| Vigilancia | `plantilla página para vigilancia.png` |
| Rendimientos | `plantilla rendimientos.png` |
| Control Somnolencia | `plantilla control somnolencia.png` |
| Control Vehicular | `plantilla control vehicular.png` |
| Control Documental | `plantilla página para control documental.png` |
| Dotación | `plantilla página para dotación.png` |
| Análisis Financiero | `plantilla analisis financiero.png` |
