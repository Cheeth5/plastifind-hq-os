// Minimal, secure preload: exposes app metadata only — no Node access to the page.
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("plastifindDesktop", {
  isDesktop: true,
  version: process.env.npm_package_version || "1.0.0",
});
