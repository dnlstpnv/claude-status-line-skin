#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ── Colors ──────────────────────────────────────────────
const blue = '\x1b[38;2;0;153;255m';
const orange = '\x1b[38;2;255;176;85m';
const green = '\x1b[38;2;0;175;80m';
const cyan = '\x1b[38;2;86;182;194m';
const red = '\x1b[38;2;255;85;85m';
const yellow = '\x1b[38;2;230;200;0m';
const white = '\x1b[38;2;220;220;220m';
const magenta = '\x1b[38;2;180;140;255m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

const sep = ` ${dim}│${reset} `;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// ── Helpers ─────────────────────────────────────────────
function colorForPct(pct) {
	if (pct >= 90) return red;
	if (pct >= 70) return yellow;
	if (pct >= 50) return orange;
	return green;
}

function buildBar(pct, width) {
	const clamped = Math.min(Math.max(pct, 0), 100);
	const filled = Math.floor((clamped * width) / 100);
	return `${colorForPct(pct)}${'●'.repeat(filled)}${dim}${'○'.repeat(width - filled)}${reset}`;
}

function formatClock(date) {
	const hours = date.getHours() % 12 || 12;
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${hours}:${minutes}${date.getHours() >= 12 ? 'pm' : 'am'}`;
}

function formatReset(epochSeconds, withDate) {
	if (typeof epochSeconds !== 'number') return '';
	const date = new Date(epochSeconds * 1000);
	const clock = formatClock(date);
	return withDate ? `${MONTHS[date.getMonth()]} ${date.getDate()}, ${clock}` : clock;
}

function formatDuration(ms) {
	const elapsed = Math.floor(ms / 1000);
	if (elapsed >= 3600) return `${Math.floor(elapsed / 3600)}h${Math.floor((elapsed % 3600) / 60)}m`;
	if (elapsed >= 60) return `${Math.floor(elapsed / 60)}m`;
	return `${elapsed}s`;
}

function git(cwd, args) {
	try {
		return execFileSync('git', ['--no-optional-locks', '-C', cwd, ...args], {
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'ignore'],
			timeout: 1000,
		}).trim();
	} catch {
		return null;
	}
}

function contextPct(contextWindow) {
	if (typeof contextWindow.used_percentage === 'number') return Math.floor(contextWindow.used_percentage);
	const usage = contextWindow.current_usage;
	const size = contextWindow.context_window_size || 200000;
	if (!usage) return 0;
	const current = (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0);
	return Math.floor((current * 100) / size);
}

// ── Read input ──────────────────────────────────────────
let data;
try {
	data = JSON.parse(fs.readFileSync(0, 'utf-8'));
} catch {
	process.stdout.write('Claude');
	process.exit(0);
}

// ── LINE 1: Model │ Context % │ Directory (branch) │ Session │ Thinking ──
const modelName = data.model?.display_name || 'Claude';
const pctUsed = contextPct(data.context_window || {});
const cwd = data.workspace?.current_dir || data.cwd || process.cwd();

let line1 = `${blue}${modelName}${reset}`;
line1 += `${sep}✍️ ${colorForPct(pctUsed)}${pctUsed}%${reset}`;
line1 += `${sep}${cyan}${path.basename(cwd)}${reset}`;

const branch = git(cwd, ['symbolic-ref', '--short', 'HEAD']);
if (branch) {
	const dirty = git(cwd, ['status', '--porcelain']) ? '*' : '';
	line1 += ` ${green}(${branch}${red}${dirty}${green})${reset}`;
}

const durationMs = data.cost?.total_duration_ms;
if (typeof durationMs === 'number') {
	line1 += `${sep}${dim}⏱ ${reset}${white}${formatDuration(durationMs)}${reset}`;
}

line1 += sep;
line1 += data.thinking?.enabled ? `${magenta}◐ thinking${reset}` : `${dim}◑ thinking${reset}`;

// ── Rate limit lines (Pro/Max subscribers, after the first API response) ──
const rateLines = [];
const windows = [
	['current', data.rate_limits?.five_hour, false],
	['weekly ', data.rate_limits?.seven_day, true],
	['spend  ', data.rate_limits?.spend_limit, true],
];

for (const [label, window, withDate] of windows) {
	if (!window || typeof window.used_percentage !== 'number') continue;
	const pct = Math.round(window.used_percentage);
	const resetAt = formatReset(window.resets_at, withDate);
	let line = `${white}${label}${reset} ${buildBar(pct, 10)} ${colorForPct(pct)}${String(pct).padStart(3)}%${reset}`;
	if (resetAt) line += ` ${dim}⟳${reset} ${white}${resetAt}${reset}`;
	rateLines.push(line);
}

// ── Output ──────────────────────────────────────────────
process.stdout.write(line1);
if (rateLines.length > 0) process.stdout.write(`\n\n${rateLines.join('\n')}`);
