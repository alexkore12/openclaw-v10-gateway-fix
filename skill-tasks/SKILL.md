---
name: tasks
description: Use when user asks about tasks, todos, pendientes, or task management. Quick access to personal task list stored in JSON.
---

# Task Manager

Tasks are stored in `~/.openclaw/tasks.json`.

## Commands (run via exec)

```bash
# Add task
tasks.sh add "description"

# List all
tasks.sh list

# Mark done
tasks.sh done <id>

# Delete
tasks.sh del <id>
```

## Examples

- "agrega una tarea: revisar PRs de GitHub"
- "qué tareas tengo pendientes?"
- "marca la 3 como hecha"
- "borra la tarea 5"
