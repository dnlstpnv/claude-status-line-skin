# claude-status-line-skin

A two-part status line for [Claude Code](https://docs.claude.com/en/docs/claude-code): session info on the
first line, plan rate-limit bars below it.

```
Claude Opus │ ✍️ 23% │ my-project (main*) │ ⏱ 12m │ ◑ thinking

current ●●●○○○○○○○  30% ⟳ 2:45pm
weekly  ●○○○○○○○○○  12% ⟳ mar 15, 4:00pm
```

## What it shows

**Line 1**

- Model name
- Context window usage, color-coded: green under 50%, orange from 50%, yellow from 70%, red from 90%
- Current directory, git branch, and `*` when the working tree is dirty
- Session duration
- Whether extended thinking is on (`alwaysThinkingEnabled` in `~/.claude/settings.json`)

**Rate-limit lines** (only with a Claude subscription login, not an API key)

- `current`: 5-hour window usage and its reset time
- `weekly`: 7-day window usage and its reset date
- `extra`: extra-usage spend against the monthly limit, when extra usage is enabled

Usage data is fetched from Anthropic with your existing Claude Code OAuth token and cached for 60 seconds in
`/tmp/claude/statusline-usage-cache.json`. The token is read at runtime from `CLAUDE_CODE_OAUTH_TOKEN`, the
macOS Keychain, `~/.claude/.credentials.json`, or the Linux secret service; it is never written anywhere.

## Requirements

- `jq`, `curl`, `git` (`brew install jq` on macOS; `curl` and `git` ship with it)
- Node.js, for the installer only

## Install

```bash
git clone git@github.com:dnlstpnv/claude-status-line-skin.git
cd claude-status-line-skin
node bin/install.js
```

The installer:

1. Copies `bin/statusline.sh` to `~/.claude/statusline.sh`, backing up an existing one to `statusline.sh.bak`
2. Adds this entry to `~/.claude/settings.json`, keeping all other settings:

   ```json
   "statusLine": {
     "type": "command",
     "command": "bash \"$HOME/.claude/statusline.sh\""
   }
   ```

Restart Claude Code to see the status line.

To install by hand instead, copy `bin/statusline.sh` to `~/.claude/statusline.sh`, run
`chmod 755 ~/.claude/statusline.sh`, and add the entry above to `~/.claude/settings.json`.

## Update

Pull the latest version and run the installer again:

```bash
git pull && node bin/install.js
```

## Uninstall

```bash
node bin/install.js --uninstall
```

This restores `statusline.sh.bak` if one exists (otherwise deletes `~/.claude/statusline.sh`) and removes the
`statusLine` entry from `~/.claude/settings.json`.

## Troubleshooting

| Issue                   | Fix                                                  |
| ----------------------- | ---------------------------------------------------- |
| No rate-limit bars      | Log in with a Claude subscription, not an API key    |
| `jq: command not found` | `brew install jq`                                    |
| Status line not showing | Restart Claude Code after installing                 |
| Want to revert          | `node bin/install.js --uninstall`                    |

## License

MIT
