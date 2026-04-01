// scrape.js — Simple page scraper
// Usage: node scrape.js <url> [selector]
const { chromium } = require('/tmp/node_modules/playwright');
const url = process.argv[2];
const selector = process.argv[3] || 'body';

if (!url) {
  console.log('Usage: node scrape.js <url> [selector]');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const title = await page.title();
    const content = await page.textContent(selector);
    
    console.log('URL:', url);
    console.log('TITLE:', title);
    console.log('CONTENT:', content.substring(0, 2000));
  } catch (e) {
    console.error('ERROR:', e.message);
  }
  
  await browser.close();
})();
