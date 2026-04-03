<script setup lang="ts">
import { onMounted, ref } from "vue";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import { fetcher } from "../helpers";

const currentTariffId = ref();
const tariffs = ref();

// Маппинг ключей в читаемые названия
const featureNames: Record<string, string> = {
  choose_response: "Просмотр откликов",
  main_page: "Главная страница",
  activate_bot: "Активация бота",
  autoresponse: "Автоотклик",
  autoboost_vacancy: "Автоподнятие вакансии",
  priority_help: "Приоритетная поддержка",
};

// Функция для преобразования объекта features в массив с названиями
const getFeatureList = (features: Record<string, boolean>) => {
  if (!features) return [];

  return Object.entries(features).map(([key, value]) => ({
    name: featureNames[key] || key, // если нет в маппинге, показываем оригинальный ключ
    enabled: value,
  }));
};

const selectTariff = (tariffName: string) => {
  console.log(`Выбран тариф: ${tariffName}`);
};

onMounted(async () => {
  const response = await fetcher({
    url: "/profile/tariffs",
    method: "GET",
  });
  tariffs.value = response;
  const user = await fetcher({
    url: "/profile",
    method: "GET",
  });
  currentTariffId.value = user.tariff.tariffId;
});
</script>

<template>
  <div class="tariffs-view">
    <ProfileHeaderWithHouse />

    <div class="tariffs-container">
      <div class="tariffs-header">
        <h2 class="tariffs-title">Выберите подходящий тариф</h2>
        <p class="tariffs-subtitle">Расширяйте возможности с каждым уровнем</p>
      </div>

      <div class="tariffs-grid">
        <div
          v-for="tariff in tariffs"
          :key="tariff.name"
          class="tariff-card"
          :class="{
            popular: tariff.popular,
            current: currentTariffId === tariff._id,
          }"
        >
          <div v-if="tariff.popular" class="popular-badge">Популярный</div>
          <div v-if="currentTariffId === tariff._id" class="current-badge">
            Текущий
          </div>

          <div class="tariff-header">
            <h3 class="tariff-name">{{ tariff.name }}</h3>
            <div class="tariff-price">
              <span class="price">{{
                tariff.price === 0 ? "Бесплатно" : String(tariff.price) + " ₽"
              }}</span>
              <span class="period">{{ tariff.period }}</span>
            </div>
          </div>

          <div class="tariff-features">
            <div
              v-for="feature in getFeatureList(tariff.features)"
              :key="feature.name"
              class="feature-item"
            >
              <svg
                v-if="feature.enabled"
                class="check-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg
                v-else
                class="minus-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span class="feature-name">{{ feature.name }}</span>
            </div>
          </div>

          <button
            class="select-btn"
            :class="{ active: currentTariffId !== tariff._id }"
            :disabled="currentTariffId === tariff._id"
            @click="selectTariff(tariff.name)"
          >
            {{ currentTariffId === tariff._id ? "Активен" : "Выбрать" }}
          </button>
        </div>
      </div>

      <div class="development-note">
        <svg
          class="dev-icon"
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
        <span>Дополнительные возможности находятся в разработке</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tariffs-view {
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

.header-right {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 40px;
  transition: background 0.2s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #3b82f6;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-svg {
  width: 24px;
  height: 24px;
  color: white;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  background: #2a2a2e;
  border-radius: 12px;
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item.logout {
  color: #f87171;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 4px;
  padding-top: 12px;
}

.dropdown-icon {
  width: 18px;
  height: 18px;
}

.tariffs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px;
}

.tariffs-header {
  text-align: center;
  margin-bottom: 48px;
}

.tariffs-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tariffs-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.tariffs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
}

.tariff-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px;
  transition: all 0.3s ease;
}

.tariff-card:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
}

.tariff-card.popular {
  border-color: #3b82f6;
}

.tariff-card.current {
  border-color: #10b981;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.current-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #10b981, #059669);
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.tariff-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tariff-name {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
}

.tariff-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.price {
  font-size: 36px;
  font-weight: 700;
  color: #60a5fa;
}

.period {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.tariff-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.check-icon {
  width: 18px;
  height: 18px;
  color: #10b981;
  flex-shrink: 0;
}

.minus-icon {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.feature-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.select-btn {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: transparent;
}

.select-btn.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.select-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.development-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.dev-icon {
  width: 20px;
  height: 20px;
  color: #fbbf24;
}

.development-note span {
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
  .tariffs-container {
    padding: 40px 20px;
  }

  .tariffs-title {
    font-size: 28px;
  }

  .tariffs-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .tariff-card.popular {
    transform: none;
  }
}
</style>
