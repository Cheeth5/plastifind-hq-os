/**
 * Builds the whole web app (SSR + client) as a Node server into .output/
 * so the Electron desktop app can embed it. Run: npm run build:desktop
 */
import { spawnSync } from "node:child_process";

const result = spawnSync("npx vite build", {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DESKTOP_BUILD: "1" },
});

process.exit(result.status ?? 1);
