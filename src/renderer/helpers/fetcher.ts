import router from "../router/router";
import { emitter } from "../composables/eventBus";

interface IFetcher {
  url: string;
  method: string;
  body?: object;
  headers?: any;
}

export const fetcher = async ({ url, method, body, headers }: IFetcher) => {
  const api = import.meta.env.VITE_API_URL;
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
        emitter.emit("show-error", data.msg || data);
        if (res.status == 401) {
          router.push("/auth");
        }
      }
      if (!data.alert) {
        return data;
      }
      if (data.code) {
        console.log(
          `${data.msg} | Код видимый администрации: ${String(data.code)}`,
        );
        emitter.emit(
          "show-success",
          `${data.msg} | Код видимый администрации: ${String(data.code)}`,
        );
        return data;
      }
      emitter.emit("show-success", data.msg);
      return data;
    }

    return;
  } catch (e) {
    console.log(e);
    emitter.emit("show-error", "Непредвиденная ошибка");
  }
};
