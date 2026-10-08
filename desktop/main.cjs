/**
 * PlastiFind OS — Electron main process.
 *
 * The UI is NOT loaded from the live URL: scripts/build-desktop.mjs builds the
 * whole web app (SSR + client) into .output/, stage.mjs copies it here, and this
 * process spawns that Node server on 127.0.0.1 and opens a window on it.
 * Only auth/data traffic goes out — to Supabase, exactly like the web version.
 */
const { app, BrowserWindow, shell, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const PORT = 4517; // Fixed so it can be allow-listed in Supabase Auth redirect URLs.
const ORIGIN = `http://127.0.0.1:${PORT}`;
const SERVER_ENTRY = path.join(__dirname, ".output", "server", "index.mjs");

/** Hosts the app may navigate to in-place (SSO/OAuth); everything else opens externally. */
const IN_APP_HOSTS = [
  "127.0.0.1",
  "localhost",
  "supabase.co",
  "supabase.in",
  "google.com",
  "accounts.google.com",
  "appleid.apple.com",
  "microsoftonline.com",
  "live.com",
  "lovable.dev",
  "lovable.app",
];

let serverProcess = null;

function isInAppUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  return IN_APP_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith("." + h));
}

function waitForServer(port, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get({ host: "127.0.0.1", port, path: "/" }, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() > deadline) reject(new Error("Le serveur local n'a pas démarré à temps."));
        else setTimeout(attempt, 300);
      });
    };
    attempt();
  });
}

function startServer() {
  serverProcess = spawn(process.execPath, [SERVER_ENTRY], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      PORT: String(PORT),
      NITRO_PORT: String(PORT),
      HOST: "127.0.0.1",
      NITRO_HOST: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  serverProcess.stdout.on("data", (d) => process.stdout.write(`[serveur] ${d}`));
  serverProcess.stderr.on("data", (d) => process.stderr.write(`[serveur] ${d}`));
  serverProcess.on("exit", (code) => {
    if (code !== 0 && code !== null && app.isReady()) {
      dialog.showErrorBox(
        "PlastiFind OS",
        `Le serveur local s'est arrêté (code ${code}). Redémarrez l'application.`,
      );
      app.quit();
    }
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    autoHideMenuBar: true,
    backgroundColor: "#081A2B",
    title: "PlastiFind OS",
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });

  // Hide the Electron/Chromium tokens so SSO providers treat us like a normal browser.
  const ua = win.webContents
    .getUserAgent()
    .replace(/\sElectron\/[\d.]+/g, "")
    .replace(/\sPlastiFind\/[\d.]+/g, "");
  win.webContents.setUserAgent(ua);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isInAppUrl(url)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!isInAppUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.on("closed", () => app.quit());

  await win.loadURL(ORIGIN + "/");
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(async () => {
    const { default: net } = await import("node:net");
    const probe = net.createServer();
    const portFree = await new Promise((resolve) => {
      probe.once("error", () => resolve(false));
      probe.listen(PORT, "127.0.0.1", () => probe.close(() => resolve(true)));
    });
    if (!portFree) {
      dialog.showErrorBox(
        "PlastiFind OS",
        `Le port ${PORT} est déjà utilisé sur cette machine. Fermez l'application qui l'utilise puis réessayez.`,
      );
      app.quit();
      return;
    }

    startServer();
    try {
      await waitForServer(PORT);
    } catch (err) {
      dialog.showErrorBox("PlastiFind OS", String(err && err.message ? err.message : err));
      app.quit();
      return;
    }
    await createWindow();
  });

  app.on("window-all-closed", () => {
    if (serverProcess) serverProcess.kill();
    app.quit();
  });
  app.on("before-quit", () => {
    if (serverProcess) serverProcess.kill();
  });
}
