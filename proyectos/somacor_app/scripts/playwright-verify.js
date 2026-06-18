const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const playwrightPath = path.join(process.env.APPDATA || '', '..', 'Local', 'ms-playwright');
  const browser = await chromium.launch({ headless: true, executablePath: undefined });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const BASE = 'http://localhost:5173';
  const TEMP = 'C:/Users/Usuario/AppData/Local/Temp';

  // Login
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type=email]', 'supervisor@somacor.cl');
  await page.fill('input[type=password]', '123456');
  await page.click('button[type=submit]');
  await page.waitForURL(BASE + '/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: TEMP + '/02-home.png', fullPage: true });
  console.log('Home done');

  // Registrar step 1
  await page.click('button:has-text("Registrar")');
  await page.waitForURL('**/registrar');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: TEMP + '/03-registrar-step1.png', fullPage: true });
  console.log('Registrar step1 done');

  // Select CC 002 and click HE
  await page.selectOption('select', '002');
  await page.waitForTimeout(400);
  await page.screenshot({ path: TEMP + '/04-registrar-cc-selected.png', fullPage: true });

  await page.click('button:has-text("Horas Extras")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: TEMP + '/05-registrar-form.png', fullPage: true });
  console.log('Registrar form done');

  // Select first 2 employees, fill form
  const checkboxes = await page.$$('input[type=checkbox]');
  if (checkboxes.length > 1) {
    await checkboxes[1].click();
    await page.waitForTimeout(200);
  }
  await page.fill('input[type=date]', '2026-06-17');
  await page.fill('input[type=number]', '8');
  await page.fill('textarea', 'Guardia festivo 21 de mayo');
  await page.screenshot({ path: TEMP + '/06-registrar-form-filled.png', fullPage: true });

  // Click Revisar
  await page.click('button:has-text("Revisar")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: TEMP + '/07-registrar-confirm.png', fullPage: true });
  console.log('Registrar confirm done');

  // Send
  await page.click('button:has-text("Enviar")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: TEMP + '/08-registrar-exito.png', fullPage: true });
  console.log('Exito done');

  // Go to consultar
  await page.goto(BASE + '/consultar');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: TEMP + '/09-consultar.png', fullPage: true });
  console.log('Consultar done');

  // Login as jefatura and validate
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type=email]', 'jefatura@somacor.cl');
  await page.fill('input[type=password]', '123456');
  await page.click('button[type=submit]');
  await page.waitForURL(BASE + '/');
  await page.goto(BASE + '/validar');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: TEMP + '/10-validar.png', fullPage: true });
  console.log('Validar done');

  await browser.close();
  console.log('ALL DONE');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
