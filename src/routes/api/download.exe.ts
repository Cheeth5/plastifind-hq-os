import { createFileRoute } from "@tanstack/react-router";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// The TanStack server lives in .output/server/; resolve the installer relative
// to the repository root so it works both in the embedded server and in the
// standalone desktop app.
// Computed lazily: on the web host import.meta.url is undefined, and evaluating
// this at module load crashed every page of the published site.
function findExePath(): string | null {
  let __dirname: string;
  try {
    __dirname = dirname(fileURLToPath(import.meta.url));
  } catch {
    return null;
  }
  // In the packaged Electron app, `process.resourcesPath` points at the
  // `resources/` folder that sits beside `app.asar`.
  const resourcesPath =
    (process as unknown as { resourcesPath?: string }).resourcesPath;

  const candidates = [
    // Packaged desktop app: installer staged next to app.asar.
    resourcesPath ? resolve(resourcesPath, "PlastiFind-Setup.exe") : null,
    resourcesPath ? resolve(resourcesPath, "..", "PlastiFind-Setup.exe") : null,
    // Common places the source-tree / unpacked app keeps the installer.
    resolve(__dirname, "..", "..", "..", "..", "desktop", "release", "PlastiFind-Setup.exe"),
    resolve(__dirname, "..", "..", "..", "desktop", "release", "PlastiFind-Setup.exe"),
    resolve(__dirname, "..", "..", "desktop", "release", "PlastiFind-Setup.exe"),
    resolve(__dirname, "..", "desktop", "release", "PlastiFind-Setup.exe"),
    // Fallback: resolve from the current working directory (repo root).
    resolve(process.cwd(), "desktop", "release", "PlastiFind-Setup.exe"),
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export const Route = createFileRoute("/api/download/exe")({
  server: {
    handlers: {
      GET: async (ctx) => {
        const exePath = findExePath();
        if (!exePath) {
          return new Response(
            JSON.stringify({
              error: "installer_not_available",
              message:
                "L'installateur n'est pas disponible sur cette version web. Téléchargez l'application de bureau pour obtenir PlastiFind-Setup.exe.",
            }),
            {
              status: 404,
              headers: { "Content-Type": "application/json; charset=utf-8" },
            },
          );
        }
        return new Response(readFileSync(exePath), {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": 'attachment; filename="PlastiFind-Setup.exe"',
            "Content-Length": String(statSync(exePath).size),
          },
        });
      },
    },
  },
});
