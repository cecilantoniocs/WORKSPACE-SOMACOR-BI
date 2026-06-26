const path = require('path');
const fs = require('fs');
const XLSX = require(path.join(process.env.TEMP, 'xlsxtool', 'node_modules', 'xlsx'));

const wb = XLSX.readFile('Lista Empleados de somacor.xlsx');
const ws = wb.Sheets['Empleados'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
const headers = rows[0];

const idx = (name) => headers.indexOf(name);

const empleados = [];
const ccMap = {};

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r[idx('RUT')]) continue;

  const vigente = r[idx('Vigente')];
  if (vigente && String(vigente).toLowerCase() === 'no') continue;

  const nombre = [r[idx('Nombre')], r[idx('Apellido Paterno')], r[idx('Apellido Materno')]]
    .filter(Boolean).join(' ').trim();

  const centrosCosto = [];
  for (let n = 1; n <= 3; n++) {
    const codigo = r[idx(`Código Centro Costo ${n}`)];
    const nombre_cc = r[idx(`Nombre Centro Costo ${n}`)];
    if (codigo && nombre_cc) {
      centrosCosto.push({ codigo: String(codigo).trim(), nombre: String(nombre_cc).trim() });
      ccMap[String(codigo).trim()] = String(nombre_cc).trim();
    }
  }

  if (centrosCosto.length === 0) continue;

  empleados.push({
    rut: String(r[idx('RUT')]).trim(),
    nombre,
    cargo: r[idx('Cargo')] || '',
    centrosCosto,
  });
}

// Sort centros de costo
const centrosDeCosto = Object.entries(ccMap)
  .map(([codigo, nombre]) => ({ codigo, nombre }))
  .sort((a, b) => a.codigo.localeCompare(b.codigo));

console.log(`Empleados activos: ${empleados.length}`);
console.log(`Centros de costo únicos: ${centrosDeCosto.length}`);
console.log('Primeros 3 CCs:', centrosDeCosto.slice(0, 3));
console.log('Primeros 2 empleados:', JSON.stringify(empleados.slice(0, 2), null, 2));

const output = { empleados, centrosDeCosto };
fs.writeFileSync('data_output.json', JSON.stringify(output, null, 2));
console.log('\nArchivo data_output.json generado.');
