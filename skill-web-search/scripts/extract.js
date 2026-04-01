// extract.js — Extract links, images, and structured content from a URL
// Usage: node extract.js <url>
const { chromium } = require('/tmp/node_modules/playwright');
const url = process.argv[2];

if (!url) {
  console.log('Usage: node extract.js <url>');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' });
  
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  
  const [links, images, headings] = await Promise.all([
    page.$$eval('a[href]', els => els.map(el => ({ text: el.textContent.trim().substring(0, 50), href: el.href })).filter(e => e.text)),
    page.$$eval('img[src]', els => els.map(el => ({ alt: el.alt, src: el.src })).filter(e => e.src.startsWith('http'))),
    page.$$eval('h1,h2,h3', els => els.map((el, i) => ({ level: el.tagName, text: el.textContent.trim() })))
  ]);
  
  console.log('URL:', url);
  console.log('\n--- HEADINGS ---');
  headings.forEach(h => console.log(`[${h.level}] ${h.text}`));
  
  console.log('\n--- LINKS (', links.length, ') ---');
  links.slice(0, 20).forEach(l => console.log(`  ${l.text} → ${l.href}`));
  
  console.log('\n--- IMAGES (', images.length, ') ---');
  images.slice(0, 10).forEach(i => console.log(`  ${i.alt || 'no-alt'} → ${i.src}`));
  
  await browser.close();
})();
