// Обновленный fetcher.ts
import router from "../router/router";
import { useNotification } from "../composables/eventBus";
import { setCookie } from "./setCookies";

interface IFetcher {
  url: string;
  method: string;
  body?: object;
  headers?: any;
}

export const fetcher = async ({ url, method, body, headers }: IFetcher) => {
  const { showSuccess, showError } = useNotification();

  const api = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const query = window.location.search;
  console.log(query);

  try {
    const res = await fetch(`${api}${url}${query ? query : ""}`, {
      method: method,
      headers: headers || { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await res.json();

    if (data) {
      if (!res.ok && data.alert == true) {
        showError(data.msg || "Произошла ошибка");
        console.log(1);
        if (res.status == 401) {
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
  }
};
