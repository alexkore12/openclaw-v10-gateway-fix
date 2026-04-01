---
name: memory
description: Runs periodically to consolidate daily memories into long-term MEMORY.md. Keeps context lean and reduces token burn. Auto-runs weekly via cron.
---

# Memory Auto-Consolidation

Runs every Sunday at midnight to extract important decisions and facts from daily memory files and update MEMORY.md.

## Manual Run

```bash
python3 ~/.openclaw/skills/memory/scripts/consolidate.py
```

## What it does

1. Reads memory/YYYY-MM-DD.md files from last 7 days
2. Extracts only decisions, fixes, configurations, API keys, script creation, errors solved
3. Skips routine: heartbeats OK, pings, tests, trivial entries
4. Deduplicates against existing MEMORY.md content
5. Adds max 20 facts per run to keep MEMORY.md lean

## Cron (weekly Sunday)

Configured at: weekly Sunday 00:00 CST
