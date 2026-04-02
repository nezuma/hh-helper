<!-- src/renderer/views/RegisterSuccessView.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goToHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="register-success-view">
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

    <div class="success-container">
      <div class="success-card">
        <div class="success-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 class="success-title">Регистрация успешна!</h2>
        <p class="success-message">
          Мы отправили вам сообщение на почту. Для подтверждения регистрации
          нажмите на кнопку в письме.
        </p>
        <button class="success-btn" @click="goToHome">На главную</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-success-view {
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

.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 40px;
}

.success-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 48px;
  max-width: 500px;
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

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
}

.success-message {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 32px;
}

.success-btn {
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

.success-btn:hover {
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

  .success-container {
    padding: 20px;
  }

  .success-card {
    padding: 32px 24px;
  }

  .success-title {
    font-size: 24px;
  }

  .success-icon {
    width: 64px;
    height: 64px;
  }

  .success-icon svg {
    width: 36px;
    height: 36px;
  }
}
</style>
