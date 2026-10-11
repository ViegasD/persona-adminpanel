const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { chromium } = require(process.argv[2] || 'playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(os.tmpdir(), 'persona-browser-qa', 'admin-settings');
const headers = { authorization: 'Basic ' + Buffer.from('admin:test-only-password').toString('base64') };

async function main() {
  const mutations = [];
  let policy = { revision: 0, new_orders_enabled: true, registration_enabled: true, credit_redemption_enabled: true, require_account_checkout: false };
  const plans = [{ id: 4, slug: 'aniversario', name: 'Video de Aniversario', price_cents: 3490, video_count: 1, max_characters_per_video: 2, features: ['1 video especial'], is_active: true }];
  const mock = http.createServer(async (request, response) => {
    const reply = (data, status = 200) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(data)); };
    if (request.url === '/api/admin/settings') return reply({ settings: {} });
    assert.equal(request.headers['x-api-key'], 'test-only-key');
    if (request.method === 'GET' && request.url === '/api/v1/admin/plans') return reply(plans);
    if (request.method === 'GET') return reply({ policy, status: { processing_enabled: false, processing_start_at: null, recovery_enabled: false, account_email_enabled: true, whatsapp_delivery_enabled: false, signup_bonus: 0, purchase_bonus: 0, credits_per_video: 1, credit_purchase_enabled: false } });
    let raw = ''; for await (const chunk of request) raw += chunk;
    const body = JSON.parse(raw); mutations.push({ path: request.url, body });
    if (request.url.endsWith('/storefront-settings')) {
      if (body.revision !== policy.revision) return reply({ detail: 'conflict' }, 409);
      policy = { ...body, revision: body.revision + 1 }; return reply(policy);
    }
    Object.assign(plans[0], body); reply(plans[0]);
  });
  await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
  const backend = `http://127.0.0.1:${mock.address().port}`;
  const portProbe = http.createServer();
  await new Promise(resolve => portProbe.listen(0, '127.0.0.1', resolve));
  const port = portProbe.address().port; await new Promise(resolve => portProbe.close(resolve));
  const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: root, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
    env: { ...process.env, ADMIN_USER: 'admin', ADMIN_PASS: 'test-only-password', ADMIN_API_URL: backend, ADMIN_API_ID: 'test-only-key', STOREFRONT_API_URL: backend, STOREFRONT_ADMIN_KEY: 'test-only-key' },
  });
  let log = ''; child.stdout.on('data', data => { log += data; }); child.stderr.on('data', data => { log += data; });
  const url = `http://127.0.0.1:${port}/manager/settings`;
  let browser;
  try {
    for (let i = 0; i < 100; i++) {
      try { if ((await fetch(url, { headers })).ok) break; } catch {}
      if (i === 99 || child.exitCode !== null) throw new Error('Preview startup failed: ' + log);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    assert.equal((await fetch(url)).status, 401);
    browser = await chromium.launch({ headless: true }); fs.mkdirSync(output, { recursive: true });
    const context = await browser.newContext({ httpCredentials: { username: 'admin', password: 'test-only-password' } });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.getByRole('heading', { name: 'Loja, contas e creditos' }).waitFor();
    assert.equal((await page.content()).includes('test-only-key'), false);
    await page.getByLabel('Permitir cadastro de contas').uncheck();
    await page.getByRole('button', { name: 'Salvar regras da loja' }).click();
    await page.getByRole('status').filter({ hasText: 'Configuracoes salvas.' }).waitFor();
    assert.equal(policy.registration_enabled, false); assert.equal(policy.revision, 1);
    await page.getByLabel('Preco (centavos)').fill('3990');
    await page.getByLabel('Disponivel para novas compras').uncheck();
    const saved = page.waitForResponse(r => r.url().includes('/api/storefront-settings') && r.request().method() === 'PUT');
    await page.getByRole('button', { name: 'Salvar pacote' }).click(); await saved;
    assert.equal(plans[0].price_cents, 3990); assert.equal(plans[0].is_active, false);
    assert.equal(mutations.length, 2);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: path.join(output, `settings-${width}.png`), fullPage: true });
    }
    const csrf = await fetch(url.replace('/settings', '/api/storefront-settings'), { method: 'PUT', headers: { ...headers, origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'policy', values: policy }) });
    assert.equal(csrf.status, 403); assert.equal(mutations.length, 2);
    assert.deepEqual(errors, []);
    console.log(`PASS: authenticated admin settings, policy/plan saves, no free credits, CSRF guard, desktop/mobile screenshots at ${output}`);
    if (process.argv.includes('--serve')) {
      await browser.close(); browser = null;
      console.log(`Isolated preview: ${url} (admin / test-only-password). Test data only; no VPS connection.`);
      await new Promise(resolve => { process.once('SIGTERM', resolve); process.once('SIGINT', resolve); });
    }
  } finally {
    if (browser) await browser.close();
    const closed = new Promise(resolve => child.once('close', resolve)); child.kill(); await closed;
    await new Promise(resolve => mock.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
