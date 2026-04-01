#!/bin/bash
# gh_issues.sh — My open issues in a repo
gh issue list --state open --limit 20 \
  --repo alexkore12/openclaw-v10-gateway-fix \
  --assignee alexkore12 2>&1 | head -30
