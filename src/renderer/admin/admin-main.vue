<!-- src/renderer/views/admin/AdminMainView.vue -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import AdminSidebar from "../components/admin-sidebar.vue";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import { fetcher } from "../helpers";

const data = ref({
  usersCount: 0,
  usersCountWithTariffs: 0,
  newUsersCount: 0,
  adminsCount: 0,
});

onMounted(async () => {
  const response = await fetcher({ url: "/admin/main", method: "GET" });
  data.value = response;
});
</script>

<template>
  <div class="admin-view">
    <ProfileHeaderWithHouse />

    <div class="admin-container">
      <AdminSidebar />

      <main class="admin-content">
        <div class="content-card">
          <h2 class="content-title">Добро пожаловать в админ-панель</h2>
          <p class="content-description">
            Здесь вы можете управлять пользователями, тарифами и настройками
            сервиса.
          </p>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ data.usersCount }}</div>
              <div class="stat-label">Пользователей</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                {{ data.usersCountWithTariffs }}
              </div>
              <div class="stat-label">Активных подписок</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ data.adminsCount }}</div>
              <div class="stat-label">Администраторы</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ data.newUsersCount }}</div>
              <div class="stat-label">Новых пользователей</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.admin-container {
  display: flex;
  padding: 40px;
  gap: 32px;
  min-height: calc(100vh - 80px);
}

.admin-content {
  flex: 1;
}

.content-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px;
  animation: fadeIn 0.3s ease;
}

.content-title {
  font-size: 28px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.content-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #60a5fa;
  margin-bottom: 8px;
}

.stat-label {
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

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-title {
    font-size: 24px;
  }
}
</style>
