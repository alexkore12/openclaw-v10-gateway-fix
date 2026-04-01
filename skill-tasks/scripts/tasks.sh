#!/bin/bash
# tasks.sh — Simple task manager
# Usage: tasks.sh [add|list|done|del] [args]

TASKS_FILE="$HOME/.openclaw/tasks.json"

if [ ! -f "$TASKS_FILE" ]; then
    echo '{"nextId":1,"tasks":[]}' > "$TASKS_FILE"
fi

case "$1" in
    add)
        if [ -z "$2" ]; then
            echo "Usage: tasks.sh add \"task description\""
            exit 1
        fi
        id=$(python3 -c "
import json
with open('$TASKS_FILE') as f: d=json.load(f)
task={'id':d['nextId'],'text':'$2','done':False,'created':'$(date -Iseconds)'}
d['tasks'].append(task)
d['nextId']+=1
with open('$TASKS_FILE','w') as f: json.dump(d,f)
print(d['nextId']-1)
")
        echo "Added task #$id: $2"
        ;;
    list)
        python3 -c "
import json
d=json.load(open('$TASKS_FILE'))
tasks=d.get('tasks',[])
if not tasks:
    print('No tasks. Add one: tasks.sh add ...')
else:
    for t in tasks:
        status='OK' if t.get('done') else '--'
        print(f'{status} [{t[\"id\"]}] {t[\"text\"]}')
    pending=sum(1 for t in tasks if not t.get('done'))
    print(f'{pending} pending of {len(tasks)}')
"
        ;;
    done)
        if [ -z "$2" ]; then echo "Usage: tasks.sh done <id>"; exit 1; fi
        python3 -c "
import json
with open('$TASKS_FILE') as f: d=json.load(f)
for t in d['tasks']:
    if t['id']==int('$2'):
        t['done']=True
        print(f'Done [{t[\"id\"]}] {t[\"text\"]}')
with open('$TASKS_FILE','w') as f: json.dump(d,f)
"
        ;;
    del|rm)
        if [ -z "$2" ]; then echo "Usage: tasks.sh del <id>"; exit 1; fi
        python3 -c "
import json
with open('$TASKS_FILE') as f: d=json.load(f)
before=len(d['tasks'])
d['tasks']=[t for t in d['tasks'] if t['id']!=int('$2')]
if len(d['tasks'])<before:
    with open('$TASKS_FILE','w') as f: json.dump(d,f)
    print('Deleted #$2')
else:
    print('Task #$2 not found')
"
        ;;
    *)
        echo "Tasks: add | list | done <id> | del <id>"
        ;;
esac
