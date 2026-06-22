const path = require('path');
const fs = require('fs');
const XLSX = require(path.join(process.env.TEMP, 'xlsxtool', 'node_modules', 'xlsx'));

const wb = XLSX.readFile(path.join(__dirname, '..', 'datos', 'Lista Empleados de somacor.xlsx'));
const ws = wb.Sheets['Empleados'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
const h = rows[0];
const idx = (name) => h.indexOf(name);

const isSupervisor = (c) => c && /supervisor/i.test(c);
const isADC = (c) => c && (/administrador\s+de\s+contrato/i.test(c) || /\bADC\b/.test(c));

const personas = [];
const seen = new Set();

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const cargo = r[idx('Cargo')] ? r[idx('Cargo')].trim() : '';
  const vigente = r[idx('Vigente')];
  if (vigente && String(vigente).toLowerCase() === 'no') continue;
  if (!isSupervisor(cargo) && !isADC(cargo)) continue;

  const rut = String(r[idx('RUT')] || '').trim();
  if (!rut || seen.has(rut)) continue;
  seen.add(rut);

  const nombre = [r[idx('Nombre')], r[idx('Apellido Paterno')], r[idx('Apellido Materno')]]
    .filter(Boolean).join(' ').trim();

  personas.push({ rut, nombre, cargo, tipo: isSupervisor(cargo) ? 'supervisor' : 'adc' });
}

personas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

const out = path.join(__dirname, 'app', 'src', 'data', 'supervisores.json');
fs.writeFileSync(out, JSON.stringify(personas, null, 2));
console.log(`Supervisores: ${personas.filter(p => p.tipo === 'supervisor').length}`);
console.log(`ADC: ${personas.filter(p => p.tipo === 'adc').length}`);
console.log(`Total: ${personas.length}`);
console.log('supervisores.json generado en', out);
