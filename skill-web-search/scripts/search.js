// search.js — Web search via Bing RSS (no API key needed)
// Usage: node search.js "search query"
const { execSync } = require('child_process');
const query = process.argv.slice(2).join(' ');

if (!query) {
  console.log('Usage: node search.js "search query"');
  process.exit(1);
}

try {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=10&format=rss`;
  const xml = execSync(`curl -s --max-time 15 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" -H "Accept-Language: en-US" "${url}"`, { encoding: 'utf8' });
  
  // Parse RSS items
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  const titleRe = /<title>([^<]+)<\/title>/;
  const linkRe = /<link>([^<]+)<\/link>/;
  const descRe = /<description>([^<]+)<\/description>/;
  
  const results = [];
  let match;
  while ((match = itemRe.exec(xml)) !== null && results.length < 10) {
    const block = match[1];
    const title = (titleRe.exec(block) || [])[1] || '';
    const link = (linkRe.exec(block) || [])[1] || '';
    const desc = (descRe.exec(block) || [])[1] || '';
    const cleanDesc = desc.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').substring(0, 150);
    if (title) results.push({ title, link, desc: cleanDesc });
  }
  
  console.log('\n🔍 Query:', query);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  results.forEach((r, i) => {
    console.log(`\n${i+1}. ${r.title}`);
    console.log(`   🔗 ${r.link}`);
    if (r.desc) console.log(`   📝 ${r.desc}`);
  });
  console.log('\n');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
