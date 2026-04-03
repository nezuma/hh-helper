import { app, BrowserWindow, ipcMain, session } from "electron";
import { join } from "path";
import { fileURLToPath } from "url";
import { existsSync, writeFileSync, readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

let mainWindow: BrowserWindow | null = null;

const COOKIES_FILE = join(app.getPath("userData"), "hh_cookies.json");
const HH_URL = "https://ramenskoe.hh.ru";

// Сохраняем куки для iframe
const saveCookies = async () => {
  const cookies = await session.defaultSession.cookies.get({ url: HH_URL });
  writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
};

// Загружаем куки
const loadCookies = async () => {
  if (!existsSync(COOKIES_FILE)) return;
  const cookies = JSON.parse(readFileSync(COOKIES_FILE, "utf-8"));
  for (const cookie of cookies) {
    try {
      await session.defaultSession.cookies.set({
        url: HH_URL,
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        expirationDate: cookie.expirationDate,
      });
    } catch (e) {}
  }
};

ipcMain.handle("check-auth", async () => {
  const cookies = await session.defaultSession.cookies.get({ url: HH_URL });
  const hasAuth = cookies.some(
    (c) => c.name === "hhrole" && c.value === "applicant",
  );
  return { isAuthorized: hasAuth };
});

async function createWindow() {
  await loadCookies();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      webviewTag: true, // ← ЭТО ВАЖНО!
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
