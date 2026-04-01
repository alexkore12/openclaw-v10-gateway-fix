// gateway-ws-example.js
// Standalone WebSocket client to invoke OpenClaw v10 agent via gateway
// Run: node gateway-ws-example.js "your message"

const { WebSocket } = require('ws');
const crypto = require('crypto');
const fs = require('fs');
const args = process.argv.slice(2);
const message = args[0] || 'test';

const config = JSON.parse(fs.readFileSync(process.env.HOME + '/.openclaw/openclaw.json', 'utf8'));
const token = config.gateway?.auth?.token;
const port = config.gateway?.port || 18789;

const ws = new WebSocket('ws://127.0.0.1:' + port);
let done = false;

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  
  if (msg.type === 'event' && msg.event === 'connect.challenge') {
    ws.send(JSON.stringify({
      type: 'req', id: '1', method: 'connect', params: {
        minProtocol: 3, maxProtocol: 3,
        client: { id: 'cli', version: '2026.3.28', platform: 'linux', mode: 'cli' },
        role: 'operator',
        scopes: ['operator.read', 'operator.write'],
        caps: [], commands: [], permissions: {},
        auth: { token: token },
        locale: 'en-US', userAgent: 'gw-agent-cli/1.0'
      }
    }));
  }
  
  if (msg.type === 'res' && msg.id === '1' && msg.ok) {
    console.error('Connected to gateway');
    ws.send(JSON.stringify({
      type: 'req', id: '2',
      method: 'chat.send',
      params: {
        sessionKey: 'agent:v10:main',
        idempotencyKey: crypto.randomUUID(),
        message: message
      }
    }));
  }
  
  if (msg.type === 'res' && msg.id === '2') {
    console.log(msg.ok ? 'OK: message dispatched to agent v10' : 'ERROR: ' + JSON.stringify(msg.error));
    done = true;
    ws.close();
  }
});

ws.on('error', (e) => { console.error('WS ERROR:', e.message); process.exit(1); });
setTimeout(() => {
  if (!done) { console.error('TIMEOUT'); ws.close(); }
  process.exit(0);
}, 15000);
