// screenshot.js — Take screenshot of a URL
// Usage: node screenshot.js <url> [output-path]
const { chromium } = require('/tmp/node_modules/playwright');
const url = process.argv[2];
const output = process.argv[3] || '/tmp/screenshot.png';

if (!url) {
  console.log('Usage: node screenshot.js <url> [output-path]');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: output, fullPage: true });
  
  console.log('Screenshot saved to:', output);
  await browser.close();
})();
