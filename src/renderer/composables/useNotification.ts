// composables/useNotification.ts
import { getCurrentInstance } from "vue";

export const useNotification = () => {
  const instance = getCurrentInstance();

  const showSuccess = (message: string) => {
    if (instance?.appContext.config.globalProperties.$toast) {
      instance.appContext.config.globalProperties.$toast("success", message);
    } else {
      window.dispatchEvent(
        new CustomEvent("notification-toast", {
          detail: { type: "success", message },
        }),
      );
    }
  };

  const showError = (message: string) => {
    if (instance?.appContext.config.globalProperties.$toast) {
      instance.appContext.config.globalProperties.$toast("error", message);
    } else {
      window.dispatchEvent(
        new CustomEvent("notification-toast", {
          detail: { type: "error", message },
        }),
      );
    }
  };

  const showInfo = (message: string) => {
    if (instance?.appContext.config.globalProperties.$toast) {
      instance.appContext.config.globalProperties.$toast("info", message);
    } else {
      window.dispatchEvent(
        new CustomEvent("notification-toast", {
          detail: { type: "info", message },
        }),
      );
    }
  };

  return {
    showSuccess,
    showError,
    showInfo,
  };
};
