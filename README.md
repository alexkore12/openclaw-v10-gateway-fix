# OpenClaw v10 Gateway Fix

Fixes and enhancements for OpenClaw v10 engine gateway integration.

## What we solved

1. **`openclaw agent` hangs** — CLI → gateway WebSocket connection established but invocation hangs with no response
2. **Agent invocation via gateway** — discovered the correct method is `chat.send` via WebSocket, not `agent.invoke`
3. **Exec approvals via Telegram** — configured Telegram as approval channel for obfuscated commands
4. **gw-agent.sh** — CLI tool to send messages to v10 engine via gateway WebSocket

## Architecture

```
CLI terminal / Telegram
        |
        v
   gw-agent.sh (WebSocket client)
        |
        v
   OpenClaw Gateway (ws://127.0.0.1:18789)
        |
        v
   v10 Engine Agent (agent:v10:main)
        |
        v
   Telegram (response delivery)
```

## Quick Start

### 1. gw-agent.sh — Send messages to v10 from terminal

```bash
chmod +x gw-agent.sh
./gw-agent.sh "your message here"
```

Response is delivered to Telegram.

### 2. WebSocket method discovery

The correct gateway method for agent invocation:

```javascript
// WebSocket connect
{
  type: 'req', id: '1', method: 'connect',
  params: {
    minProtocol: 3, maxProtocol: 3,
    client: { id: 'cli', version: '2026.3.28', platform: 'linux', mode: 'cli' },
    role: 'operator',
    scopes: ['operator.read', 'operator.write'],
    auth: { token: '<gateway-token>' }
  }
}

// Then chat.send
{
  type: 'req', id: '2',
  method: 'chat.send',
  params: {
    sessionKey: 'agent:v10:main',
    idempotencyKey: '<uuid>',
    message: 'your message'
  }
}
```

**Important:** `agent.invoke` does NOT exist — it's `chat.send`.

### 3. Telegram exec approvals

Add to `~/.openclaw/openclaw.json`:

```json
{
  "approvals": {
    "exec": {
      "enabled": true,
      "mode": "session",
      "agentFilter": ["v10"],
      "targets": [
        { "channel": "telegram", "to": "YOUR_TELEGRAM_ID" }
      ]
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "execApprovals": {
        "enabled": true,
        "approvers": ["YOUR_TELEGRAM_ID"]
      }
    }
  }
}
```

Restart: `openclaw gateway restart`

Then approve with: `/approve <id> allow-once` or `/approve <id> allow-always`

### 4. Playwright + Chromium setup

```bash
cd /tmp && npm install playwright
npx playwright install chromium
```

Test:
```javascript
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  console.log(await page.title());
  await browser.close();
})();
```

## Cron Migration

To fix cron jobs failing with `ollama/phi4-mini` (model not allowed), migrate to v10:

```bash
# List cron jobs
openclaw cron list

# Migrate one job to v10
openclaw cron edit <JOB_ID> --agent v10

# Run immediately to test
openclaw cron run <JOB_ID>
```

## Files

- `gw-agent.sh` — Main CLI tool for gateway → v10 invocation
- `openclaw-config-snippet.json` — Reference config for approvals
- `gateway-ws-example.js` — Standalone WebSocket client example
- `scraping-example.js` — Playwright scraping example

## Troubleshooting

**`openclaw agent` hangs:**
This is a known issue — the gateway WS connection from CLI doesn't receive response. Use `gw-agent.sh` as workaround.

**Exec approval not arriving:**
- Check `channels.telegram.execApprovals.enabled = true`
- Check `approvals.exec.targets` includes your Telegram ID
- Check `agentFilter` matches your agent (not "main" if using "v10")

**Session locked:**
When running `gw-agent.sh` while Telegram session is active, you get "session file locked". This is expected — the v10 engine owns the session. Use a separate session or use `--local` mode with a non-locked session.

## License

MIT
