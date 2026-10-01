# claude-status-line-skin

A two-part status line for [Claude Code](https://code.claude.com/docs/en/statusline): session info on the
first line, plan rate-limit bars below it.

```
Opus │ ✍️ 23% │ my-project (main*) │ ⏱ 12m │ ◑ thinking

current ●●○○○○○○○○  23% ⟳ 2:45pm
weekly  ●●●●○○○○○○  41% ⟳ mar 15, 4:00pm
```

## Install

```bash
npx github:dnlstpnv/claude-status-line-skin
```

Restart Claude Code to see the status line.

The installer:

1. Copies `bin/statusline.js` to `~/.claude/statusline.js`, backing up an existing one to `statusline.js.bak`
2. Sets this entry in `~/.claude/settings.json`, keeping all other settings:

   ```json
   "statusLine": {
     "type": "command",
     "command": "node \"$HOME/.claude/statusline.js\""
   }
   ```

To install from a clone instead, run `node bin/install.js` from the repository root. To install by hand, copy
`bin/statusline.js` to `~/.claude/statusline.js` and add the entry above to `~/.claude/settings.json`.

## Requirements

- Node.js 18 or later
- `git`, optional: without it the branch segment is hidden

## What it shows

**Line 1**

- Model name
- Context window usage, color-coded: green under 50%, orange from 50%, yellow from 70%, red from 90%
- Current directory, git branch, and `*` when the working tree is dirty
- Session duration
- Whether extended thinking is on for the session

**Rate-limit lines**

- `current`: 5-hour window usage and its reset time
- `weekly`: 7-day window usage and its reset date
- `spend`: spend-limit usage and its reset date, only behind a Claude apps gateway that sets one

All data comes from the JSON Claude Code passes to the status line; the script makes no network calls and
reads no credentials. Claude Code sends rate limits only to claude.ai Pro and Max subscribers, and only after
the first API response in a session, so the bars appear after your first message.

## Update

Run the install command again. It replaces the script and leaves the settings entry as it is.

## Uninstall

```bash
npx github:dnlstpnv/claude-status-line-skin --uninstall
```

This restores `statusline.js.bak` if one exists (otherwise deletes `~/.claude/statusline.js`) and removes the
`statusLine` entry from `~/.claude/settings.json`.

## Upgrading from 1.x

Version 1 was a bash script that needed `jq` and `curl` and fetched usage data with your OAuth token. Running
the installer switches the settings entry to the Node script and tells you if the old
`~/.claude/statusline.sh` is still there; delete it once nothing else uses it. The 1.x `extra` usage line is
gone, because Claude Code does not pass extra-usage data to status lines.

## Troubleshooting

| Issue                     | Fix                                                                |
| ------------------------- | ------------------------------------------------------------------ |
| No rate-limit bars        | Send a message first; bars need a Pro or Max login, not an API key |
| `node: command not found` | Install Node.js 18 or later                                        |
| Status line not showing   | Restart Claude Code after installing                               |
| No branch shown           | Install `git`, or check that the directory is a git repository     |

## License

MIT
