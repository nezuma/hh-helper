<!-- src/renderer/views/admin/AdminServiceView.vue -->
<script setup lang="ts">
import { ref } from "vue";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import { useNotification } from "../composables/eventBus";
import AdminSidebar from "../components/admin-sidebar.vue";

const { showSuccess } = useNotification();

// Состояния сервиса
const maintenanceMode = ref(false);
const registrationEnabled = ref(true);
const botApiEnabled = ref(true);
const emailNotificationsEnabled = ref(true);
const autoResponseEnabled = ref(true);
const debugMode = ref(false);

// Настройки ограничений
const maxResponsesPerDay = ref(100);
const maxUsersPerDay = ref(50);
const sessionTimeout = ref(60);
const requestTimeout = ref(30);

// Настройки безопасности
const twoFactorAuthEnabled = ref(false);
const loginAttempts = ref(5);
const passwordExpiryDays = ref(90);

// Системные настройки
const cacheEnabled = ref(true);
const logLevel = ref("info");
const backupEnabled = ref(true);
const backupTime = ref("03:00");

const saveSettings = () => {
  showSuccess("Настройки сохранены");
};

const toggleMaintenance = () => {
  maintenanceMode.value = !maintenanceMode.value;
  showSuccess(
    maintenanceMode.value
      ? "Сайт переведен в режим обслуживания"
      : "Сайт доступен",
  );
};

const clearCache = () => {
  showSuccess("Кэш очищен");
};

const runBackup = () => {
  showSuccess("Резервное копирование запущено");
};
</script>

<template>
  <div class="admin-service">
    <ProfileHeaderWithHouse />

    <div class="admin-container">
      <AdminSidebar active-tab="service" />

      <main class="service-content">
        <div class="service-header">
          <h1 class="service-title">Сервисные настройки</h1>
          <p class="service-subtitle">
            Управление системными параметрами и доступом к сервису
          </p>
        </div>

        <div class="settings-grid">
          <!-- Доступность сервиса -->
          <div class="settings-card">
            <div class="card-header">
              <h2 class="card-title">Доступность сервиса</h2>
              <svg
                class="card-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Режим обслуживания</span>
                <span class="setting-description"
                  >При включении сайт будет недоступен для пользователей</span
                >
              </div>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="maintenanceMode"
                  @change="toggleMaintenance"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label"
                  >Регистрация новых пользователей</span
                >
                <span class="setting-description"
                  >Запретить создание новых аккаунтов</span
                >
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="registrationEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">API бота</span>
                <span class="setting-description"
                  >Включить/выключить работу API бота</span
                >
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="botApiEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Уведомления -->
          <div class="settings-card">
            <div class="card-header">
              <h2 class="card-title">Уведомления</h2>
              <svg
                class="card-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Email уведомления</span>
                <span class="setting-description"
                  >Отправка уведомлений на почту</span
                >
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="emailNotificationsEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Автоуведомления об откликах</span>
                <span class="setting-description"
                  >Уведомлять пользователей о новых откликах</span
                >
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="autoResponseEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Ограничения -->
          <div class="settings-card">
            <div class="card-header">
              <h2 class="card-title">Ограничения</h2>
              <svg
                class="card-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Максимум откликов в день</span>
                <span class="setting-description"
                  >Лимит откликов на одного пользователя</span
                >
              </div>
              <input
                type="number"
                v-model="maxResponsesPerDay"
                class="number-input"
                min="1"
                max="1000"
              />
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label"
                  >Максимум новых пользователей в день</span
                >
                <span class="setting-description"
                  >Лимит регистраций в сутки</span
                >
              </div>
              <input
                type="number"
                v-model="maxUsersPerDay"
                class="number-input"
                min="1"
                max="1000"
              />
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Таймаут сессии (минуты)</span>
                <span class="setting-description"
                  >Время жизни пользовательской сессии</span
                >
              </div>
              <input
                type="number"
                v-model="sessionTimeout"
                class="number-input"
                min="5"
                max="1440"
              />
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Таймаут запроса (секунды)</span>
                <span class="setting-description"
                  >Максимальное время выполнения запроса</span
                >
              </div>
              <input
                type="number"
                v-model="requestTimeout"
                class="number-input"
                min="5"
                max="120"
              />
            </div>
          </div>

          <!-- Безопасность -->
          <div class="settings-card">
            <div class="card-header">
              <h2 class="card-title">Безопасность</h2>
              <svg
                class="card-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                />
              </svg>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Двухфакторная аутентификация</span>
                <span class="setting-description">Требовать 2FA для входа</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="twoFactorAuthEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Максимум попыток входа</span>
                <span class="setting-description"
                  >Блокировка после N неудачных попыток</span
                >
              </div>
              <input
                type="number"
                v-model="loginAttempts"
                class="number-input"
                min="3"
                max="20"
              />
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Срок действия пароля (дни)</span>
                <span class="setting-description"
                  >Принудительная смена пароля через N дней</span
                >
              </div>
              <input
                type="number"
                v-model="passwordExpiryDays"
                class="number-input"
                min="30"
                max="365"
              />
            </div>
          </div>

          <!-- Системные настройки -->
          <div class="settings-card">
            <div class="card-header">
              <h2 class="card-title">Системные настройки</h2>
              <svg
                class="card-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                />
              </svg>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Кэширование</span>
                <span class="setting-description"
                  >Включить кэширование данных</span
                >
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="cacheEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Уровень логирования</span>
                <span class="setting-description"
                  >Детализация записи логов</span
                >
              </div>
              <select v-model="logLevel" class="select-input">
                <option value="error">Только ошибки</option>
                <option value="warn">Предупреждения и ошибки</option>
                <option value="info">Информационный</option>
                <option value="debug">Отладочный</option>
              </select>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Режим отладки</span>
                <span class="setting-description"
                  >Расширенное логирование для разработки</span
                >
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="debugMode" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Резервное копирование -->
          <div class="settings-card">
            <div class="card-header">
              <h2 class="card-title">Резервное копирование</h2>
              <svg
                class="card-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label"
                  >Автоматическое резервное копирование</span
                >
                <span class="setting-description"
                  >Ежедневное создание резервной копии</span
                >
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="backupEnabled" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Время резервного копирования</span>
                <span class="setting-description"
                  >Ежедневное время запуска бэкапа</span
                >
              </div>
              <input type="time" v-model="backupTime" class="time-input" />
            </div>
            <div class="setting-item">
              <button class="action-btn" @click="runBackup">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4" />
                  <polyline points="10 3 10 8 14 8" />
                  <line x1="10" y1="3" x2="3" y2="3" />
                  <line x1="3" y1="3" x2="3" y2="8" />
                  <line x1="21" y1="3" x2="14" y2="3" />
                  <line x1="21" y1="3" x2="21" y2="8" />
                  <path d="M7 15h10" />
                  <path d="M12 15v6" />
                </svg>
                Запустить бэкап сейчас
              </button>
            </div>
          </div>

          <!-- Действия -->
          <div class="settings-card actions-card">
            <div class="card-header">
              <h2 class="card-title">Системные действия</h2>
              <svg
                class="card-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div class="action-buttons">
              <button class="action-btn" @click="clearCache">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                Очистить кэш
              </button>
              <button class="action-btn" @click="saveSettings">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                  />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Сохранить все настройки
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-service {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.admin-container {
  display: flex;
  padding: 40px;
  gap: 32px;
  min-height: calc(100vh - 80px);
  width: 90%;
}

.service-content {
  flex: 1;
  min-width: 0;
  animation: fadeIn 0.3s ease;
}

.service-header {
  margin-bottom: 32px;
}

.service-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.service-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 24px;
}

.settings-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  transition: all 0.2s;
}

.settings-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.card-icon {
  width: 24px;
  height: 24px;
  color: #60a5fa;
  opacity: 0.7;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
}

.setting-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.number-input,
.select-input,
.time-input {
  width: 100px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  text-align: center;
}

.number-input:focus,
.select-input:focus,
.time-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.select-input {
  width: 160px;
  text-align: left;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
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

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.actions-card .action-btn {
  flex: 1;
  justify-content: center;
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

@media (max-width: 1024px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
    padding: 20px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .number-input,
  .select-input,
  .time-input {
    width: 100%;
  }

  .select-input {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .service-title {
    font-size: 24px;
  }
}
</style>
