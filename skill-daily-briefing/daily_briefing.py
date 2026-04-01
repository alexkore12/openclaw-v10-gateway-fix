#!/usr/bin/env python3
"""
daily_briefing.py — Morning summary sent to Telegram
"""
import subprocess, json, time
from pathlib import Path
from datetime import datetime

TZ_OFFSET = -6

def ts_ago(ts_ms):
    if not ts_ms: return "nunca"
    age_s = (time.time() - ts_ms / 1000)
    if age_s < 0: return "en breve"
    if age_s < 60: return f"hace {int(age_s)}s"
    if age_s < 3600: return f"hace {int(age_s/60)}m"
    if age_s < 86400: return f"hace {int(age_s/3600)}h"
    return f"hace {int(age_s/86400)}d"

def send_tg(text):
    bot = subprocess.check_output([
        "python3", "-c",
        "import json,sys; d=json.load(open('/home/alex/.openclaw/openclaw.json')); print(d.get('channels',{}).get('telegram',{}).get('botToken',''))"
    ], text=True).strip()
    tg = "6067040288"
    cmd = [
        "curl", "-s", "--max-time", "15", "-X", "POST",
        f"https://api.telegram.org/bot{bot}/sendMessage",
        "-H", "Content-Type: application/json",
        "-d", json.dumps({"chat_id": tg, "text": text, "parse_mode": "HTML"})
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return json.loads(r.stdout).get("ok", False)
    except:
        return False

def get_cron_runs(limit=20):
    """Get recent cron run entries from daily_summary job"""
    job_id = "cdb8ddc7-b4df-4efe-94e9-a353966890e0"  # daily_summary
    try:
        r = subprocess.run(
            ["openclaw", "cron", "runs", "--id", job_id, "--limit", str(limit)],
            capture_output=True, text=True, timeout=20
        )
        data = json.loads(r.stdout)
        return data.get("entries", [])
    except:
        return []

def get_heartbeat():
    p = Path.home() / ".openclaw" / "heartbeat_state.json"
    return json.loads(p.read_text()) if p.exists() else {}

def get_ig_stats():
    p = Path.home() / "clawd" / "heartbeat-state.json"
    return json.loads(p.read_text()) if p.exists() else {}

def health_check():
    checks = []
    df = subprocess.run(["df", "-h", "/"], capture_output=True, text=True, timeout=5)
    if df.returncode == 0:
        pct = df.stdout.strip().split("\n")[-1].split()[4]
        checks.append(("💾 Disco", pct, int(pct.rstrip("%")) > 85))
    free = subprocess.run(["free", "-m"], capture_output=True, text=True, timeout=5)
    if free.returncode == 0:
        vals = free.stdout.split("\n")[1].split()
        pct = round(int(vals[2])/int(vals[1])*100)
        checks.append(("🧠 RAM", f"{pct}%", pct > 85))
    return checks

def main():
    parts = []

    # Header
    now = datetime.now()
    hour_cst = (now.hour + TZ_OFFSET) % 24
    ampm = "AM" if hour_cst < 12 else "PM"
    hour_display = hour_cst if hour_cst <= 12 else hour_cst - 12
    date_str = now.strftime(f"%d %b %Y").replace(" 0", " ")
    parts.append(f"☀️ <b>Buenos días — {date_str}</b>")
    parts.append("")

    # Recent cron summaries
    entries = get_cron_runs(5)
    recent = [e for e in entries if e.get("status") in ("ok", "error")]
    
    if recent:
        latest = recent[0]
        status_icon = "✅" if latest.get("status") == "ok" else "❌"
        age = ts_ago(latest.get("ts"))
        parts.append(f"{status_icon} <b>Daily Summary:</b> {age}")
        
        summary = latest.get("summary", "")
        if summary:
            # Strip markdown formatting, keep key lines
            for line in summary.split("\n"):
                line = line.strip()
                if not line or line.startswith("**") or line.startswith("🌅"):
                    continue
                if any(x in line for x in ["CPU", "RAM", "disco", "Uptime", "⚠️", "❌", "✅", "servicios", "errores"]):
                    line = line.replace("**", "").replace("•", "•").strip()
                    if line and len(line) < 200:
                        parts.append(f"  {line}")
    else:
        parts.append("⚠️ <b>Sin datos de cron en 24h</b>")

    # Health
    parts.append("")
    health = health_check()
    for name, val, bad in health:
        icon = "🔴" if bad else "🟢"
        parts.append(f"{icon} {name}: {val}")

    # IG
    ig = get_ig_stats()
    count = ig.get("igPostCount", "?")
    last = ig.get("last_ig_post", 0)
    age_ig = ts_ago(last * 1000) if last else "nunca"
    parts.append(f"📸 IG: {count} posts | último: {age_ig}")

    # TTS
    hb = get_heartbeat()
    tts = ts_ago(hb.get("lastChecks", {}).get("tts", 0))
    parts.append(f"🔊 TTS health: {tts}")

    # Gateway
    gw = subprocess.run(["openclaw", "gateway", "status"],
                       capture_output=True, text=True, timeout=10)
    gw_ok = gw.returncode == 0
    parts.append(f"{'🟢' if gw_ok else '🔴'} Gateway: {'OK' if gw_ok else 'DOWN'}")

    parts.append("")
    parts.append("<i>Daily Briefing · OpenClaw v10</i>")

    text = "\n".join(parts)
    print(text)
    ok = send_tg(text)
    print(f"\nTelegram: {'OK' if ok else 'FAIL'}")

if __name__ == "__main__":
    main()
