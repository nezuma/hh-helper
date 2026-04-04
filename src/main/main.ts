import { app, BrowserWindow, ipcMain, session } from "electron";
import { join } from "path";
import { fileURLToPath } from "url";
import { existsSync, readFileSync, writeFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

let mainWindow: BrowserWindow | null = null;
let habrAuthWindow: BrowserWindow | null = null;

// Файлы для хранения данных habr
const HABR_COOKIES_FILE = join(app.getPath("userData"), "habr_cookies.json");
const HABR_STORAGE_FILE = join(app.getPath("userData"), "habr_storage.json");
const HABR_URL = "https://habr.com";
const HABR_CAREER_URL = "https://career.habr.com";
const HABR_AUTH_URL =
  "https://career.habr.com/?utm_source=habr_account&utm_medium=habr_top_panel";

const setupSession = async () => {
  // Разрешаем все cookies
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const cookies = details.responseHeaders?.["set-cookie"];
    if (cookies) {
      // Модифицируем cookies, добавляя SameSite=None и Secure где нужно
      const modifiedCookies = cookies.map((cookie) => {
        if (!cookie.includes("SameSite")) {
          cookie += "; SameSite=None";
        }
        if (!cookie.includes("Secure") && details.url.startsWith("https://")) {
          cookie += "; Secure";
        }
        return cookie;
      });
      details.responseHeaders!["set-cookie"] = modifiedCookies;
    }
    callback({ responseHeaders: details.responseHeaders });
  });

  // Разрешаем сохранение cookies
  await session.defaultSession.cookies.flushStore();
};

// Загрузка сохраненных данных habr
const loadHabrData = async () => {
  if (existsSync(HABR_COOKIES_FILE)) {
    const cookies = JSON.parse(readFileSync(HABR_COOKIES_FILE, "utf-8"));
    for (const cookie of cookies) {
      try {
        await session.defaultSession.cookies.set(cookie);
      } catch (e) {}
    }
  }
};

// Сохранение всех данных из окна авторизации
const saveHabrDataFromWindow = async (authWin: BrowserWindow) => {
  const domains = [HABR_URL, HABR_CAREER_URL, "https://account.habr.com"];
  const allCookies = [];

  for (const domain of domains) {
    const cookies = await session.defaultSession.cookies.get({ url: domain });
    allCookies.push(...cookies);
  }

  writeFileSync(HABR_COOKIES_FILE, JSON.stringify(allCookies, null, 2));

  try {
    const storageData = await authWin.webContents.executeJavaScript(`
      ({
        localStorage: { ...window.localStorage },
        sessionStorage: { ...window.sessionStorage }
      })
    `);
    writeFileSync(HABR_STORAGE_FILE, JSON.stringify(storageData, null, 2));
  } catch (e) {
    console.error("Error saving storage:", e);
  }
};

// Очистка всех данных habr
const clearHabrData = async () => {
  const domains = [HABR_URL, HABR_CAREER_URL, "https://account.habr.com"];
  for (const domain of domains) {
    const cookies = await session.defaultSession.cookies.get({ url: domain });
    for (const cookie of cookies) {
      await session.defaultSession.cookies.remove(domain, cookie.name);
    }
  }

  if (existsSync(HABR_COOKIES_FILE)) {
    writeFileSync(HABR_COOKIES_FILE, JSON.stringify([]));
  }
  if (existsSync(HABR_STORAGE_FILE)) {
    writeFileSync(HABR_STORAGE_FILE, JSON.stringify({}));
  }
};

// Проверка, что мы на странице вакансий
const isVacanciesPage = (url: string): boolean => {
  return (
    url.includes("/vacancies") &&
    !url.includes("/auth") &&
    !url.includes("/login")
  );
};

// IPC Handlers
ipcMain.handle("habr-check-auth", async () => {
  const cookies = await session.defaultSession.cookies.get({
    url: HABR_CAREER_URL,
  });
  const hasAuth = cookies.some((c) => c.name === "_career_session");
  return { isAuthorized: hasAuth };
});

ipcMain.handle("habr-authenticate", async () => {
  return new Promise((resolve) => {
    if (habrAuthWindow && !habrAuthWindow.isDestroyed()) {
      habrAuthWindow.focus();
      resolve({ success: false, message: "Auth window already open" });
      return;
    }

    habrAuthWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      parent: mainWindow || undefined,
      modal: true,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webviewTag: true,
        partition: "persist:habr", // Сохранять cookies между сессиями
      },
    });

    let isResolved = false;

    // Загружаем страницу
    habrAuthWindow.loadURL(HABR_AUTH_URL);

    // Обработчик навигации - следим за редиректами
    const handleNavigation = async (url: string) => {
      console.log(`🌐 Навигация: ${url}`);

      // Игнорируем запросы к метрикам и рекламе
      if (
        url.includes("mc.yandex.ru") ||
        url.includes("metrika") ||
        url.includes("google-analytics")
      ) {
        return;
      }

      // Проверяем, не попали ли мы на страницу вакансий
      if (
        isVacanciesPage(url) &&
        !isResolved &&
        habrAuthWindow &&
        !habrAuthWindow.isDestroyed()
      ) {
        console.log(
          "✅ Попали на страницу вакансий! Сохраняем данные и закрываем окно.",
        );
        isResolved = true;

        // Даем время для полной загрузки страницы и установки всех cookies
        setTimeout(async () => {
          await saveHabrDataFromWindow(habrAuthWindow!);
          if (habrAuthWindow && !habrAuthWindow.isDestroyed()) {
            habrAuthWindow.close();
          }
          resolve({ success: true, message: "Successfully authenticated" });
        }, 2000);
      }
    };

    // Слушаем все события навигации
    habrAuthWindow.webContents.on("did-navigate", (event, url) => {
      handleNavigation(url);
    });

    habrAuthWindow.webContents.on("did-navigate-in-page", (event, url) => {
      handleNavigation(url);
    });

    // Также проверяем при завершении загрузки
    habrAuthWindow.webContents.on("did-finish-load", async () => {
      const currentUrl = habrAuthWindow?.webContents.getURL();
      console.log(`📄 Страница загружена: ${currentUrl}`);

      if (currentUrl && isVacanciesPage(currentUrl) && !isResolved) {
        console.log("✅ Страница вакансий загружена!");
        isResolved = true;

        setTimeout(async () => {
          await saveHabrDataFromWindow(habrAuthWindow!);
          if (habrAuthWindow && !habrAuthWindow.isDestroyed()) {
            habrAuthWindow.close();
          }
          resolve({ success: true, message: "Successfully authenticated" });
        }, 2000);
      }
    });

    // Обработчик закрытия окна
    habrAuthWindow.on("closed", () => {
      habrAuthWindow = null;
      if (!isResolved) {
        resolve({ success: false, message: "Auth window closed" });
      }
    });

    // Обработчик ошибок - не закрываем окно
    habrAuthWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription, validatedURL) => {
        console.error(
          `⚠️ Ошибка загрузки: ${validatedURL} - ${errorDescription}`,
        );
        // Не закрываем окно при ошибках загрузки сторонних ресурсов
        if (
          !validatedURL.includes("yandex.ru") &&
          !validatedURL.includes("metrika")
        ) {
          console.error("Critical error, but keeping window open");
        }
      },
    );

    // Открываем DevTools для отладки (только в разработке)
    if (process.env.NODE_ENV === "development") {
      setTimeout(() => {
        if (habrAuthWindow && !habrAuthWindow.isDestroyed()) {
          habrAuthWindow.webContents.openDevTools();
        }
      }, 1000);
    }
  });
});

ipcMain.handle("habr-fetch-vacancies", async (event, page: number = 1) => {
  try {
    const url = `${HABR_CAREER_URL}/api/frontend/vacancies?sort=relevance&type=all&currency=RUR&page=${page}`;

    const cookies = await session.defaultSession.cookies.get({
      url: HABR_CAREER_URL,
    });
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieString,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      credentials: "include",
    });

    if (response.status === 401) {
      await clearHabrData();
      return { needAuth: true, error: "Authentication required" };
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data, needAuth: false };
  } catch (error: any) {
    console.error("Error fetching vacancies:", error);
    return { error: error.message, needAuth: false };
  }
});

ipcMain.handle("habr-get-profile", async () => {
  try {
    const url = "https://career.habr.com/api/frontend_v1/users/me";

    const cookies = await session.defaultSession.cookies.get({
      url: HABR_CAREER_URL,
    });
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieString,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      credentials: "include",
    });

    if (response.status === 401) {
      await clearHabrData();
      return { needAuth: true, error: "Authentication required" };
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data, needAuth: false };
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return { error: error.message, needAuth: false };
  }
});

ipcMain.handle("habr-clear-auth", async () => {
  await clearHabrData();
  return { success: true };
});

// Создание главного окна
async function createWindow() {
  await setupSession();
  await loadHabrData();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      webviewTag: true,
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
