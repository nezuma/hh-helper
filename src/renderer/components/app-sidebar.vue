<!-- components/AppSidebar.vue (общий компонент сайдбара) -->
<script setup lang="ts">
defineProps<{ activeTab: string }>();
</script>

<template>
  <aside class="sidebar">
    <button
      class="sidebar-btn"
      :class="{ active: activeTab === 'main' }"
      @click="$router.push('/main')"
    >
      <svg
        class="sidebar-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H9v8H5a2 2 0 0 1-2-2z" />
      </svg>
      Главная
    </button>

    <button
      class="sidebar-btn"
      :class="{ active: activeTab === 'hh' }"
      @click="$router.push('/main/hh')"
    >
      <svg
        class="sidebar-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      hh.ru
    </button>

    <button
      class="sidebar-btn"
      :class="{ active: activeTab === 'habr' }"
      @click="$router.push('/main/habr')"
    >
      <svg
        class="sidebar-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      Хабр Карьера
    </button>
  </aside>
</template>

<style scoped>
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

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-btn {
    flex: 1;
    min-width: 100px;
    justify-content: center;
    text-align: center;
  }
}
</style>
