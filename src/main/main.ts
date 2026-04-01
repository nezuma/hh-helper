// src/main/main.ts
import "dotenv/config";
import { join } from "path";
import { fileURLToPath } from "url";
import { app, BrowserWindow } from "electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

function createWindow() {
  const isDev = process.env.NODE_ENV === "development";

  // В dev режиме используем исходный файл
  const preloadPath = isDev
    ? join(__dirname, "../../src/preload/preload.ts")
    : join(__dirname, "../preload/preload.js");

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(createWindow);
