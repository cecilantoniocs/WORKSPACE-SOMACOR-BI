const path = require('path');
const XLSX = require(path.join(process.env.TEMP, 'xlsxtool', 'node_modules', 'xlsx'));

const wb = XLSX.readFile('Lista Empleados de somacor.xlsx');
const ws = wb.Sheets['Empleados'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
const headers = rows[0];
const idxCargo = headers.indexOf('Cargo');
const idxNombre = headers.indexOf('Nombre');
const idxAP = headers.indexOf('Apellido Paterno');
const idxAM = headers.indexOf('Apellido Materno');
const idxRUT = headers.indexOf('RUT');
const idxCC1 = headers.indexOf('Código Centro Costo 1');
const idxNCC1 = headers.indexOf('Nombre Centro Costo 1');
const idxVigente = headers.indexOf('Vigente');

// All unique cargos
const cargos = new Set();
for (let i = 1; i < rows.length; i++) {
  const c = rows[i][idxCargo];
  if (c) cargos.add(c.trim());
}

const isSupervisor = (c) => c && /supervisor/i.test(c);
const isADC = (c) => c && (/administrador\s+de\s+contrato/i.test(c) || /\bADC\b/.test(c));

const supCargos = [...cargos].filter(isSupervisor).sort();
const adcCargos = [...cargos].filter(isADC).sort();

console.log('=== SUPERVISOR cargos encontrados ===');
supCargos.forEach(c => console.log(' -', c));

console.log('\n=== ADC cargos encontrados ===');
adcCargos.forEach(c => console.log(' -', c));

// Extract people
const personas = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const cargo = r[idxCargo] ? r[idxCargo].trim() : '';
  const vigente = r[idxVigente];
  if (vigente && String(vigente).toLowerCase() === 'no') continue;
  if (!isSupervisor(cargo) && !isADC(cargo)) continue;
  const nombre = [r[idxNombre], r[idxAP], r[idxAM]].filter(Boolean).join(' ').trim();
  personas.push({
    rut: String(r[idxRUT] || '').trim(),
    nombre,
    cargo,
    tipo: isSupervisor(cargo) ? 'supervisor' : 'adc',
  });
}

console.log(`\nTotal supervisores: ${personas.filter(p => p.tipo === 'supervisor').length}`);
console.log(`Total ADC: ${personas.filter(p => p.tipo === 'adc').length}`);
console.log('\nMuestra supervisores:');
personas.filter(p => p.tipo === 'supervisor').slice(0, 5).forEach(p => console.log(' ', p.nombre, '|', p.cargo));
console.log('\nMuestra ADC:');
personas.filter(p => p.tipo === 'adc').slice(0, 5).forEach(p => console.log(' ', p.nombre, '|', p.cargo));
