// main.ts
import App from "./App.vue";
import { createApp, ref } from "vue";
import router from "./router/router";
import NotificationToast from "./components/notification-toast.vue";

const app = createApp(App);

// Создаем ref для компонента уведомлений
const toastRef = ref<InstanceType<typeof NotificationToast> | null>(null);

// Добавляем глобальное свойство
app.config.globalProperties.$toast = (
  type: "success" | "error" | "info",
  message: string,
) => {
  if (toastRef.value) {
    if (type === "success") toastRef.value.showSuccess(message);
    if (type === "error") toastRef.value.showError(message);
    if (type === "info") toastRef.value.showInfo(message);
  }
};

app.use(router);
app.mount("#app");

// Экспортируем toastRef для использования в компонентах
export { toastRef };
