<!-- src/renderer/views/MainView.vue -->
<script setup lang="ts">
import ProfileHeaderWithoutHouse from "../components/profile-header-without-house.vue";
import AppSidebar from "../components/app-sidebar.vue";

const features = [
  {
    icon: "🎯",
    title: "Централизация откликов",
    description:
      "Все отклики с hh.ru и Habr Карьеры в одном месте. Больше не нужно переключаться между сайтами.",
    color: "#3b82f6",
  },
  {
    icon: "🤖",
    title: "Автоматизация поиска",
    description:
      "Автоотклик и автоподъем резюме. Бот работает за вас 24/7, чтобы вы не пропустили лучшие вакансии.",
    color: "#10b981",
  },
  {
    icon: "📊",
    title: "Детальная статистика",
    description:
      "Анализируйте эффективность поиска: количество откликов, приглашений, собеседований и отказов.",
    color: "#f59e0b",
  },
  {
    icon: "⚡",
    title: "Мгновенные уведомления",
    description:
      "Получайте уведомления о новых вакансиях, приглашениях и изменениях статуса откликов.",
    color: "#8b5cf6",
  },
  {
    icon: "📱",
    title: "Кроссплатформенность",
    description:
      "Работает на Windows, macOS и Linux. Все данные синхронизируются между устройствами.",
    color: "#ec4899",
  },
  {
    icon: "🔒",
    title: "Безопасность данных",
    description:
      "Ваши данные надежно зашифрованы. Мы не передаем информацию третьим лицам.",
    color: "#6b7280",
  },
];

const stats = [
  { value: "1000+", label: "Активных пользователей", icon: "👥" },
  { value: "50K+", label: "Откликов отправлено", icon: "📧" },
  { value: "5000+", label: "Успешных наймов", icon: "🎉" },
  { value: "98%", label: "Довольных клиентов", icon: "⭐" },
];
</script>

<template>
  <div class="main-view">
    <ProfileHeaderWithoutHouse />

    <div class="content">
      <AppSidebar :active-tab="'main'" />

      <main class="main-content">
        <!-- Hero секция -->
        <div class="hero-section">
          <h1 class="hero-title">Добро пожаловать в HH Helper!</h1>
          <p class="hero-description">
            Единый центр управления поиском работы. Все сервисы для успешного
            трудоустройства в одном месте.
          </p>
        </div>

        <!-- Статистика -->
        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Возможности -->
        <div class="features-section">
          <h2 class="section-title">Возможности сервиса</h2>
          <div class="features-grid">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="feature-card"
            >
              <div class="feature-icon" :style="{ background: feature.color }">
                {{ feature.icon }}
              </div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </div>

        <!-- Как это работает -->
        <div class="how-it-works">
          <h2 class="section-title">Как это работает</h2>
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Авторизуйтесь в hh.ru</h3>
                <p>Войдите в свой аккаунт на hh.ru через наше приложение</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Настройте бота</h3>
                <p>Выберите параметры автоотклика и автоподъема резюме</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Запустите бота</h3>
                <p>Активируйте бота и он начнет работать за вас</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h3>Анализируйте результаты</h3>
                <p>
                  Смотрите статистику и получайте уведомления о новых откликах
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Преимущества -->
        <div class="advantages">
          <h2 class="section-title">Почему выбирают нас</h2>
          <div class="advantages-grid">
            <div class="advantage-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Экономия времени до 80%</span>
            </div>
            <div class="advantage-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Увеличение откликов в 3 раза</span>
            </div>
            <div class="advantage-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Персональные рекомендации</span>
            </div>
            <div class="advantage-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Круглосуточная поддержка</span>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="cta-section">
          <h3>Готовы начать?</h3>
          <p>
            Присоединяйтесь к тысячам пользователей, которые уже нашли работу с
            HH Helper
          </p>
          <button class="cta-button" @click="$router.push('/main/hh')">
            Начать использовать
          </button>
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

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Hero секция */
.hero-section {
  text-align: center;
  margin-bottom: 60px;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 60px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.5);
}

.stat-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #60a5fa;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* Секция возможностей */
.features-section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 20px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.feature-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

/* Как это работает */
.how-it-works {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 32px;
  padding: 48px;
  margin-bottom: 60px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 32px;
}

.step {
  text-align: center;
}

.step-number {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 auto 16px;
}

.step-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.step-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

/* Преимущества */
.advantages {
  margin-bottom: 60px;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.advantage-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.advantage-item svg {
  width: 20px;
  height: 20px;
  color: #4ade80;
  flex-shrink: 0;
}

/* CTA секция */
.cta-section {
  text-align: center;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1),
    rgba(37, 99, 235, 0.05)
  );
  border-radius: 32px;
  padding: 48px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.cta-section h3 {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.cta-section p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
}

.cta-button {
  padding: 14px 36px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 40px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .steps {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 20px;
  }

  .hero-title {
    font-size: 32px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .steps {
    grid-template-columns: 1fr;
  }

  .advantages-grid {
    grid-template-columns: 1fr;
  }

  .how-it-works {
    padding: 32px 20px;
  }

  .cta-section {
    padding: 32px 20px;
  }

  .cta-section h3 {
    font-size: 24px;
  }
}
</style>
