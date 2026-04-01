#!/usr/bin/env python3
"""
consolidate.py — Memory Auto-Consolidation
Only extracts actual decisions and important facts, skips routine entries.
Run: python3 consolidate.py
"""
import os, sys, re
from pathlib import Path
from datetime import datetime

MEMORY = Path.home() / ".openclaw" / "workspace" / "MEMORY.md"
MEM_DIR = Path.home() / ".openclaw" / "workspace" / "memory"

# Patterns that indicate important facts worth saving
DECISION_PATTERNS = [
    r"decisi", r"aprobado", r"configurado", r"implementado",
    r"arreglado", r"fix", r"error", r"soluci", r"hecho",
    r"✅", r"❌", r"⚠️", r"creado", r"publicado",
    r"token", r"api.?key", r"password", r"secret",
    r"cron", r"skill", r"gateway", r"script",
    r"fail", r"success", r"ok", r"instalado",
]

def is_important(line):
    line_lower = line.lower()
    # Must have significant keywords
    has_keyword = any(re.search(p, line_lower) for p in DECISION_PATTERNS)
    # Reject routine stuff
    reject = any(x in line_lower for x in ["heartbeat_ok", "noreply", "ok", "pong", "ping", "test", "echo"])
    # Must be substantial
    is_substantial = len(line) > 30
    return has_keyword and not reject and is_substantial

def extract_facts(content):
    facts = []
    lines = content.split("\n")
    for line in lines:
        line = line.strip()
        # Skip headers, empty, dates, very short lines
        if not line: continue
        if line.startswith("#"): continue
        if re.match(r"^\d{4}-", line): continue
        if len(line) < 40: continue
        # Skip routine entries
        if is_important(line):
            # Clean markdown
            clean = re.sub(r"\[.*?\]\(.*?\)", "", line)  # remove links
            clean = re.sub(r"\*\*(.*?)\*\*", r"\1", clean)  # bold -> text
            clean = clean.strip(" -|").strip()
            if clean:
                facts.append(clean[:200])  # max 200 chars
    return facts

def read_recent():
    """Read last 7 days of memory"""
    entries = []
    dirs_to_check = [
        MEM_DIR,
        Path.home() / ".openclaw" / "workspace" / "memory",
    ]
    for mem_dir in dirs_to_check:
        if not mem_dir.exists(): continue
        cutoff = datetime.now().timestamp() - 7 * 86400
        for f in sorted(mem_dir.glob("2026-*.md")):
            if f.stat().st_mtime >= cutoff:
                try:
                    entries.append((f.stem, f.read_text()))
                except:
                    pass
    return entries

def get_existing_facts():
    """Get facts already in MEMORY.md to avoid duplicates"""
    if not MEMORY.exists(): return set()
    content = MEMORY.read_text()
    facts = extract_facts(content)
    return set(facts)

def main():
    print(f"Memory Consolidation (last 7 days)")
    
    entries = read_recent()
    print(f"Memory files: {len(entries)}")
    
    existing = get_existing_facts()
    print(f"Already in MEMORY: {len(existing)}")
    
    all_facts = []
    for date, content in entries:
        facts = extract_facts(content)
        for f in facts:
            if f not in existing:
                all_facts.append((date, f))
    
    if not all_facts:
        print("Nothing new to consolidate")
        return
    
    # Deduplicate by content similarity
    seen = set()
    unique = []
    for date, fact in all_facts:
        key = re.sub(r'[^a-zA-Z0-9]', '', fact[:60]).lower()
        if key not in seen and len(unique) < 20:  # max 20 per run
            seen.add(key)
            unique.append((date, fact))
    
    print(f"New unique facts: {len(unique)}")
    
    section = f"\n## Consolidado {datetime.now().strftime('%Y-%m-%d')}\n\n"
    for date, fact in unique:
        section += f"- {fact}\n"
    
    with open(MEMORY, "a") as f:
        f.write(section)
    
    print(f"Added {len(unique)} facts to MEMORY.md")
    print(f"TOTAL MEMORY lines: {len(MEMORY.read_text().split(chr(10)))}")

if __name__ == "__main__":
    main()
