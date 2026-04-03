// Обновленный fetcher.ts
import { useNotification } from "../composables/eventBus";
import router from "../router/router";
import { setCookie } from "./setCookies";

interface IFetcher {
  url: string;
  method: string;
  body?: object;
  headers?: any;
}
const { showSuccess, showError } = useNotification();

export const fetcher = async ({ url, method, body, headers }: IFetcher) => {
  const api = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const query = window.location.search;

  try {
    const res = await fetch(`${api}${url}${query ? query : ""}`, {
      method: method,
      headers: headers || { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    console.log(res);
    const data = res.body ? await res.json() : res;

    if (data) {
      if (!res.ok && data.alert == true) {
        showError(data.msg || "Произошла ошибка");
        if (res.status == 401 && window.location.pathname !== "/") {
          router.push("/auth");
        }
        return data;
      }
      if (!data.alert) {
        return data;
      }
      if (data.accessToken) {
        setCookie("accessToken", data.accessToken, 15 * 60 * 1000);
      }
      if (data.refreshToken) {
        setCookie("refreshToken", data.refreshToken, 7 * 24 * 60 * 1000);
      }
      showSuccess(data.msg);
      return { ...data, success: true };
    }

    return;
  } catch (e) {
    console.log(e);

    // Проверяем тип ошибки
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      showError("Не удалось подключиться к серверу. Проверьте соединение.");
    }
    // Проверка на ошибку соединения (ERR_CONNECTION_REFUSED)
    else if (
      e instanceof Error &&
      e.message.includes("ERR_CONNECTION_REFUSED")
    ) {
      showError("Сервер недоступен. Пожалуйста, попробуйте позже.");
    } else if (e instanceof Error && e.message.includes("NetworkError")) {
      showError("Ошибка сети. Проверьте интернет-соединение.");
    } else if (e instanceof Error && e.message.includes("timeout")) {
      showError("Превышено время ожидания ответа от сервера.");
    } else {
      showError("Непредвиденная ошибка. Попробуйте позже.");
    }
    // window.location.replace("/loading");
  }
};
