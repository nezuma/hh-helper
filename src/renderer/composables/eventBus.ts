// composables/useNotification.ts
import { ref } from "vue";

// Глобальный Event Bus для уведомлений
export const notificationBus = ref<{
  showSuccess: ((message: string) => void) | null;
  showError: ((message: string) => void) | null;
  showInfo: ((message: string) => void) | null;
}>({
  showSuccess: null,
  showError: null,
  showInfo: null,
});

export const useNotification = () => {
  const showSuccess = (message: string) => {
    if (notificationBus.value.showSuccess) {
      notificationBus.value.showSuccess(message);
    } else {
      // Fallback: через CustomEvent
      window.dispatchEvent(
        new CustomEvent("notification-toast", {
          detail: { type: "success", message },
        }),
      );
    }
  };

  const showError = (message: string) => {
    if (notificationBus.value.showError) {
      notificationBus.value.showError(message);
    } else {
      window.dispatchEvent(
        new CustomEvent("notification-toast", {
          detail: { type: "error", message },
        }),
      );
    }
  };

  const showInfo = (message: string) => {
    if (notificationBus.value.showInfo) {
      notificationBus.value.showInfo(message);
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
