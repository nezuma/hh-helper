<!-- App.vue -->
<template>
  <div id="app">
    <RouterView />
    <NotificationToast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import NotificationToast from "./components/notification-toast.vue";
import { notificationBus } from "./composables/eventBus";
import { onMounted, ref } from "vue";

const toastRef = ref<InstanceType<typeof NotificationToast> | null>(null);

onMounted(() => {
  // Регистрируем методы в глобальный bus
  if (toastRef.value) {
    notificationBus.value.showSuccess = (msg: string) =>
      toastRef.value?.showSuccess(msg);
    notificationBus.value.showError = (msg: string) =>
      toastRef.value?.showError(msg);
    notificationBus.value.showInfo = (msg: string) =>
      toastRef.value?.showInfo(msg);
  }
});
</script>
