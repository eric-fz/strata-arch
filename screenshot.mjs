import { firefox } from 'playwright-core';

const browser = await firefox.launch({
  executablePath: '/home/node/.cache/ms-playwright/firefox-1509/firefox/firefox',
  headless: true,
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Dashboard
await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: '/workspace/roboreqs/screenshot-dashboard.png', fullPage: false });
console.log('Dashboard screenshot saved');

// Requirements
await page.goto('http://localhost:5173/requirements', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/workspace/roboreqs/screenshot-requirements.png', fullPage: false });
console.log('Requirements screenshot saved');

// Architecture
await page.goto('http://localhost:5173/architecture', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/workspace/roboreqs/screenshot-architecture.png', fullPage: false });
console.log('Architecture screenshot saved');

await browser.close();
console.log('Done!');
