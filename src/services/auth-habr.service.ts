// services/auth.service.ts
import { BrowserWindow, session } from "electron";
import Store from "electron-store";

interface AuthData {
  cookies: string;
  lastAuth: number;
  userData?: any;
}

const store = new Store<{ habrAuth: AuthData | null }>({
  name: "habr-auth",
  defaults: {
    habrAuth: null,
  },
});

export class HabrAuthService {
  private authWindow: BrowserWindow | null = null;
  private readonly AUTH_URL =
    "https://account.habr.com/ru/ident/Q9SPQn1Rd9tHIWauBNMDyc3b2Qs5jt5kz1VnfaDgcmqaVbwe4iUa0BsROw8yoy1MWio5TngufzSnbBjxQNko4hJK6HoK8TpIha7gaam68R166olpp9W5xYqu_M2e2P6Vu4aOepjbVyn0gWOrFYidQO07H_xDsXiFazse_eMSQ7tFlru6GgdtJP5LdqDOnuOOcPYNZeMAuhutEKtT";
  private readonly COOKIE_DOMAINS = [
    ".habr.com",
    ".career.habr.com",
    ".account.habr.com",
  ];

  async authenticate(): Promise<boolean> {
    return new Promise((resolve) => {
      // Создаем окно авторизации
      this.authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        parent: BrowserWindow.getFocusedWindow() || undefined,
        modal: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      // Загружаем страницу авторизации
      this.authWindow.loadURL(this.AUTH_URL);

      // Слушаем изменения URL для перехвата успешной авторизации
      this.authWindow.webContents.on("did-navigate", async (event, url) => {
        await this.handleNavigation(url, resolve);
      });

      this.authWindow.webContents.on(
        "did-navigate-in-page",
        async (event, url) => {
          await this.handleNavigation(url, resolve);
        },
      );

      // Обработка закрытия окна
      this.authWindow.on("closed", () => {
        this.authWindow = null;
        resolve(false);
      });
    });
  }

  private async handleNavigation(
    url: string,
    resolve: (value: boolean) => void,
  ) {
    // Если перешли на главную Хабр или Карьеру - авторизация успешна
    if (url.includes("habr.com") && !url.includes("account.habr.com")) {
      await this.saveCookies();
      if (this.authWindow) {
        this.authWindow.close();
      }
      resolve(true);
    }
  }

  private async saveCookies(): Promise<void> {
    const allCookies: string[] = [];

    for (const domain of this.COOKIE_DOMAINS) {
      const cookies = await session.defaultSession.cookies.get({ domain });

      for (const cookie of cookies) {
        // Сохраняем важные cookie для авторизации
        if (
          cookie.name.includes("session") ||
          cookie.name.includes("auth") ||
          cookie.name.includes("token") ||
          cookie.name === "_career_session" ||
          cookie.name === "staff"
        ) {
          allCookies.push(`${cookie.name}=${cookie.value}`);
        }
      }
    }

    const cookieString = allCookies.join("; ");

    // Сохраняем в store
    store.set("habrAuth", {
      cookies: cookieString,
      lastAuth: Date.now(),
    });

    // Также устанавливаем cookies в сессию приложения
    await this.setCookiesToSession();
  }

  private async setCookiesToSession(): Promise<void> {
    const authData = store.get("habrAuth");
    if (!authData) return;

    // Парсим cookies
    const cookies = authData.cookies.split("; ").map((cookie) => {
      const [name, value] = cookie.split("=");
      return { name, value, url: "https://habr.com" };
    });

    // Устанавливаем каждую cookie
    for (const cookie of cookies) {
      if (cookie.name && cookie.value) {
        await session.defaultSession.cookies.set(cookie);
      }
    }
  }

  getAuthCookies(): string | null {
    const authData = store.get("habrAuth");
    if (!authData) return null;

    // Проверяем, не истекла ли авторизация (например, через 30 дней)
    const daysSinceAuth =
      (Date.now() - authData.lastAuth) / (1000 * 60 * 60 * 24);
    if (daysSinceAuth > 30) {
      this.clearAuth();
      return null;
    }

    return authData.cookies;
  }

  clearAuth(): void {
    store.delete("habrAuth");
  }

  isAuthenticated(): boolean {
    return !!this.getAuthCookies();
  }
}

export const habrAuth = new HabrAuthService();
