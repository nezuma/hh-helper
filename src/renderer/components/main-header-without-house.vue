<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
const openAuth = () => {
  router.push("/auth");
};
</script>

<template>
  <header class="header">
    <div class="header-left">
      <h1 class="logo">HH Helper</h1>
    </div>
    <div class="header-right">
      <button @click="openAuth" class="auth-btn">Войти</button>
    </div>
  </header>
</template>

<style scoped>
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

.logo {
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.auth-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
</style>
