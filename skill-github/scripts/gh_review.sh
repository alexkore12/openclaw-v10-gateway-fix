#!/bin/bash
# gh_review.sh <pr-number> [repo]
PR_NUM=${1:-}
REPO=${2:-alexkore12/openclaw-v10-gateway-fix}

if [ -z "$PR_NUM" ]; then
    echo "Usage: gh_review.sh <pr-number> [repo]"
    exit 1
fi

echo "=== PR #$PR_NUM ==="
gh pr view $PR_NUM --repo $REPO 2>&1
echo ""
echo "=== Changed files ==="
gh pr diff $PR_NUM --repo $REPO 2>&1 | head -50
