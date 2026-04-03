<!-- src/renderer/views/LoadingView.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goToHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="loading-view">
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

    <div class="loading-container">
      <div class="loading-card">
        <div class="spinner"></div>
        <h2 class="loading-title">Загрузка</h2>
        <p class="loading-message">Пожалуйста, подождите...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-view {
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 40px;
}

.loading-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 48px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.loading-message {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .header {
    padding: 16px 20px;
  }

  .loading-container {
    padding: 20px;
  }

  .loading-card {
    padding: 32px 24px;
  }

  .loading-title {
    font-size: 20px;
  }

  .spinner {
    width: 48px;
    height: 48px;
  }
}
</style>
