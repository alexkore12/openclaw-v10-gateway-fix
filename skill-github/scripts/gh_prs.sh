#!/bin/bash
# gh_prs.sh — My open PRs
echo "=== My Open PRs ==="
gh search prs --author alexkore12 --state open --limit 20 2>&1 | head -20

echo ""
echo "=== Recent PRs (alexkore12 repos) ==="
for repo in $(gh api users/alexkore12/repos --jq '.[].full_name' 2>/dev/null | head -10); do
    count=$(gh api repos/$repo/pulls --jq 'length' 2>/dev/null)
    if [ "$count" -gt 0 ] 2>/dev/null; then
        echo "Repo: $repo ($count PRs)"
        gh pr list --repo $repo --state open --limit 5 2>&1 | sed 's/^/  /'
    fi
done
