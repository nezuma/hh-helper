<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import ProfileHeaderWithoutHouse from "../components/profile-header-without-house.vue";
import AppSidebar from "../components/app-sidebar.vue";

interface Vacancy {
  id: number;
  title: string;
  href: string;
  company: {
    title: string;
    logo?: { src: string };
  };
  salary?: {
    from: number | null;
    to: number | null;
    currency: string | null;
    formatted: string;
  };
  predictedSalary?: {
    from: number;
    to: number;
    currency: string;
    formatted: string;
  };
  locations: { title: string }[] | null;
  skills: { title: string }[];
  remoteWork: boolean;
  publishedDate: { title: string };
  qualification?: string;
}

interface UserProfile {
  avatarUrl: string;
  fullName: string;
  alias: string;
  email: string;
  jobSearchState: string;
  isAdmin: boolean;
  qualificationId: number;
  userBoostStatus?: {
    active: boolean;
    expiresAt: string | null;
    priceRur: number;
  };
  salaryRange?: {
    from: number | null;
    to: number | null;
    unit: string | null;
  };
}

// Состояние
const activeTab = ref<"vacancies" | "profile">("vacancies");
const vacancies = ref<Vacancy[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const isAuthenticated = ref(false);
const authLoading = ref(true);
const userProfile = ref<UserProfile | null>(null);
const showUserMenu = ref(false);

// Отладка (закомментирована)
// const debugData = ref<any>(null)

// Вычисляемые свойства
const userAvatar = computed(() => {
  return (
    userProfile.value?.avatarUrl ||
    "https://career.habr.com/assets/defaults/avatars/user-4ae9deaab7da70ad824797029541e20765d74e4d1707ec8708d05d2a61eee32b.png"
  );
});

const userDisplayName = computed(() => {
  return (
    userProfile.value?.fullName || userProfile.value?.alias || "Пользователь"
  );
});

// Функция авторизации
const authenticate = async () => {
  authLoading.value = true;
  error.value = null;

  try {
    const result = await window.habrAPI.authenticate();

    if (result.success) {
      isAuthenticated.value = true;
      await loadUserProfile();
      await fetchVacancies(1);
    } else {
      // Пользователь закрыл окно или произошла ошибка
      if (result.message === "Auth window closed") {
        error.value = null; // Не показываем ошибку, просто ничего не делаем
      } else {
        error.value = result.message || "Не удалось авторизоваться";
      }
    }
  } catch (err) {
    error.value = "Ошибка при авторизации";
    console.error(err);
  } finally {
    authLoading.value = false;
  }
};

// Загрузка профиля
const loadUserProfile = async () => {
  try {
    const result = await window.habrAPI.getProfile();

    if (result.needAuth) {
      isAuthenticated.value = false;
      return;
    }

    if (result.error) {
      throw new Error(result.error);
    }

    if (result.data && result.data.user) {
      userProfile.value = result.data.user;
    }
  } catch (err) {
    console.error("Error loading profile:", err);
  }
};

// Функция загрузки вакансий
const fetchVacancies = async (page: number = 1) => {
  loading.value = true;
  error.value = null;

  try {
    const result = await window.habrAPI.fetchVacancies(page);

    // Отладка (закомментирована)
    // debugData.value = result
    // console.log('API Response:', result)

    if (result.needAuth) {
      isAuthenticated.value = false;
      error.value = "AUTH_REQUIRED";
      return;
    }

    if (result.error) {
      throw new Error(result.error);
    }

    if (result.data && result.data.list && Array.isArray(result.data.list)) {
      vacancies.value = result.data.list;
      totalPages.value = result.data.meta?.totalPages || 1;
      currentPage.value = result.data.meta?.currentPage || 1;
    } else {
      vacancies.value = [];
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Неизвестная ошибка";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// Выход из аккаунта
const logout = async () => {
  try {
    await window.habrAPI.clearAuth();
    isAuthenticated.value = false;
    userProfile.value = null;
    vacancies.value = [];
    error.value = null;
    showUserMenu.value = false;
    activeTab.value = "vacancies";
  } catch (err) {
    console.error("Error during logout:", err);
  }
};

// Переключение меню
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

// Форматирование
const formatSalary = (vacancy: Vacancy) => {
  const salaryData = vacancy.predictedSalary || vacancy.salary;
  if (salaryData?.formatted) return salaryData.formatted;
  if (salaryData?.from && salaryData?.to)
    return `${salaryData.from.toLocaleString()} - ${salaryData.to.toLocaleString()} ₽`;
  if (salaryData?.from) return `от ${salaryData.from.toLocaleString()} ₽`;
  if (salaryData?.to) return `до ${salaryData.to.toLocaleString()} ₽`;
  return "Зарплата не указана";
};

const formatLocation = (vacancy: Vacancy) => {
  if (vacancy.locations && vacancy.locations.length > 0) {
    return vacancy.locations.map((l) => l.title).join(", ");
  }
  return "Удаленная работа";
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchVacancies(currentPage.value + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    fetchVacancies(currentPage.value - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const openProfile = () => {
  window.open(
    `https://career.habr.com/users/${userProfile.value?.alias}`,
    "_blank",
  );
  showUserMenu.value = false;
};

const switchToVacancies = () => {
  activeTab.value = "vacancies";
  if (vacancies.value.length === 0 && isAuthenticated.value) {
    fetchVacancies(1);
  }
};

const switchToProfile = () => {
  activeTab.value = "profile";
};

const getJobSearchStatus = (state: string) => {
  const statuses: Record<string, string> = {
    search: "🔍 Ищу работу",
    not_search: "💼 Не ищу работу",
    considering: "🤔 Рассматриваю предложения",
  };
  return statuses[state] || "Статус не указан";
};

const getQualificationLevel = (id: number) => {
  const levels: Record<number, string> = {
    1: "Intern",
    2: "Junior",
    3: "Junior+",
    4: "Middle",
    5: "Middle+",
    6: "Senior",
    7: "Lead",
  };
  return levels[id] || "Не указан";
};

// Проверка авторизации при загрузке
onMounted(async () => {
  try {
    const status = await window.habrAPI.checkAuth();
    isAuthenticated.value = status.isAuthorized;
    authLoading.value = false;

    if (status.isAuthorized) {
      await loadUserProfile();
      await fetchVacancies(1);
    }

    document.addEventListener("click", closeUserMenu);
  } catch (err) {
    console.error("Error checking auth:", err);
    authLoading.value = false;
  }
});
</script>

<template>
  <div class="habr-view">
    <ProfileHeaderWithoutHouse />

    <div class="content">
      <AppSidebar :active-tab="'habr'" />

      <main class="main-content">
        <!-- 
          ========== ОТЛАДОЧНАЯ ПАНЕЛЬ (ЗАКОММЕНТИРОВАНА) ==========
          Раскомментируйте для отладки:
          
          <div v-if="!isAuthenticated && !authLoading" class="debug-panel">
            <h3>🔧 Отладка</h3>
            <p>Статус авторизации: {{ isAuthenticated ? '✅ Авторизован' : '❌ Не авторизован' }}</p>
            <p>Загрузка: {{ loading ? 'Да' : 'Нет' }}</p>
            <p>Ошибка: {{ error || 'Нет' }}</p>
            <p>Количество вакансий: {{ vacancies.length }}</p>
            <p>Текущая страница: {{ currentPage }}/{{ totalPages }}</p>
            <button @click="authenticate" class="debug-btn">🔐 Авторизоваться</button>
            <button @click="fetchVacancies(1)" class="debug-btn">🔄 Обновить вакансии</button>
            <button @click="switchToProfile" class="debug-btn">👤 Показать профиль</button>
            <button @click="logout" class="debug-btn">🚪 Выйти</button>
            <pre v-if="debugData" class="debug-json">{{ JSON.stringify(debugData, null, 2) }}</pre>
          </div>
        -->

        <!-- Экран авторизации -->
        <div
          v-if="!isAuthenticated && !authLoading && !error"
          class="auth-screen"
        >
          <div class="auth-card">
            <div class="auth-icon">🔐</div>
            <h2>Добро пожаловать в Хабр Карьеру</h2>
            <p>
              Авторизуйтесь через Хабр, чтобы просматривать вакансии и управлять
              профилем
            </p>
            <button @click="authenticate" class="auth-button">
              <span class="button-icon">🚀</span>
              Авторизоваться через Хабр
            </button>
          </div>
        </div>

        <!-- Состояние ошибки авторизации -->
        <div
          v-else-if="
            !isAuthenticated && !authLoading && error === 'AUTH_REQUIRED'
          "
          class="auth-screen"
        >
          <div class="auth-card">
            <div class="auth-icon">⚠️</div>
            <h2>Требуется авторизация</h2>
            <p>Сессия истекла. Пожалуйста, авторизуйтесь заново</p>
            <button @click="authenticate" class="auth-button">
              <span class="button-icon">🔄</span>
              Авторизоваться снова
            </button>
          </div>
        </div>

        <!-- Состояние загрузки -->
        <div v-else-if="loading || authLoading" class="loading-state">
          <div class="spinner"></div>
          <p>
            {{
              authLoading ? "Проверка авторизации..." : "Загрузка вакансий..."
            }}
          </p>
        </div>

        <!-- Основной контент для авторизованных пользователей -->
        <div
          v-else-if="isAuthenticated && userProfile"
          class="authenticated-content"
        >
          <!-- Вкладки -->
          <div class="tabs">
            <button
              @click="switchToVacancies"
              class="tab-btn"
              :class="{ active: activeTab === 'vacancies' }"
            >
              📋 Вакансии
              <span v-if="vacancies.length" class="tab-count">{{
                vacancies.length
              }}</span>
            </button>
            <button
              @click="switchToProfile"
              class="tab-btn"
              :class="{ active: activeTab === 'profile' }"
            >
              👤 Мой профиль
            </button>

            <!-- Кнопка пользователя с меню -->
            <div class="user-menu-container" @click.stop>
              <button
                @click="toggleUserMenu"
                class="user-menu-btn"
                :class="{ active: showUserMenu }"
              >
                <img
                  :src="userAvatar"
                  :alt="userDisplayName"
                  class="user-avatar"
                />
                <span class="user-name">{{ userDisplayName }}</span>
                <svg
                  class="dropdown-arrow"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 4L6 8L10 4"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

              <transition name="dropdown">
                <div v-if="showUserMenu" class="user-dropdown">
                  <div class="user-info">
                    <img
                      :src="userAvatar"
                      :alt="userDisplayName"
                      class="dropdown-avatar"
                    />
                    <div class="user-details">
                      <div class="user-fullname">{{ userDisplayName }}</div>
                      <div class="user-email">{{ userProfile?.email }}</div>
                    </div>
                  </div>

                  <div class="dropdown-divider"></div>

                  <button @click="openProfile" class="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
                        fill="currentColor"
                      />
                      <path
                        d="M8 9C4.68629 9 2 11.6863 2 15H14C14 11.6863 11.3137 9 8 9Z"
                        fill="currentColor"
                      />
                    </svg>
                    Профиль
                  </button>

                  <button @click="logout" class="dropdown-item logout">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M6 2H3C2.46957 2 1.96086 2.21071 1.58579 2.58579C1.21071 2.96086 1 3.46957 1 4V12C1 12.5304 1.21071 13.0391 1.58579 13.4142C1.96086 13.7893 2.46957 14 3 14H6"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M11 11L15 8L11 5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M15 8H5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    Выйти
                  </button>
                </div>
              </transition>
            </div>
          </div>

          <!-- Контент вакансий -->
          <div v-if="activeTab === 'vacancies'" class="vacancies-container">
            <div v-if="vacancies.length === 0 && !loading" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>Вакансии не найдены</h3>
              <p>Попробуйте обновить страницу</p>
              <button @click="fetchVacancies(1)" class="retry-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.5 2.5V6H10"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2.5 13.5V10H6"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M13.2 6.2C12.5 4.3 10.6 3 8.5 3C5.5 3 3 5.5 3 8.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                  <path
                    d="M2.8 9.8C3.5 11.7 5.4 13 7.5 13C10.5 13 13 10.5 13 7.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                Обновить
              </button>
            </div>

            <div v-else-if="vacancies.length" class="vacancies-list">
              <div class="vacancies-header">
                <h2 class="section-title">🔥 Актуальные вакансии</h2>
                <div class="stats-badge">
                  {{ vacancies.length }}
                  {{ vacancies.length === 1 ? "вакансия" : "вакансий" }}
                </div>
              </div>

              <transition-group
                name="vacancy-list"
                tag="div"
                class="vacancies-grid"
              >
                <a
                  v-for="vacancy in vacancies"
                  :key="vacancy.id"
                  :href="`https://career.habr.com${vacancy.href}`"
                  target="_blank"
                  class="vacancy-card"
                >
                  <div class="card-header">
                    <div class="company-info">
                      <img
                        v-if="vacancy.company.logo?.src"
                        :src="vacancy.company.logo.src"
                        :alt="vacancy.company.title"
                        class="company-logo"
                        @error="(e: any) => (e.target.style.display = 'none')"
                      />
                      <div class="company-details">
                        <span class="company-name">{{
                          vacancy.company.title
                        }}</span>
                        <span
                          v-if="vacancy.qualification"
                          class="qualification-badge"
                        >
                          {{ vacancy.qualification }}
                        </span>
                      </div>
                    </div>
                    <div v-if="vacancy.remoteWork" class="remote-badge">
                      🌍 Удаленно
                    </div>
                  </div>

                  <h3 class="vacancy-title">{{ vacancy.title }}</h3>

                  <div class="salary">
                    {{ formatSalary(vacancy) }}
                  </div>

                  <div class="skills" v-if="vacancy.skills?.length">
                    <span
                      v-for="skill in vacancy.skills.slice(0, 4)"
                      :key="skill.title"
                      class="skill-tag"
                    >
                      {{ skill.title }}
                    </span>
                    <span
                      v-if="vacancy.skills.length > 4"
                      class="skill-tag more"
                    >
                      +{{ vacancy.skills.length - 4 }}
                    </span>
                  </div>

                  <div class="card-footer">
                    <div class="location">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M6 1C3.5 1 1.5 2.5 1.5 5.5C1.5 8.5 6 11 6 11C6 11 10.5 8.5 10.5 5.5C10.5 2.5 8.5 1 6 1Z"
                          stroke="currentColor"
                          stroke-width="1.2"
                        />
                        <circle
                          cx="6"
                          cy="5.5"
                          r="1.5"
                          stroke="currentColor"
                          stroke-width="1.2"
                        />
                      </svg>
                      {{ formatLocation(vacancy) }}
                    </div>
                    <div class="date">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M9.5 2H2.5C1.94772 2 1.5 2.44772 1.5 3V9.5C1.5 10.0523 1.94772 10.5 2.5 10.5H9.5C10.0523 10.5 10.5 10.0523 10.5 9.5V3C10.5 2.44772 10.0523 2 9.5 2Z"
                          stroke="currentColor"
                          stroke-width="1.2"
                        />
                        <path
                          d="M8 1V3"
                          stroke="currentColor"
                          stroke-width="1.2"
                          stroke-linecap="round"
                        />
                        <path
                          d="M4 1V3"
                          stroke="currentColor"
                          stroke-width="1.2"
                          stroke-linecap="round"
                        />
                        <path
                          d="M1.5 5H10.5"
                          stroke="currentColor"
                          stroke-width="1.2"
                        />
                      </svg>
                      {{ vacancy.publishedDate.title }}
                    </div>
                  </div>
                </a>
              </transition-group>

              <!-- Пагинация -->
              <div class="pagination" v-if="totalPages > 1">
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="page-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Назад
                </button>
                <span class="page-info">
                  Страница {{ currentPage }} из {{ totalPages }}
                </span>
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="page-btn"
                >
                  Вперед
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Контент профиля -->
          <div
            v-if="activeTab === 'profile' && userProfile"
            class="profile-container"
          >
            <div class="profile-card">
              <div class="profile-header">
                <img
                  :src="userAvatar"
                  :alt="userDisplayName"
                  class="profile-avatar"
                />
                <div class="profile-title">
                  <h1 class="profile-name">{{ userProfile.fullName }}</h1>
                  <p class="profile-alias">@{{ userProfile.alias }}</p>
                </div>
              </div>

              <div class="profile-info">
                <div class="info-section">
                  <h3>Контактная информация</h3>
                  <div class="info-item">
                    <span class="info-label">📧 Email</span>
                    <span class="info-value">{{ userProfile.email }}</span>
                  </div>
                </div>

                <div class="info-section">
                  <h3>Карьерная информация</h3>
                  <div class="info-item">
                    <span class="info-label">💼 Статус поиска</span>
                    <span class="info-value">{{
                      getJobSearchStatus(userProfile.jobSearchState)
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">📊 Уровень</span>
                    <span class="info-value">{{
                      getQualificationLevel(userProfile.qualificationId)
                    }}</span>
                  </div>
                  <div
                    v-if="
                      userProfile.salaryRange?.from ||
                      userProfile.salaryRange?.to
                    "
                    class="info-item"
                  >
                    <span class="info-label">💰 Желаемая зарплата</span>
                    <span class="info-value salary-value">
                      {{
                        userProfile.salaryRange.from?.toLocaleString() || "0"
                      }}
                      {{
                        userProfile.salaryRange.to
                          ? `- ${userProfile.salaryRange.to.toLocaleString()}`
                          : "+"
                      }}
                      ₽
                    </span>
                  </div>
                </div>

                <div v-if="userProfile.userBoostStatus" class="info-section">
                  <h3>Буст профиля</h3>
                  <div class="info-item">
                    <span class="info-label">⚡ Статус</span>
                    <span
                      class="info-value"
                      :class="{
                        'boost-active': userProfile.userBoostStatus.active,
                      }"
                    >
                      {{
                        userProfile.userBoostStatus.active
                          ? "Активен"
                          : "Не активен"
                      }}
                    </span>
                  </div>
                  <div
                    v-if="
                      userProfile.userBoostStatus.active &&
                      userProfile.userBoostStatus.expiresAt
                    "
                    class="info-item"
                  >
                    <span class="info-label">⏰ Действует до</span>
                    <span class="info-value">{{
                      new Date(
                        userProfile.userBoostStatus.expiresAt,
                      ).toLocaleDateString()
                    }}</span>
                  </div>
                </div>

                <div class="profile-actions">
                  <button @click="openProfile" class="profile-action-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M14 3H2C0.9 3 0 3.9 0 5V11C0 12.1 0.9 13 2 13H14C15.1 13 16 12.1 16 11V5C16 3.9 15.1 3 14 3Z"
                        stroke="currentColor"
                        stroke-width="1.2"
                      />
                      <path
                        d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z"
                        stroke="currentColor"
                        stroke-width="1.2"
                      />
                      <path
                        d="M3 12C3 10.5 4.5 9 8 9C11.5 9 13 10.5 13 12"
                        stroke="currentColor"
                        stroke-width="1.2"
                      />
                    </svg>
                    Открыть полный профиль в браузере
                  </button>
                </div>
              </div>
            </div>
          </div>
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
  min-height: 500px;
}

/* 
  ========== СТИЛИ ДЛЯ ОТЛАДКИ (ЗАКОММЕНТИРОВАНЫ) ==========
  Раскомментируйте при необходимости:
  
  .debug-panel {
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid #ffd700;
    border-radius: 12px;
    padding: 20px;
    margin: 20px;
    color: #0f0;
    font-family: monospace;
  }
  
  .debug-panel h3 { color: #ffd700; margin-top: 0; }
  .debug-panel p { margin: 8px 0; }
  .debug-btn {
    background: #ffd700;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    margin: 8px 8px 8px 0;
    font-weight: 600;
  }
  .debug-json {
    background: #1a1a2e;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 12px;
    max-height: 400px;
    overflow-y: auto;
    margin-top: 16px;
  }
*/

/* Auth Screen */
.auth-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 500px;
}

.auth-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 60px 48px;
  max-width: 500px;
  width: 100%;
  animation: fadeIn 0.5s ease;
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

.auth-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.auth-card h2 {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
}

.auth-card p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 32px;
  line-height: 1.5;
}

.auth-button {
  background: linear-gradient(135deg, #ffd700, #ffab00);
  border: none;
  padding: 16px 32px;
  border-radius: 16px;
  color: #1a1a2e;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.auth-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
}

.button-icon {
  font-size: 20px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

/* Tabs */
.authenticated-content {
  width: 100%;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  align-items: center;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.tab-btn.active {
  background: linear-gradient(135deg, #ffd700, #ffab00);
  color: #1a1a2e;
}

.tab-count {
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
}

/* User Menu */
.user-menu-container {
  margin-left: auto;
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.user-menu-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.user-menu-btn.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 215, 0, 0.5);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  transition: transform 0.2s;
}

.user-menu-btn.active .dropdown-arrow {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 280px;
  background: #2a2a3e;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item.logout:hover {
  background: rgba(255, 82, 82, 0.2);
  color: #ff5252;
}

/* Vacancies */
.vacancies-container {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.vacancies-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.stats-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.vacancies-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vacancy-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: block;
}

.vacancy-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.vacancy-list-enter-active,
.vacancy-list-leave-active {
  transition: all 0.3s ease;
}

.vacancy-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
}

.company-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.company-name {
  font-weight: 600;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

.qualification-badge {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.remote-badge {
  background: rgba(33, 150, 243, 0.2);
  color: #42a5f5;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.vacancy-title {
  font-size: 20px;
  font-weight: 700;
  margin: 12px 0;
  line-height: 1.4;
  color: white;
}

.salary {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffd700, #ffab00);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 12px 0;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}

.skill-tag {
  background: rgba(255, 255, 255, 0.08);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  transition: background 0.2s;
}

.skill-tag:hover {
  background: rgba(255, 255, 255, 0.15);
}

.skill-tag.more {
  background: rgba(255, 255, 255, 0.05);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.location,
.date {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

/* Profile */
.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.1),
    rgba(255, 171, 0, 0.05)
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffd700;
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.profile-alias {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.profile-info {
  padding: 32px;
}

.info-section {
  margin-bottom: 32px;
}

.info-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #ffd700;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item {
  display: flex;
  padding: 10px 0;
  gap: 16px;
}

.info-label {
  min-width: 140px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.info-value {
  font-size: 14px;
  color: white;
  font-weight: 500;
}

.salary-value {
  background: linear-gradient(135deg, #ffd700, #ffab00);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}

.boost-active {
  color: #4caf50;
}

.profile-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.profile-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 24px;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.profile-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  color: white;
  margin-bottom: 12px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ffd700, #ffab00);
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  color: #1a1a2e;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.retry-btn:hover {
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
    padding: 20px;
  }

  .auth-card {
    padding: 40px 24px;
  }

  .auth-card h2 {
    font-size: 24px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .info-item {
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    min-width: auto;
  }

  .user-name {
    display: none;
  }

  .user-menu-btn {
    padding: 8px;
  }

  .vacancy-card {
    padding: 16px;
  }

  .vacancy-title {
    font-size: 18px;
  }

  .salary {
    font-size: 20px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination {
    gap: 12px;
  }

  .page-btn {
    padding: 8px 16px;
    font-size: 12px;
  }
}
</style>
