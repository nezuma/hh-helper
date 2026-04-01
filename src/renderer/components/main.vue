<!-- main.vue (обновленный) -->
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isAuthenticated = ref(false);
const profile = ref<any>(null);
const mouseX = ref(0);
const mouseY = ref(0);
const appRef = ref<HTMLElement | null>(null);

const settings = ref({
  botEnabled: false,
  autoApply: false,
  autoBoost: false,
});

const avatarUrl = computed(() => profile.value?.avatar || "");
const userInitials = computed(() => {
  if (!profile.value) return "";
  const name = profile.value.name || profile.value.email || "";
  return name.charAt(0).toUpperCase();
});

const checkAuth = async () => {
  try {
    const response = await fetch("http://localhost:4000/profile", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      profile.value = data;
      isAuthenticated.value = true;
    } else {
      isAuthenticated.value = false;
      profile.value = null;
    }
  } catch (error) {
    isAuthenticated.value = false;
    profile.value = null;
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (!appRef.value) return;
  const rect = appRef.value.getBoundingClientRect();
  mouseX.value = e.clientX - rect.left - 150;
  mouseY.value = e.clientY - rect.top - 150;
};

const openAuth = () => {
  router.push("/auth");
};

const openProfile = () => {
  console.log("Open profile");
};

onMounted(() => {
  checkAuth();
});
</script>

<template>
  <div class="app dark-theme" @mousemove="handleMouseMove" ref="appRef">
    <header class="header">
      <div class="header-left">
        <h1 class="logo">HH Helper</h1>
      </div>
      <div class="header-right">
        <button v-if="!isAuthenticated" @click="openAuth" class="auth-btn">
          Войти
        </button>
        <div v-else class="avatar" @click="openProfile">
          <div v-if="!avatarUrl" class="avatar-placeholder">
            {{ userInitials }}
          </div>
        </div>
      </div>
    </header>

    <main class="main">
      <div v-if="!isAuthenticated" class="hero">
        <h1 class="title">HH Помощник</h1>
        <p class="subtitle">
          Я автоматизированный помощник для поиска работы! =)
        </p>
        <div class="button-group">
          <button @click="openAuth" class="btn btn-primary">
            Авторизоваться
          </button>
        </div>
      </div>

      <div v-else class="dashboard">
        <div class="toggles">
          <div class="toggle-card">
            <div class="toggle-info">
              <span class="toggle-title">Бот</span>
              <span class="toggle-desc">Включить/выключить работу бота</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.botEnabled" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="toggle-card">
            <div class="toggle-info">
              <span class="toggle-title">Автоотклик</span>
              <span class="toggle-desc"
                >Автоматически откликаться на вакансии</span
              >
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.autoApply" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="toggle-card">
            <div class="toggle-info">
              <span class="toggle-title">Автоподъем резюме</span>
              <span class="toggle-desc"
                >Автоматически поднимать резюме в поиске</span
              >
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.autoBoost" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="!isAuthenticated"
      class="mouse-light"
      :style="{ transform: `translate(${mouseX}px, ${mouseY}px)` }"
    ></div>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  overflow: hidden;
}

.dark-theme {
  color: #fff;
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

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden;
  border: 2px solid #3b82f6;
}

.avatar:hover {
  transform: scale(1.05);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  color: white;
}

.main {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 40px;
}

.hero {
  text-align: center;
  animation: fadeIn 0.8s ease;
}

.title {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
}

.button-group {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.dashboard {
  width: 100%;
  max-width: 600px;
  animation: fadeIn 0.8s ease;
}

.toggles {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toggle-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s;
}

.toggle-card:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.08);
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.toggle-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.3s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.mouse-light {
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  height: 300px;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    circle,
    rgba(59, 130, 246, 0.3) 0%,
    rgba(59, 130, 246, 0) 70%
  );
  border-radius: 50%;
  filter: blur(20px);
  transition: transform 0.05s linear;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
