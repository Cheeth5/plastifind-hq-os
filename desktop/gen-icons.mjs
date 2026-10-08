/**
 * Renders public/apple-touch-icon.svg into build/icon.png (512×512)
 * for Electron/NSIS. Run: npm run icons (from desktop/).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, "..", "public", "apple-touch-icon.svg");
const outDir = path.join(__dirname, "build");
const outPath = path.join(outDir, "icon.png");

const svg = fs.readFileSync(svgPath, "utf8");
const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 512 } });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, resvg.render().asPng());
console.log(`Wrote ${outPath}`);
