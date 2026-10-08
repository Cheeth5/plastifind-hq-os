const { app, BrowserWindow, shell, Menu } = require("electron");
const URL_APP = "https://plastifind.lovable.app/dashboard";
const ORIGIN = new URL(URL_APP).origin;
if (!app.requestSingleInstanceLock()) app.quit();
let win;
function create() {
  win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 900, minHeight: 600,
    backgroundColor: "#081A2B", title: "PlastiFind OS", show: false,
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  Menu.setApplicationMenu(null);
  win.loadURL(URL_APP);
  win.once("ready-to-show", () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(ORIGIN) || url.includes("accounts.google.com") || url.includes("supabase")) return { action: "allow" };
    shell.openExternal(url); return { action: "deny" };
  });
  win.webContents.on("did-fail-load", () => {
    win.loadURL("data:text/html,<body style='background:%23081A2B;color:%23E8F4FB;font-family:sans-serif;display:grid;place-items:center;height:100vh'><div style='text-align:center'><h2>Connexion impossible</h2><p>Vérifiez votre connexion internet puis relancez PlastiFind OS.</p></div></body>");
  });
}
app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(create);
app.on("window-all-closed", () => app.quit());
