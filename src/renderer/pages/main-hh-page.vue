<script setup lang="ts">
import { ref } from "vue";
import ProfileHeaderWithoutHouse from "../components/profile-header-without-house.vue";
import AppSidebar from "../components/app-sidebar.vue";

const webviewUrl = ref("https://ramenskoe.hh.ru/applicant/negotiations");

const refreshWebview = () => {
  const webview = document.querySelector("webview") as any;
  if (webview) {
    webview.reload();
  }
};
</script>

<template>
  <div class="hh-view">
    <ProfileHeaderWithoutHouse />

    <div class="content">
      <AppSidebar :active-tab="'hh'" />

      <main class="main-content">
        <div class="toolbar">
          <button @click="refreshWebview" class="refresh-btn">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
              <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
            </svg>
            Обновить
          </button>
          <span class="info-text">Войдите в аккаунт hh.ru</span>
        </div>

        <div class="webview-container">
          <webview
            :src="webviewUrl"
            class="hh-webview"
            allowpopups
            webpreferences="allowRunningInsecureContent"
          ></webview>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.hh-view {
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
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.refresh-btn svg {
  width: 16px;
  height: 16px;
}

.info-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.webview-container {
  flex: 1;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 500px;
}

.hh-webview {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
    padding: 20px;
  }

  .webview-container {
    min-height: 400px;
  }

  .hh-webview {
    min-height: 400px;
  }
}
</style>
