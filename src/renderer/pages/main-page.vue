<script setup lang="ts">
import { onMounted, ref } from "vue";
import ProfileHeaderWithoutHouse from "../components/profile-header-without-house.vue";
import { fetcher } from "../helpers";

const activeTab = ref("home");
const showTooltip = ref(false);
const loading = ref(true);

const botEnabled = ref(false);

const responses = ref([
  {
    company: 'ООО "ТехноСервис"',
    position: "Frontend Developer",
    status: "Отклик",
    date: "15.03.2024",
  },
  {
    company: 'АО "Инновации+',
    position: "Vue.js Developer",
    status: "Собеседование",
    date: "14.03.2024",
  },
  {
    company: 'ООО "ВебСтудия"',
    position: "Junior Frontend",
    status: "Отказ",
    date: "12.03.2024",
  },
  {
    company: "ИП Иванов",
    position: "Frontend Developer",
    status: "Ожидание",
    date: "10.03.2024",
  },
  {
    company: 'ООО "АйтиРешения"',
    position: "Vue Developer",
    status: "Отклик",
    date: "09.03.2024",
  },
]);

const getStatusClass = (status: string) => {
  switch (status) {
    case "Отклик":
      return "status-response";
    case "Собеседование":
      return "status-interview";
    case "Отказ":
      return "status-rejection";
    case "Ожидание":
      return "status-waiting";
    default:
      return "";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Отклик":
      return "📧";
    case "Собеседование":
      return "🎯";
    case "Отказ":
      return "❌";
    case "Ожидание":
      return "⏳";
    default:
      return "📋";
  }
};
const check = async () => {
  await fetcher({ url: "/profile", method: "GET" });
  loading.value = false;
};

onMounted(async () => {
  await check();
});
</script>

<template>
  <div class="main-view">
    <ProfileHeaderWithoutHouse />
    <div class="content">
      <aside class="sidebar">
        <button
          class="sidebar-btn"
          :class="{ active: activeTab === 'home' }"
          @click="activeTab = 'home'"
        >
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H9v8H5a2 2 0 0 1-2-2z"
            />
          </svg>
          Главная
        </button>

        <button
          class="sidebar-btn"
          :class="{ active: activeTab === 'responses' }"
          @click="activeTab = 'responses'"
        >
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Отклики
        </button>
      </aside>

      <main class="main-content">
        <div v-if="activeTab === 'home'" class="home-panel">
          <div class="bot-control">
            <h3 class="section-title">Управление ботом</h3>
            <div class="control-card">
              <div class="control-header">
                <div class="control-title">
                  <span class="control-label">Включить бота</span>
                  <div
                    class="warning-wrapper"
                    @mouseenter="showTooltip = true"
                    @mouseleave="showTooltip = false"
                  >
                    <svg
                      class="warning-icon"
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
                    <Transition name="tooltip">
                      <div v-if="showTooltip" class="tooltip">
                        Перед включением бота убедитесь в правильности его
                        настроек.
                      </div>
                    </Transition>
                  </div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="botEnabled" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="bot-settings">
            <h3>Настройки бота</h3>
            <p class="empty-settings">На данный момент настроек нет</p>
          </div>
        </div>

        <div v-else-if="activeTab === 'responses'" class="responses-panel">
          <div class="responses-list">
            <div
              v-for="(item, index) in responses"
              :key="index"
              class="response-item"
            >
              <div class="response-header">
                <div class="response-company">
                  <strong>{{ item.company }}</strong>
                  <span class="response-position">{{ item.position }}</span>
                </div>
                <div
                  class="response-status"
                  :class="getStatusClass(item.status)"
                >
                  <span class="status-icon">{{
                    getStatusIcon(item.status)
                  }}</span>
                  {{ item.status }}
                </div>
              </div>
              <div class="response-date">{{ item.date }}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.main-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.content {
  display: flex;
  padding: 40px;
  gap: 32px;
  min-height: calc(100vh - 80px);
}

.sidebar {
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.sidebar-btn.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.sidebar-icon {
  width: 20px;
  height: 20px;
}

.main-content {
  flex: 1;
}

.home-panel {
  animation: fadeIn 0.3s ease;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin-bottom: 24px;
}

.bot-control {
  margin-bottom: 24px;
}

.control-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 18px;
  font-weight: 500;
  color: white;
}

.warning-wrapper {
  position: relative;
  display: inline-flex;
}

.warning-icon {
  width: 18px;
  height: 18px;
  color: #fbbf24;
  cursor: pointer;
  transition: transform 0.2s;
}

.warning-icon:hover {
  transform: scale(1.1);
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #1e1e2e;
  color: white;
  font-size: 12px;
  border-radius: 8px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s ease;
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
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

.bot-settings {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
}

.bot-settings h3 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
}

.empty-settings {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  text-align: center;
  padding: 40px;
}

.responses-panel {
  animation: fadeIn 0.3s ease;
}

.responses-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.response-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 20px;
  transition: all 0.2s;
}

.response-item:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.08);
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.response-company {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.response-company strong {
  font-size: 16px;
  color: white;
}

.response-position {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.response-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-icon {
  font-size: 14px;
}

.status-response {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.status-interview {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.status-rejection {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.status-waiting {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.response-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
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
</style>
