/**
 * Desktop distribution pipeline (Windows, reproducible):
 *   1. Clean stale release/ artifacts (AV/file-lock storms hit the electron
 *      staging step (win-unpacked.tmp -> win-unpacked) with EPERM);
 *   2. Build the embedded web app as a Node server into .output/ (DESKTOP_BUILD=1);
 *   3. Stage it for electron-builder;
 *   4. Package Windows NSIS installer, retrying the staging step once if it
 *      hits EPERM (rare AV/file-lock transient). Exit 0 only on success.
 */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..', '..');
const desktopDir = path.join(rootDir, 'desktop');
const releaseDir = path.join(desktopDir, 'release');
const logPath = path.join(desktopDir, 'dist-build.log');
const logLines = [];

function log(msg) { logLines.push(msg); }
function emitLog() { fs.writeFileSync(logPath, logLines.join('\n') + '\n', 'utf8'); }

function sh(args, { name = 'script', cwd = rootDir } = {}) {
  log(`--- ${name} (${new Date().toISOString()}) ---`);
  const r = spawnSync(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'], cwd });
  const out = Buffer.concat(r.stdout?.length ? [r.stdout] : []).toString('utf8');
  const err = Buffer.concat(r.stderr?.length ? [r.stderr] : []).toString('utf8');
  if (out) log(out);
  if (err) log('[stderr]\n' + err);
  log(`[exit ${r.status}] ${name}`);
  emitLog();
  if (r.status !== 0) {
    console.error(`\u2717 ${name} failed (exit ${r.status}). See ${logPath}`);
    process.exit(r.status);
  }
  return r;
}

function cleanRelease() {
  if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
    log(`\u2715 cleaned ${releaseDir}`);
  }
}

// 1) Clean stale staging dirs (including failed win-unpacked.tmp dirs from
//    crashed runs) - the rename in electron-builder's staging step can hit
//    EPERM when Windows AV holds files in the release tree.
cleanRelease();
emitLog();

// 2) Embedded web app -> Node server into .output/ (DESKTOP_BUILD=1).
//    Runs with cwd=root so 'vite' resolves from the repo root.
sh([path.join(rootDir, 'scripts', 'build-desktop.mjs')], { name: 'build:desktop' });

// 3) Stage the built app into desktop/.output for electron-builder.
sh([path.join(desktopDir, 'stage.mjs')], { name: 'stage', cwd: desktopDir });

// 4) Windows NSIS packaging; the staging rename is intermittently blocked by
//    Windows AV/file-locks (EPERM) - clean and retry.
const MAX_RETRIES = 3;
let last = sh(
  [path.join(desktopDir, 'node_modules', 'electron-builder', 'cli.js'), '--win', 'nsis'],
  { name: 'electron-builder', cwd: desktopDir }
);
let attempt = 0;
while (last.status !== 0 && attempt < MAX_RETRIES) {
  attempt++;
  log(`\u25b6 retry ${attempt}/${MAX_RETRIES} after EPERM...`);
  cleanRelease();
  last = sh(
    [path.join(desktopDir, 'node_modules', 'electron-builder', 'cli.js'), '--win', 'nsis'],
    { name: 'electron-builder', cwd: desktopDir }
  );
}
if (last.status !== 0) {
  log(`\u2717 electron-builder failed after ${MAX_RETRIES} attempts.`);
  emitLog();
  console.error(
    `\u2717 electron-builder failed after ${MAX_RETRIES} attempts. ` +
      `Remove ${releaseDir} and retry. ` +
      `Staging step (win-unpacked.tmp -> win-unpacked) hits EPERM under Windows AV; ` +
      `a clean run usually succeeds.`
  );
  process.exit(last.status);
}
log(`\u2713 PlastiFind-Setup.exe ready in ${releaseDir}`);
emitLog();