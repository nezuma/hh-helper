// Обновленный fetcher.ts
import router from "../router/router";
import { useNotification } from "../composables/useNotification";

interface IFetcher {
  url: string;
  method: string;
  body?: object;
  headers?: any;
}

export const fetcher = async ({ url, method, body, headers }: IFetcher) => {
  const { showSuccess, showError } = useNotification();

  // Используем import.meta.env вместо process.env
  const api = import.meta.env.VITE_API_URL || "http://localhost:4000";

  try {
    const res = await fetch(`${api}${url}`, {
      method: method,
      headers: headers || { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await res.json();

    if (data) {
      if (!res.ok && data.alert == true) {
        showError(data.msg || "Произошла ошибка");
        if (res.status == 401) {
          router.push("/auth");
        }
      }
      if (!data.alert) {
        return data;
      }
      if (data.code) {
        console.log(`${data.msg} | Код: ${String(data.code)}`);
        showSuccess(`${data.msg} | Код: ${String(data.code)}`);
        return data;
      }
      showSuccess(data.msg);
      return data;
    }

    return;
  } catch (e) {
    console.log(e);
    showError("Непредвиденная ошибка");
  }
};
