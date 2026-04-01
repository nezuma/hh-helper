<!-- App.vue -->
<template>
  <div id="app">
    <RouterView />
    <NotificationToast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import NotificationToast from "./components/notification-toast.vue";
import { toastRef } from "./main";
import { onMounted } from "vue";

onMounted(() => {
  // Передаем ref в main
  if (toastRef.value) {
    console.log("Toast ready");
  }
});
</script>
