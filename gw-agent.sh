#!/bin/bash
MESSAGE="$1"
TOKEN=$(cat ~/.openclaw/openclaw.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('gateway',{}).get('auth',{}).get('token',''))")
cd /tmp && node -e "
const { WebSocket } = require('/tmp/node_modules/ws');
const crypto = require('crypto');
const ws = new WebSocket('ws://127.0.0.1:18789');
let done = false;
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.type === 'event' && msg.event === 'connect.challenge') {
    ws.send(JSON.stringify({ type: 'req', id: '1', method: 'connect', params: { minProtocol: 3, maxProtocol: 3, client: { id: 'cli', version: '2026.3.28', platform: 'linux', mode: 'cli' }, role: 'operator', scopes: ['operator.read', 'operator.write'], caps: [], commands: [], permissions: {}, auth: { token: '$TOKEN' }, locale: 'en-US', userAgent: 'gw-agent-cli/1.0' } }));
  }
  if (msg.type === 'res' && msg.id === '1' && msg.ok) {
    ws.send(JSON.stringify({ type: 'req', id: '2', method: 'chat.send', params: { sessionKey: 'agent:v10:main', idempotencyKey: crypto.randomUUID(), message: \`$MESSAGE\` } }));
  }
  if (msg.type === 'res' && msg.id === '2') {
    console.log(msg.ok ? 'OK' : 'ERROR');
    done = true;
    ws.close();
  }
});
ws.on('error', (e) => { console.error(e.message); process.exit(1); });
setTimeout(() => { if (!done) { console.error('TIMEOUT'); ws.close(); } process.exit(0); }, 10000);
" 2>&1
