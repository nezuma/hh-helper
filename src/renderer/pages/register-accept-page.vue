<!-- src/renderer/views/WaitingView.vue -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetcher } from "../helpers";
import { useRouter, useRoute } from "vue-router";
import { useNotification } from "../composables/eventBus";

const router = useRouter();
const route = useRoute();
const { showError } = useNotification();
const isLoading = ref(true);
const errorMessage = ref("");

const goToHome = () => {
  router.push("/main");
};

const goToErrorHome = () => {
  router.push("/");
};

onMounted(async () => {
  const token = route.query.token;
  const email = route.query.email;
  const userId = route.query.userId;

  if (!token || !email || !userId) {
    errorMessage.value = "Недействительная ссылка подтверждения";
    isLoading.value = false;
    return;
  }

  try {
    const response = await fetcher({
      url: `/register/accept`,
      method: "GET",
    });

    if (response) {
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  } catch (error) {
    errorMessage.value = "Ошибка при подтверждении почты";
    showError("Ошибка при подтверждении почты");
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="waiting-view">
    <header class="header">
      <div class="header-left">
        <button class="back-btn" @click="goToHome">
          <svg
            class="home-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H9v8H5a2 2 0 0 1-2-2z"
            />
          </svg>
        </button>
        <h1 class="logo">HH Helper</h1>
      </div>
    </header>

    <div class="waiting-container">
      <div class="waiting-card">
        <div v-if="!errorMessage" class="success-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div v-else class="error-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2 v-if="!errorMessage" class="waiting-title">Подтверждение почты</h2>
        <h2 v-else class="waiting-title error-title">Ошибка подтверждения</h2>

        <p v-if="!errorMessage" class="waiting-message">
          Подождите, идет подтверждение вашей почты...
        </p>
        <p v-else class="waiting-message error-message">
          {{ errorMessage }}
        </p>

        <button v-if="errorMessage" class="waiting-btn" @click="goToErrorHome">
          На главную
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.waiting-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.home-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.logo {
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.waiting-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 40px;
}

.waiting-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 48px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.3s ease;
}

.success-icon svg {
  width: 48px;
  height: 48px;
  color: #4ade80;
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.3s ease;
}

.error-icon svg {
  width: 48px;
  height: 48px;
  color: #f87171;
}

.waiting-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
}

.waiting-title.error-title {
  color: #f87171;
}

.waiting-message {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
}

.waiting-message.error-message {
  color: #f87171;
}

.waiting-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.waiting-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 16px 20px;
  }

  .waiting-container {
    padding: 20px;
  }

  .waiting-card {
    padding: 32px 24px;
  }

  .waiting-title {
    font-size: 24px;
  }

  .success-icon,
  .error-icon {
    width: 64px;
    height: 64px;
  }

  .success-icon svg,
  .error-icon svg {
    width: 36px;
    height: 36px;
  }
}
</style>
