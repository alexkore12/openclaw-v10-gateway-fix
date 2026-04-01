---
name: web-search
description: Use when the user asks to search the web, scrape pages, extract data from URLs, take screenshots, or browse websites programmatically. Requires Playwright + Chromium (already installed). Trigger phrases: "busca en web", "scrap", "extrae datos de", "navega", "screenshot", "busca", "buscar", "search the web", "scrape", "extract from URL"
---

# Web Search & Scraping

Playwright + Chromium are available at `/tmp/node_modules/playwright` and `/usr/bin/chromium-browser`.

## Quick Use

```javascript
const { chromium } = require('/tmp/node_modules/playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Navigate and get content
await page.goto('https://example.com');
const title = await page.title();
const h1 = await page.textContent('h1');

// Extract structured data
const links = await page.$$eval('a', els => els.map(el => ({ text: el.innerText, href: el.href })));

// Take screenshot
await page.screenshot({ path: '/tmp/screenshot.png' });

// Fill forms and submit
await page.fill('input[name="q"]', 'search term');
await page.click('button[type="submit"]');
await page.waitForNavigation();

await browser.close();
```

## Tool Commands

Run scraping scripts:
```bash
node /home/alex/.openclaw/skills/web-search/scripts/<script>.js
```

## Common Patterns

### Extract text content
```javascript
const paragraphs = await page.$$eval('p', els => els.map(e => e.innerText));
```

### Wait for dynamic content
```javascript
await page.waitForSelector('.dynamic-content', { timeout: 10000 });
```

### Extract JSON from page
```javascript
const data = await page.evaluate(() => JSON.parse(document.querySelector('script#__NEXT_DATA__').textContent));
```

### Handle pagination
```javascript
const results = [];
while (page.url() !== lastPage) {
  results.push(await extractResults(page));
  await page.click('.next-button');
  await page.waitForNavigation();
}
```

### Multiple pages in parallel
```javascript
const urls = ['https://site.com/page1', 'https://site.com/page2'];
const pages = await Promise.all(urls.map(async url => {
  const p = await browser.newPage();
  await p.goto(url);
  const content = await p.textContent('body');
  await p.close();
  return content;
}));
```
