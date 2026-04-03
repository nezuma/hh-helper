<!-- src/renderer/views/admin/AdminAnalyticsView.vue -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import { fetcher } from "../helpers";
import AdminSidebar from "../components/admin-sidebar.vue";

const loading = ref(true);
const analytics = ref({
  totalUsers: 0,
  activeSubscriptions: 0,
  newUsersToday: 0,
  newUsersWeek: 0,
  totalResponses: 0,
  responsesToday: 0,
  responsesWeek: 0,
  activeBots: 0,
  revenueMonth: 0,
  revenueTotal: 0,
  popularTariff: "",
  usersByTariff: {
    base: 0,
    advanced: 0,
    premium: 0,
  },
});

const chartData = ref({
  labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  users: [0, 0, 0, 0, 0, 0, 0],
  responses: [0, 0, 0, 0, 0, 0, 0],
});

onMounted(async () => {
  try {
    const data = await fetcher({ url: "/admin/analytics", method: "GET" });
    if (data) {
      analytics.value = data;
    }
  } catch (error) {
    console.error("Ошибка загрузки аналитики:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="admin-analytics">
    <ProfileHeaderWithHouse />

    <div class="admin-container">
      <AdminSidebar />

      <main class="analytics-content">
        <div class="analytics-header">
          <h1 class="analytics-title">Аналитика</h1>
          <p class="analytics-subtitle">Статистика и показатели сервиса</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon users-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ analytics.totalUsers }}</div>
              <div class="stat-label">Всего пользователей</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon active-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ analytics.activeSubscriptions }}</div>
              <div class="stat-label">Активных подписок</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon today-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ analytics.newUsersToday }}</div>
              <div class="stat-label">Новых сегодня</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon week-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path
                  d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"
                />
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ analytics.newUsersWeek }}</div>
              <div class="stat-label">Новых за неделю</div>
            </div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h3 class="chart-title">Динамика регистраций</h3>
            <div class="chart-container">
              <div class="bar-chart">
                <div
                  v-for="(value, index) in chartData.users"
                  :key="index"
                  class="bar-item"
                >
                  <div
                    class="bar"
                    :style="{
                      height: `${(value / Math.max(...chartData.users, 1)) * 150}px`,
                    }"
                  ></div>
                  <div class="bar-label">{{ chartData.labels[index] }}</div>
                  <div class="bar-value">{{ value }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3 class="chart-title">Динамика откликов</h3>
            <div class="chart-container">
              <div class="bar-chart">
                <div
                  v-for="(value, index) in chartData.responses"
                  :key="index"
                  class="bar-item"
                >
                  <div
                    class="bar response-bar"
                    :style="{
                      height: `${(value / Math.max(...chartData.responses, 1)) * 150}px`,
                    }"
                  ></div>
                  <div class="bar-label">{{ chartData.labels[index] }}</div>
                  <div class="bar-value">{{ value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tariff-stats">
          <div class="tariff-card base">
            <div class="tariff-icon">📦</div>
            <div class="tariff-info">
              <div class="tariff-name">Базовый</div>
              <div class="tariff-count">
                {{ analytics.usersByTariff.base }} пользователей
              </div>
            </div>
          </div>
          <div class="tariff-card advanced">
            <div class="tariff-icon">🚀</div>
            <div class="tariff-info">
              <div class="tariff-name">Расширенный</div>
              <div class="tariff-count">
                {{ analytics.usersByTariff.advanced }} пользователей
              </div>
            </div>
          </div>
          <div class="tariff-card premium">
            <div class="tariff-icon">👑</div>
            <div class="tariff-info">
              <div class="tariff-name">Премиум</div>
              <div class="tariff-count">
                {{ analytics.usersByTariff.premium }} пользователей
              </div>
            </div>
          </div>
        </div>

        <div class="revenue-stats">
          <div class="revenue-card">
            <div class="revenue-icon">💰</div>
            <div class="revenue-info">
              <div class="revenue-label">Выручка за месяц</div>
              <div class="revenue-value">
                {{ analytics.revenueMonth.toLocaleString() }} ₽
              </div>
            </div>
          </div>
          <div class="revenue-card">
            <div class="revenue-icon">💎</div>
            <div class="revenue-info">
              <div class="revenue-label">Общая выручка</div>
              <div class="revenue-value">
                {{ analytics.revenueTotal.toLocaleString() }} ₽
              </div>
            </div>
          </div>
          <div class="revenue-card">
            <div class="revenue-icon">⭐</div>
            <div class="revenue-info">
              <div class="revenue-label">Популярный тариф</div>
              <div class="revenue-value">
                {{ analytics.popularTariff || "Базовый" }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-analytics {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.admin-container {
  display: flex;
  padding: 40px;
  gap: 32px;
  min-height: calc(100vh - 80px);
}

.admin-sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
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

.analytics-content {
  flex: 1;
  animation: fadeIn 0.3s ease;
}

.analytics-header {
  margin-bottom: 32px;
}

.analytics-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.analytics-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-icon svg {
  width: 28px;
  height: 28px;
}

.users-icon {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.active-icon {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.today-icon {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.week-icon {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
}

.chart-container {
  min-height: 220px;
  display: flex;
  align-items: flex-end;
}

.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  width: 100%;
  gap: 12px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  border-radius: 6px;
  transition: height 0.3s ease;
  min-height: 4px;
}

.bar.response-bar {
  background: linear-gradient(180deg, #f59e0b, #d97706);
}

.bar-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.bar-value {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.tariff-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.tariff-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tariff-card.base {
  border-left: 3px solid #6b7280;
}

.tariff-card.advanced {
  border-left: 3px solid #f59e0b;
}

.tariff-card.premium {
  border-left: 3px solid #fbbf24;
}

.tariff-icon {
  font-size: 32px;
}

.tariff-info {
  flex: 1;
}

.tariff-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.tariff-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.revenue-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.revenue-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1),
    rgba(37, 99, 235, 0.05)
  );
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.revenue-icon {
  font-size: 32px;
}

.revenue-info {
  flex: 1;
}

.revenue-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.revenue-value {
  font-size: 24px;
  font-weight: 700;
  color: #60a5fa;
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

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
    padding: 20px;
  }

  .admin-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-btn {
    width: auto;
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .tariff-stats {
    grid-template-columns: 1fr;
  }

  .revenue-stats {
    grid-template-columns: 1fr;
  }

  .analytics-title {
    font-size: 24px;
  }
}
</style>
