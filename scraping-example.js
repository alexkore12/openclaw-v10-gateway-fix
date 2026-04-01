// scraping-example.js
// Playwright + Chromium scraping example
// Setup: npm install playwright && npx playwright install chromium

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navigate
  await page.goto('https://example.com');
  const title = await page.title();
  const h1 = await page.textContent('h1');
  
  console.log('Title:', title);
  console.log('H1:', h1);
  
  // Take screenshot
  await page.screenshot({ path: 'screenshot.png' });
  console.log('Screenshot saved to screenshot.png');
  
  // Extract all links
  const links = await page.$$eval('a', els => els.map(el => ({ text: el.innerText, href: el.href })));
  console.log('Links found:', links.length);
  
  await browser.close();
  console.log('Done!');
})();
