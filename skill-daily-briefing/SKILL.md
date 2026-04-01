---
name: daily-briefing
description: Envía un resumen matutino a Telegram cada mañana. Incluye: estado de crons, heartbeat, tareas pendientes, incidencias. Se activa via cron daily a las 8 AM CST.
---

# Daily Briefing

Genera y envía un resumen matutino a Telegram con:
- Estado de cron jobs (errores, última ejecución)
- Health check rápido (gateway, disk, memory)
- Resumen de heartbeat (Instagram, TTS, GitHub)
- Alertas si hay algo urgente

## Envío manual

```bash
python3 ~/.openclaw/skills/daily-briefing/scripts/daily_briefing.py
```

## Cron (ya configurado)

El cron `daily_summary` corre a las 8 AM CST (`0 8 * * *`).
