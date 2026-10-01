# Claude Code Statusline — Local Installation Guide

```bash
brew install jq    # required for JSON parsing
# curl and git are already installed on macOS
```

## Install (from local repo)

```bash
# From the repo root:
node .claude/statusline/bin/install.js
```

This will:

1. Copy `statusline.sh` to `~/.claude/statusline.sh`
2. Update `~/.claude/settings.json` with the statusLine config
3. Back up any existing statusline script

Then **restart Claude Code** to see the status line.

## What it shows

**Line 1:** `Model | Context 23% | dirname (branch*) | 12m | thinking`

- Model name (e.g., Claude Opus 4.6)
- Context window usage percentage (color-coded green/yellow/red)
- Current directory + git branch + dirty indicator
- Session duration
- Thinking mode on/off

**Lines 2-3 (rate limits):**

```
current ●●●○○○○○○○  30% ⟳ 2:45pm
weekly  ●○○○○○○○○○  12% ⟳ mar 15, 4:00pm
```

Rate limit data requires OAuth login (not API key). Cached for 60 seconds.

## Uninstall

```bash
node .claude/statusline/bin/install.js --uninstall
```

## Manual install (alternative)

If you prefer not to run the installer:

```bash
# 1. Copy the script
cp .claude/statusline/bin/statusline.sh ~/.claude/statusline.sh
chmod 755 ~/.claude/statusline.sh

# 2. Add to ~/.claude/settings.json (merge with existing settings):
# "statusLine": {
#   "type": "command",
#   "command": "bash \"$HOME/.claude/statusline.sh\""
# }
```

## Troubleshooting

| Issue                   | Fix                                    |
| ----------------------- | -------------------------------------- |
| No rate limit bars      | You need OAuth login, not API key auth |
| `jq: command not found` | `brew install jq`                      |
| Statusline not showing  | Restart Claude Code after install      |
| Want to revert          | Run with `--uninstall` flag            |
