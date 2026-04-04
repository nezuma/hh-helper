<!-- src/renderer/pages/tickets-page.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import { fetcher } from "../helpers";

const route = useRoute();
const router = useRouter();

// Типы обращений
type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketCategory = "help" | "propose" | "other";

interface ITicket {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
}

// Используем ref для реактивности
const tickets = ref<ITicket[]>([]);

const activeTab = ref<"tickets" | "help" | "propose">(
  route.path === "/tickets/help"
    ? "help"
    : route.path === "/tickets/propose"
      ? "propose"
      : "tickets",
);

// Фильтры
const selectedStatusFilter = ref<string>("all");
const selectedCategoryFilter = ref<string>("all");
const isFilterOpen = ref(false);

// Состояние для форм
const helpForm = ref({
  title: "",
  description: "",
  type: "bug",
});

const proposeForm = ref({
  title: "",
  description: "",
  type: "feature",
});

// UI состояния
const isSubmitting = ref(false);

const getStatusText = (status: TicketStatus) => {
  const statuses = {
    open: "Открыто",
    in_progress: "В работе",
    resolved: "Решено",
    closed: "Закрыто",
  };
  return statuses[status];
};

const getStatusClass = (status: TicketStatus) => {
  const classes = {
    open: "status-open",
    in_progress: "status-progress",
    resolved: "status-resolved",
    closed: "status-closed",
  };
  return classes[status];
};

const getCategoryText = (category: TicketCategory) => {
  const categories = {
    help: "Помощь",
    propose: "Предложение",
    other: "Другое",
  };
  return categories[category];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const switchTab = (tab: "tickets" | "help" | "propose") => {
  activeTab.value = tab;
  if (tab === "tickets") {
    router.push("/tickets");
  } else if (tab === "help") {
    router.push("/tickets/help");
  } else {
    router.push("/tickets/propose");
  }
};

const openTicket = (ticketId: string) => {
  router.push(`/tickets/${ticketId}`);
};

// Получение префикса для заголовка в зависимости от типа
const getTitlePrefix = (type: string, category: string) => {
  if (category === "help") {
    const prefixes: Record<string, string> = {
      bug: "[Ошибка] ",
      account: "[Аккаунт] ",
      payment: "[Оплата] ",
      other_help: "[Другое] ",
    };
    return prefixes[type] || "[Помощь] ";
  } else {
    const prefixes: Record<string, string> = {
      feature: "[Новый функционал] ",
      improvement: "[Улучшение] ",
      design: "[Дизайн] ",
    };
    return prefixes[type] || "[Предложение] ";
  }
};

const submitHelp = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    const prefix = getTitlePrefix(helpForm.value.type, "help");
    const fullTitle = prefix + helpForm.value.title;

    const newTicket = await fetcher({
      url: `/tickets?category=help`,
      method: "POST",
      body: {
        title: fullTitle,
        description: helpForm.value.description,
      },
    });
    console.log(newTicket);
    if (newTicket.ticket) {
      tickets.value.unshift(newTicket.ticket);
      helpForm.value = { title: "", description: "", type: "bug" };
    }
  } catch (error) {
    console.error("Error submitting help:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const submitPropose = async () => {
  isSubmitting.value = true;

  try {
    const prefix = getTitlePrefix(proposeForm.value.type, "propose");
    const fullTitle = prefix + proposeForm.value.title;

    // Отправка на сервер с category в query параметре
    const newTicket = await fetcher({
      url: `/tickets?category=propose`,
      method: "POST",
      body: {
        title: fullTitle,
        description: proposeForm.value.description,
      },
    });

    if (newTicket.ticket) {
      tickets.value.unshift(newTicket.ticket);
      proposeForm.value = { title: "", description: "", type: "feature" };
    }
  } catch (error) {
    console.error("Error submitting propose:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Фильтрация тикетов
const filteredTickets = computed(() => {
  let filtered = tickets.value.filter((t) => t.status !== "closed");

  if (selectedStatusFilter.value !== "all") {
    filtered = filtered.filter((t) => t.status === selectedStatusFilter.value);
  }

  if (selectedCategoryFilter.value !== "all") {
    filtered = filtered.filter(
      (t) => t.category === selectedCategoryFilter.value,
    );
  }

  return filtered;
});

const ticketsCount = computed(() => filteredTickets.value.length);

const clearFilters = () => {
  selectedStatusFilter.value = "all";
  selectedCategoryFilter.value = "all";
};

const hasActiveFilters = computed(() => {
  return (
    selectedStatusFilter.value !== "all" ||
    selectedCategoryFilter.value !== "all"
  );
});

onMounted(async () => {
  try {
    const data = await fetcher({ url: "/tickets", method: "GET" });
    tickets.value = data;
    console.log("Loaded tickets:", tickets.value);
  } catch (error) {
    console.error("Error loading tickets:", error);
  }
});
</script>

<template>
  <div class="tickets-page">
    <ProfileHeaderWithHouse />

    <div class="tickets-content">
      <div class="page-header">
        <h1 class="page-title">Обращения в поддержку</h1>
        <p class="page-description">
          Управляйте своими обращениями и предложениями
        </p>
      </div>

      <!-- Навигация -->
      <div class="tabs-nav">
        <button
          @click="switchTab('tickets')"
          class="tab-btn"
          :class="{ active: activeTab === 'tickets' }"
        >
          <svg
            class="tab-icon"
            width="800px"
            height="800px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 9H17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M7 13H14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          Активные обращения
          <span class="tab-count">{{ ticketsCount }}</span>
        </button>
        <button
          @click="switchTab('help')"
          class="tab-btn"
          :class="{ active: activeTab === 'help' }"
        >
          <svg
            class="tab-icon"
            width="800px"
            height="800px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 9.00001C9.00011 8.45004 9.15139 7.91068 9.43732 7.44088C9.72325 6.97108 10.1328 6.58891 10.6213 6.33616C11.1097 6.08341 11.6583 5.96979 12.2069 6.00773C12.7556 6.04566 13.2833 6.23369 13.7323 6.55126C14.1813 6.86883 14.5344 7.30372 14.7529 7.8084C14.9715 8.31308 15.0471 8.86813 14.9715 9.41288C14.8959 9.95763 14.6721 10.4711 14.3244 10.8972C13.9767 11.3234 13.5185 11.6457 13 11.829C12.7074 11.9325 12.4541 12.1241 12.275 12.3775C12.0959 12.6309 11.9998 12.9337 12 13.244V14.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 18V18.5001"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 23.25C18.2132 23.25 23.25 18.2132 23.25 12C23.25 5.7868 18.2132 0.75 12 0.75C5.7868 0.75 0.75 5.7868 0.75 12C0.75 18.2132 5.7868 23.25 12 23.25Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-miterlimit="10"
            />
          </svg>
          Помощь и поддержка
        </button>
        <button
          @click="switchTab('propose')"
          class="tab-btn"
          :class="{ active: activeTab === 'propose' }"
        >
          <svg
            class="tab-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
            />
            <circle cx="12" cy="12" r="4" />
          </svg>
          Предложения по улучшению
        </button>
      </div>

      <!-- Контент -->
      <div class="tabs-content">
        <!-- Список обращений с фильтрацией -->
        <div v-if="activeTab === 'tickets'" class="tickets-list">
          <!-- Блок фильтров -->
          <div class="filters-section">
            <div class="filters-header">
              <div class="filters-title" @click="isFilterOpen = !isFilterOpen">
                <svg
                  class="filter-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
                </svg>
                <span>Фильтры</span>
                <svg
                  class="chevron-icon"
                  :class="{ rotated: isFilterOpen }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <button
                v-if="hasActiveFilters"
                @click="clearFilters"
                class="clear-filters-btn"
              >
                Сбросить фильтры
              </button>
            </div>

            <Transition name="filter-dropdown">
              <div v-if="isFilterOpen" class="filters-panel">
                <div class="filter-group">
                  <label class="filter-label">Статус обращения</label>
                  <div class="filter-buttons">
                    <button
                      @click="selectedStatusFilter = 'all'"
                      class="filter-btn"
                      :class="{ active: selectedStatusFilter === 'all' }"
                    >
                      Все
                    </button>
                    <button
                      @click="selectedStatusFilter = 'open'"
                      class="filter-btn status-open-btn"
                      :class="{ active: selectedStatusFilter === 'open' }"
                    >
                      🟡 Открыто
                    </button>
                    <button
                      @click="selectedStatusFilter = 'in_progress'"
                      class="filter-btn status-progress-btn"
                      :class="{
                        active: selectedStatusFilter === 'in_progress',
                      }"
                    >
                      🔵 В работе
                    </button>
                    <button
                      @click="selectedStatusFilter = 'resolved'"
                      class="filter-btn status-resolved-btn"
                      :class="{ active: selectedStatusFilter === 'resolved' }"
                    >
                      🟢 Решено
                    </button>
                  </div>
                </div>

                <div class="filter-group">
                  <label class="filter-label">Тип обращения</label>
                  <div class="filter-buttons">
                    <button
                      @click="selectedCategoryFilter = 'all'"
                      class="filter-btn"
                      :class="{ active: selectedCategoryFilter === 'all' }"
                    >
                      Все
                    </button>
                    <button
                      @click="selectedCategoryFilter = 'help'"
                      class="filter-btn category-help-btn"
                      :class="{ active: selectedCategoryFilter === 'help' }"
                    >
                      🆘 Помощь
                    </button>
                    <button
                      @click="selectedCategoryFilter = 'propose'"
                      class="filter-btn category-propose-btn"
                      :class="{ active: selectedCategoryFilter === 'propose' }"
                    >
                      💡 Предложение
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Результаты фильтрации -->
          <div v-if="filteredTickets.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Ничего не найдено</h3>
            <p v-if="hasActiveFilters">
              Попробуйте изменить параметры фильтрации
            </p>
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="clear-filters-action"
            >
              Сбросить фильтры
            </button>
          </div>

          <div v-else class="tickets-grid">
            <div
              v-for="ticket in filteredTickets"
              :key="ticket._id"
              class="ticket-card"
              @click="openTicket(ticket._id)"
            >
              <div class="ticket-header">
                <div class="ticket-info">
                  <div class="ticket-title">
                    <span class="ticket-id">ID: {{ ticket._id }}</span>
                    <h3 class="ticket-name">{{ ticket.title }}</h3>
                  </div>
                  <div class="ticket-badges">
                    <span
                      :class="['status-badge', getStatusClass(ticket.status)]"
                    >
                      {{ getStatusText(ticket.status) }}
                    </span>
                    <span class="category-badge">
                      {{ getCategoryText(ticket.category) }}
                    </span>
                  </div>
                </div>
                <div class="ticket-meta">
                  <span class="ticket-date"
                    >📅 {{ formatDate(ticket.createdAt) }}</span
                  >
                  <svg
                    class="arrow-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              <div class="ticket-body">
                <p class="ticket-description">
                  {{ ticket.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Форма помощи -->
        <div v-if="activeTab === 'help'" class="form-container">
          <div class="form-card">
            <h2 class="form-title">Обратиться в поддержку</h2>
            <p class="form-description">
              Опишите вашу проблему, и мы свяжемся с вами в ближайшее время
            </p>

            <form @submit.prevent="submitHelp" class="ticket-form">
              <div class="form-group">
                <label class="form-label">Тема обращения</label>
                <input
                  v-model="helpForm.title"
                  type="text"
                  class="form-input"
                  placeholder="Кратко опишите суть проблемы"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Описание проблемы</label>
                <textarea
                  v-model="helpForm.description"
                  class="form-textarea"
                  rows="6"
                  placeholder="Подробно опишите, с чем вы столкнулись..."
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Тип проблемы</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="helpForm.type" value="bug" />
                    <span class="radio-custom"></span>
                    <span>🐛 Ошибка / Баг</span>
                  </label>
                  <label class="radio-label">
                    <input
                      type="radio"
                      v-model="helpForm.type"
                      value="account"
                    />
                    <span class="radio-custom"></span>
                    <span>👤 Аккаунт / Доступ</span>
                  </label>
                  <label class="radio-label">
                    <input
                      type="radio"
                      v-model="helpForm.type"
                      value="payment"
                    />
                    <span class="radio-custom"></span>
                    <span>💳 Оплата / Тарифы</span>
                  </label>
                  <label class="radio-label">
                    <input
                      type="radio"
                      v-model="helpForm.type"
                      value="other_help"
                    />
                    <span class="radio-custom"></span>
                    <span>📌 Другое</span>
                  </label>
                </div>
              </div>

              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner"></span>
                <span v-else>Отправить обращение</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Форма предложений -->
        <div v-if="activeTab === 'propose'" class="form-container">
          <div class="form-card">
            <h2 class="form-title">Предложить идею</h2>
            <p class="form-description">
              Поделитесь вашими идеями по улучшению сервиса
            </p>

            <form @submit.prevent="submitPropose" class="ticket-form">
              <div class="form-group">
                <label class="form-label">Название идеи</label>
                <input
                  v-model="proposeForm.title"
                  type="text"
                  class="form-input"
                  placeholder="Как можно улучшить сервис?"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Описание предложения</label>
                <textarea
                  v-model="proposeForm.description"
                  class="form-textarea"
                  rows="6"
                  placeholder="Подробно опишите вашу идею и как она может помочь..."
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Тип предложения</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input
                      type="radio"
                      v-model="proposeForm.type"
                      value="feature"
                    />
                    <span class="radio-custom"></span>
                    <span>✨ Новый функционал</span>
                  </label>
                  <label class="radio-label">
                    <input
                      type="radio"
                      v-model="proposeForm.type"
                      value="improvement"
                    />
                    <span class="radio-custom"></span>
                    <span>⚡ Улучшение существующего</span>
                  </label>
                  <label class="radio-label">
                    <input
                      type="radio"
                      v-model="proposeForm.type"
                      value="design"
                    />
                    <span class="radio-custom"></span>
                    <span>🎨 Дизайн и UX</span>
                  </label>
                </div>
              </div>

              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner"></span>
                <span v-else>Отправить предложение</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Стили остаются без изменений */
.tickets-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.tickets-content {
  padding: 0 40px 40px 40px;
}

.page-header {
  margin-bottom: 32px;
  padding-top: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

/* Tabs Navigation */
.tabs-nav {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.tab-btn.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.tab-icon {
  width: 20px;
  height: 20px;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 12px;
  margin-left: 4px;
}

/* Filters Section */
.filters-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  user-select: none;
}

.filter-icon {
  width: 18px;
  height: 18px;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.clear-filters-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 6px 12px;
  border-radius: 8px;
  color: #f87171;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.filters-panel {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.filter-btn.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: #3b82f6;
  color: white;
}

.filter-btn.status-open-btn.active {
  background: rgba(245, 158, 11, 0.3);
  border-color: #f59e0b;
  color: #f59e0b;
}

.filter-btn.status-progress-btn.active {
  background: rgba(59, 130, 246, 0.3);
  border-color: #60a5fa;
  color: #60a5fa;
}

.filter-btn.status-resolved-btn.active {
  background: rgba(34, 197, 94, 0.3);
  border-color: #22c55e;
  color: #22c55e;
}

.filter-btn.category-help-btn.active {
  background: rgba(59, 130, 246, 0.3);
  border-color: #60a5fa;
  color: #60a5fa;
}

.filter-btn.category-propose-btn.active {
  background: rgba(139, 92, 246, 0.3);
  border-color: #a78bfa;
  color: #a78bfa;
}

/* Filter Dropdown Animation */
.filter-dropdown-enter-active,
.filter-dropdown-leave-active {
  transition: all 0.3s ease;
}

.filter-dropdown-enter-from {
  opacity: 0;
  max-height: 0;
}

.filter-dropdown-enter-to {
  opacity: 1;
  max-height: 300px;
}

.filter-dropdown-leave-from {
  opacity: 1;
  max-height: 300px;
}

.filter-dropdown-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Tickets List */
.tickets-list {
  max-width: 900px;
  margin: 0 auto;
}

.tickets-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
  overflow: hidden;
  cursor: pointer;
}

.ticket-card:hover {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.ticket-info {
  flex: 1;
}

.ticket-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.ticket-id {
  order: 1;
  font-size: 12px;
  color: #60a5fa;
  font-family: monospace;
}

.ticket-name {
  order: 2;
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.ticket-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-open {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.status-progress {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.status-resolved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-closed {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.category-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.ticket-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ticket-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.arrow-icon {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.4);
  transition: transform 0.2s;
}

.ticket-card:hover .arrow-icon {
  transform: translateX(4px);
  color: #60a5fa;
}

.ticket-body {
  padding: 0 20px 20px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.ticket-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

/* Form Styles */
.form-container {
  max-width: 700px;
  margin: 0 auto;
}

.form-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.form-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
}

.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.form-input,
.form-textarea {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.12);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.radio-label input {
  display: none;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  position: relative;
  transition: all 0.2s;
}

.radio-label input:checked + .radio-custom {
  border-color: #3b82f6;
}

.radio-label input:checked + .radio-custom::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

/* Submit Button */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Success Toast */
.success-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: #22c55e;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
}

.toast-icon {
  width: 20px;
  height: 20px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  color: white;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20px;
}

.clear-filters-action {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 8px 20px;
  border-radius: 10px;
  color: #60a5fa;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-action:hover {
  background: rgba(59, 130, 246, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .tickets-content {
    padding: 0 20px 20px 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .tabs-nav {
    gap: 8px;
  }

  .tab-btn {
    padding: 8px 16px;
    font-size: 13px;
  }

  .tab-btn span:not(.tab-count) {
    display: none;
  }

  .filters-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .filter-buttons {
    flex-direction: column;
  }

  .filter-btn {
    width: 100%;
    text-align: center;
  }

  .ticket-header {
    flex-direction: column;
    gap: 12px;
  }

  .ticket-meta {
    width: 100%;
    justify-content: space-between;
  }

  .form-card {
    padding: 20px;
  }

  .radio-group {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
