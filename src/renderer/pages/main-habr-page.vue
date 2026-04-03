<script setup lang="ts">
import ProfileHeaderWithoutHouse from "../components/profile-header-without-house.vue";
import AppSidebar from "../components/app-sidebar.vue";
</script>

<template>
  <div class="habr-view">
    <ProfileHeaderWithoutHouse />

    <div class="content">
      <AppSidebar :active-tab="'habr'" />

      <main class="main-content">
        <div class="coming-soon">
          <div class="coming-soon-icon">🚀</div>
          <h2 class="coming-soon-title">Скоро здесь появится Хабр Карьера</h2>
          <p class="coming-soon-description">
            Интеграция с Хабр Карьерой находится в разработке
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.habr-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.content {
  display: flex;
  padding: 40px;
  gap: 32px;
  min-height: calc(100vh - 80px);
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.coming-soon {
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 60px 40px;
  max-width: 500px;
}

.coming-soon-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.coming-soon-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.coming-soon-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
    padding: 20px;
  }

  .coming-soon {
    padding: 40px 20px;
  }

  .coming-soon-title {
    font-size: 24px;
  }
}
</style>
