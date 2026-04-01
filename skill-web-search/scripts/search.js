// search.js — Web search via curl + grep
// Usage: node search.js "search query"
const { execSync } = require('child_process');
const query = process.argv.slice(2).join(' ');

if (!query) {
  console.log('Usage: node search.js "search query"');
  process.exit(1);
}

try {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const html = execSync(`curl -s -L --max-time 15 -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" "${url}"`, { encoding: 'utf8' });
  
  const results = [];
  const re = /<a class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null && results.length < 10) {
    const title = m[2].replace(/<[^>]+>/g, '').trim();
    const link = m[1];
    const descMatch = html.substring(m.index, m.index + 500).match(/<a class="result__snippet"[^>]*>([^<]+)<\/a>/);
    const desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    results.push({ title, link, desc });
  }
  
  console.log('Query:', query);
  console.log('Results:');
  results.forEach((r, i) => console.log(`${i+1}. ${r.title}\n   ${r.link}\n   ${r.desc}`));
} catch (e) {
  console.error('Error:', e.message);
}
