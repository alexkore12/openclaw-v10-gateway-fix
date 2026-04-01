---
name: github
description: Use when the user asks about GitHub — PRs, issues, repos, reviews, or anything related to GitHub. gh CLI is already installed and authenticated.
---

# GitHub Integration

Run any gh command directly. Here are useful patterns:

## Quick Commands

```bash
# My PRs (open)
gh pr list --author @me --state open

# My issues (open)
gh issue list --assignee @me --state open

# Recent PRs in a repo
gh pr list --repo owner/repo --state open --limit 10

# PR detail
gh pr view 123

# Review a PR
gh pr review 123 --comment --body "LGTM!"

# Create PR
gh pr create --title "feat: ..." --body "Fixes #..."

# Check CI status
gh run list --limit 5

# Repo status
gh repo view
```

## Scripts Available

- `~/.openclaw/skills/github/scripts/gh_prs.sh` — My open PRs with status
- `~/.openclaw/skills/github/scripts/gh_issues.sh` — My open issues
- `~/.openclaw/skills/github/scripts/gh_review.sh <pr-number>` — Quick PR review
