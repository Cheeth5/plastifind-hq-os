/**
 * Copies the root desktop build (.output produced with DESKTOP_BUILD=1)
 * into desktop/.output so electron-builder packs exactly one self-contained app.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "..", ".output");
const dest = path.join(__dirname, ".output");

if (!fs.existsSync(path.join(src, "server", "index.mjs"))) {
  console.error(
    "Missing ../.output/server/index.mjs — run `npm run build:desktop` from the repo root first.",
  );
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`Staged ${src} -> ${dest}`);
