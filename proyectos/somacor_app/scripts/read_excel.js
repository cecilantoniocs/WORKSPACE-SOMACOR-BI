const path = require('path');
const XLSX = require(path.join(process.env.TEMP, 'xlsxtool', 'node_modules', 'xlsx'));
const wb = XLSX.readFile('Lista Empleados de somacor.xlsx');
console.log('Sheets:', JSON.stringify(wb.SheetNames));
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log('\n=== Sheet:', name, '===');
  console.log('Headers:', JSON.stringify(data[0]));
  for (let i = 1; i <= Math.min(5, data.length - 1); i++) {
    console.log('Row ' + i + ':', JSON.stringify(data[i]));
  }
  console.log('Total rows:', data.length - 1);
});
