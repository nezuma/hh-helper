<!-- components/notification-toast.vue -->
<script setup lang="ts">
import { ref } from "vue";

interface Notification {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

const notifications = ref<Notification[]>([]);
let nextId = 0;

const showSuccess = (message: string) => {
  addNotification("success", message);
};

const showError = (message: string) => {
  addNotification("error", message);
};

const showInfo = (message: string) => {
  addNotification("info", message);
};

const addNotification = (
  type: "success" | "error" | "info",
  message: string,
) => {
  const id = nextId++;
  notifications.value.push({ id, type, message });

  setTimeout(() => {
    removeNotification(id);
  }, 5000);
};

const removeNotification = (id: number) => {
  const index = notifications.value.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    case "error":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>`;
    case "info":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    default:
      return "";
  }
};

defineExpose({ showSuccess, showError, showInfo });
</script>

<template>
  <div class="notification-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification"
      :class="notification.type"
      @click="removeNotification(notification.id)"
    >
      <div class="notification-icon" v-html="getIcon(notification.type)"></div>
      <div class="notification-content">
        <div class="notification-message">{{ notification.message }}</div>
        <div class="notification-progress">
          <div class="progress-bar"></div>
        </div>
      </div>
      <button
        class="notification-close"
        @click.stop="removeNotification(notification.id)"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
  pointer-events: none;
}

.notification {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #2a2a2e;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease forwards;
  cursor: pointer;
  transition: transform 0.2s;
  max-width: 380px;
}

.notification:hover {
  transform: translateX(-4px);
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon svg {
  width: 20px;
  height: 20px;
}

.notification.success .notification-icon svg {
  color: #4ade80;
}

.notification.error .notification-icon svg {
  color: #f87171;
}

.notification.info .notification-icon svg {
  color: #60a5fa;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 14px;
  color: white;
  line-height: 1.4;
  word-break: break-word;
}

.notification-progress {
  margin-top: 8px;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: 100%;
  background: rgba(255, 255, 255, 0.6);
  animation: progress 5s linear forwards;
  transform-origin: left;
}

.notification.success .progress-bar {
  background: #4ade80;
}

.notification.error .progress-bar {
  background: #f87171;
}

.notification.info .progress-bar {
  background: #60a5fa;
}

.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.notification-close:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

@media (max-width: 768px) {
  .notification-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }

  .notification {
    max-width: none;
  }
}
</style>
