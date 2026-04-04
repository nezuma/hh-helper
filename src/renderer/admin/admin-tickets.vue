<!-- src/renderer/views/admin/AdminTicketsView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import AdminSidebar from "../components/admin-sidebar.vue";
import { fetcher } from "../helpers";

// Типы
type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketCategory = "help" | "propose" | "other";

interface Message {
  _id: string;
  text: string;
  createdAt: string;
  isAdmin: boolean;
  userName: string;
  userAvatar?: string;
}

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  userId: string;
  userName: string;
  userEmail: string;
}

// Состояния
const tickets = ref<Ticket[]>([]);
const totalStats = ref({
  totalTickets: 0,
  openedTickets: 0,
  inWorkTickets: 0,
  resolvedTickets: 0,
});
const loading = ref(false);
const searchQuery = ref("");
const selectedTicket = ref<Ticket | null>(null);
const showChatModal = ref(false);
const adminReply = ref("");
const isSending = ref(false);
const statusFilter = ref<string>("all");
const categoryFilter = ref<string>("all");
const skip = ref(0);
const limit = ref(50);
const hasMore = ref(true);
let isLoadingMore = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// UI состояния для выпадающих меню
const isStatusDropdownOpen = ref(false);
const isCategoryDropdownOpen = ref(false);

const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: "smooth",
      });
    }
  }, 100);
};

// Статистика
const stats = computed(() => ({
  total: totalStats.value.totalTickets,
  open: totalStats.value.openedTickets,
  inProgress: totalStats.value.inWorkTickets,
  resolved: totalStats.value.resolvedTickets,
}));

// Фильтрация тикетов (поиск на фронте)
const filteredTickets = tickets;
// const filteredTickets = computed(() => {
//   let filtered = tickets.value;

//   if (searchQuery.value) {
//     const query = searchQuery.value.toLowerCase();
//     filtered = filtered.filter(
//       (t) =>
//         t._id.toLowerCase().includes(query) ||
//         t.title.toLowerCase().includes(query) ||
//         t.userName.toLowerCase().includes(query) ||
//         t.userEmail.toLowerCase().includes(query),
//     );
//   }

//   return filtered;
// });

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
    help: "🆘 Помощь",
    propose: "💡 Предложение",
    other: "📌 Другое",
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

const loadTickets = async (reset = true) => {
  if (loading.value) return;

  if (reset) {
    skip.value = 0;
    tickets.value = [];
    hasMore.value = true;
  }

  loading.value = true;

  try {
    const params = new URLSearchParams();
    params.append("skip", skip.value.toString());
    params.append("limit", limit.value.toString());
    if (statusFilter.value !== "all")
      params.append("status", statusFilter.value);
    if (categoryFilter.value !== "all")
      params.append("category", categoryFilter.value);
    if (searchQuery.value.trim())
      // <-- Добавить поисковый запрос
      params.append("query", searchQuery.value.trim());

    const data = await fetcher({
      url: `/admin/tickets?${params.toString()}`,
      method: "GET",
    });

    if (data) {
      totalStats.value = data.total;

      if (reset) {
        tickets.value = data.tickets;
      } else {
        tickets.value = [...tickets.value, ...data.tickets];
      }

      hasMore.value = data.tickets.length === limit.value;
    }
  } catch (error) {
    console.error("Error loading tickets:", error);
  } finally {
    loading.value = false;
    isLoadingMore = false;
  }
};

const loadMoreTickets = async () => {
  if (isLoadingMore || !hasMore.value || loading.value) return;

  isLoadingMore = true;
  skip.value += limit.value;
  await loadTickets(false);
};

const handleScroll = () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMoreTickets();
  }
};

// Debounced search
const handleSearchInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    applyFilters();
  }, 500);
};

const openTicketChat = async (ticket: Ticket) => {
  try {
    const data = await fetcher({
      url: `/admin/tickets?ticketId=${ticket._id}`,
      method: "GET",
    });
    selectedTicket.value = data;
    scrollToBottom();
    showChatModal.value = true;
    adminReply.value = "";
  } catch (error) {
    console.error("Error loading ticket details:", error);
  }
};

const closeChatModal = () => {
  showChatModal.value = false;
  selectedTicket.value = null;
  scrollToBottom();
  adminReply.value = "";
};

const updateTicketStatus = async (status: TicketStatus) => {
  if (!selectedTicket.value) return;

  try {
    const updated = await fetcher({
      url: `/admin/tickets?ticketId=${selectedTicket.value._id}&status=${status}`,
      method: "PATCH",
      body: {},
    });

    selectedTicket.value = updated;

    // Обновляем в основном списке
    const index = tickets.value.findIndex((t) => t._id === updated._id);
    if (index !== -1) {
      tickets.value[index] = updated;
    }

    // Обновляем статистику
    await loadTickets(true);
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

const sendReply = async () => {
  if (!adminReply.value.trim() || !selectedTicket.value || isSending.value)
    return;

  isSending.value = true;

  try {
    const updated = await fetcher({
      url: `/admin/tickets?ticketId=${selectedTicket.value._id}`,
      method: "PATCH",
      body: { message: adminReply.value },
    });

    selectedTicket.value = updated;

    // Обновляем в основном списке
    const index = tickets.value.findIndex((t) => t._id === updated._id);
    if (index !== -1) {
      tickets.value[index] = updated;
    }
    scrollToBottom();
    adminReply.value = "";
  } catch (error) {
    console.error("Error sending reply:", error);
  } finally {
    isSending.value = false;
  }
};

const applyFilters = () => {
  loadTickets(true);
  isStatusDropdownOpen.value = false;
  isCategoryDropdownOpen.value = false;
};

const clearFilters = () => {
  statusFilter.value = "all";
  categoryFilter.value = "all";
  searchQuery.value = "";
  applyFilters();
};

const hasActiveFilters = computed(() => {
  return (
    statusFilter.value !== "all" ||
    categoryFilter.value !== "all" ||
    searchQuery.value !== ""
  );
});

onMounted(() => {
  loadTickets(true);
  scrollToBottom();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
  <div class="admin-tickets">
    <ProfileHeaderWithHouse />

    <div class="admin-container">
      <AdminSidebar />

      <main class="tickets-content">
        <div class="tickets-header">
          <h1 class="tickets-title">Управление обращениями</h1>
          <p class="tickets-subtitle">
            Просмотр и ответ на обращения пользователей
          </p>
        </div>

        <!-- Статистика -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Всего обращений</div>
          </div>
          <div class="stat-card status-open-card">
            <div class="stat-value">{{ stats.open }}</div>
            <div class="stat-label">Открыто</div>
          </div>
          <div class="stat-card status-progress-card">
            <div class="stat-value">{{ stats.inProgress }}</div>
            <div class="stat-label">В работе</div>
          </div>
          <div class="stat-card status-resolved-card">
            <div class="stat-value">{{ stats.resolved }}</div>
            <div class="stat-label">Решено</div>
          </div>
        </div>

        <!-- Фильтры -->
        <div class="filters-bar">
          <div class="search-wrapper">
            <svg
              class="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по ID, названию, пользователю..."
              class="search-input"
              @input="handleSearchInput"
            />
          </div>

          <!-- Выпадающий фильтр статуса -->
          <div
            class="custom-select"
            @click.stop="isStatusDropdownOpen = !isStatusDropdownOpen"
          >
            <div
              class="select-trigger"
              :class="{ active: isStatusDropdownOpen }"
            >
              <span class="select-value">
                <span
                  v-if="statusFilter === 'all'"
                  class="status-dot all"
                ></span>
                <span
                  v-else-if="statusFilter === 'open'"
                  class="status-dot open"
                ></span>
                <span
                  v-else-if="statusFilter === 'in_progress'"
                  class="status-dot progress"
                ></span>
                <span
                  v-else-if="statusFilter === 'resolved'"
                  class="status-dot resolved"
                ></span>
                {{
                  statusFilter === "all"
                    ? "Все статусы"
                    : statusFilter === "open"
                      ? "Открыто"
                      : statusFilter === "in_progress"
                        ? "В работе"
                        : "Решено"
                }}
              </span>
              <svg
                class="select-arrow"
                :class="{ rotated: isStatusDropdownOpen }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <Transition name="dropdown">
              <div v-if="isStatusDropdownOpen" class="dropdown-menu">
                <div
                  @click="
                    statusFilter = 'all';
                    applyFilters();
                  "
                  class="dropdown-item"
                  :class="{ active: statusFilter === 'all' }"
                >
                  <span class="status-dot all"></span> Все статусы
                </div>
                <div
                  @click="
                    statusFilter = 'open';
                    applyFilters();
                  "
                  class="dropdown-item"
                  :class="{ active: statusFilter === 'open' }"
                >
                  <span class="status-dot open"></span> Открыто
                </div>
                <div
                  @click="
                    statusFilter = 'in_progress';
                    applyFilters();
                  "
                  class="dropdown-item"
                  :class="{ active: statusFilter === 'in_progress' }"
                >
                  <span class="status-dot progress"></span> В работе
                </div>
                <div
                  @click="
                    statusFilter = 'resolved';
                    applyFilters();
                  "
                  class="dropdown-item"
                  :class="{ active: statusFilter === 'resolved' }"
                >
                  <span class="status-dot resolved"></span> Решено
                </div>
              </div>
            </Transition>
          </div>

          <!-- Выпадающий фильтр категории -->
          <div
            class="custom-select"
            @click.stop="isCategoryDropdownOpen = !isCategoryDropdownOpen"
          >
            <div
              class="select-trigger"
              :class="{ active: isCategoryDropdownOpen }"
            >
              <span class="select-value">
                {{
                  categoryFilter === "all"
                    ? "Все типы"
                    : categoryFilter === "help"
                      ? "🆘 Помощь"
                      : "💡 Предложение"
                }}
              </span>
              <svg
                class="select-arrow"
                :class="{ rotated: isCategoryDropdownOpen }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <Transition name="dropdown">
              <div v-if="isCategoryDropdownOpen" class="dropdown-menu">
                <div
                  @click="
                    categoryFilter = 'all';
                    applyFilters();
                  "
                  class="dropdown-item"
                  :class="{ active: categoryFilter === 'all' }"
                >
                  Все типы
                </div>
                <div
                  @click="
                    categoryFilter = 'help';
                    applyFilters();
                  "
                  class="dropdown-item"
                  :class="{ active: categoryFilter === 'help' }"
                >
                  🆘 Помощь
                </div>
                <div
                  @click="
                    categoryFilter = 'propose';
                    applyFilters();
                  "
                  class="dropdown-item"
                  :class="{ active: categoryFilter === 'propose' }"
                >
                  💡 Предложение
                </div>
              </div>
            </Transition>
          </div>

          <button
            v-if="hasActiveFilters"
            class="clear-filters"
            @click="clearFilters"
          >
            Сбросить
          </button>
        </div>

        <!-- Список тикетов -->
        <div class="tickets-list">
          <div v-if="loading && tickets.length === 0" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка обращений...</p>
          </div>

          <div v-else-if="filteredTickets.length === 0" class="empty-state">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
              />
            </svg>
            <p>Обращения не найдены</p>
          </div>

          <div v-else class="tickets-grid">
            <div
              v-for="ticket in filteredTickets"
              :key="ticket._id"
              class="ticket-card"
              @click="openTicketChat(ticket)"
            >
              <div class="ticket-header">
                <div class="ticket-info">
                  <div class="ticket-id">ID: {{ ticket._id }}</div>
                  <div class="ticket-title">{{ ticket.title }}</div>
                  <div class="ticket-user">
                    <span>👤 {{ ticket.userName }}</span>
                    <span>📧 {{ ticket.userEmail }}</span>
                  </div>
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
              <div class="ticket-footer">
                <div class="ticket-date">
                  📅 {{ formatDate(ticket.createdAt) }}
                </div>
                <div class="ticket-messages-count">
                  💬 {{ ticket.messages?.length || 0 }} сообщений
                </div>
              </div>
            </div>
          </div>

          <div v-if="loading && tickets.length > 0" class="loading-more">
            <div class="spinner-small"></div>
            <span>Загрузка еще...</span>
          </div>
        </div>
      </main>
    </div>

    <!-- Модальное окно чата -->
    <Transition name="modal">
      <div
        v-if="showChatModal"
        class="modal-overlay"
        @click.self="closeChatModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-header-info">
              <h2>{{ selectedTicket?.title }}</h2>
              <div class="modal-header-details">
                <span class="ticket-id">ID: {{ selectedTicket?._id }}</span>
                <span class="ticket-user-info"
                  >👤 {{ selectedTicket?.userName }}</span
                >
                <span class="ticket-user-info"
                  >📧 {{ selectedTicket?.userEmail }}</span
                >
              </div>
            </div>
            <button class="close-btn" @click="closeChatModal">×</button>
          </div>

          <div class="modal-body">
            <!-- Статус обращения -->
            <div class="ticket-status-section">
              <label>Статус обращения:</label>
              <div class="status-buttons">
                <button
                  @click="updateTicketStatus('open')"
                  class="status-btn"
                  :class="{ active: selectedTicket?.status === 'open' }"
                >
                  Открыто
                </button>
                <button
                  @click="updateTicketStatus('in_progress')"
                  class="status-btn"
                  :class="{ active: selectedTicket?.status === 'in_progress' }"
                >
                  В работе
                </button>
                <button
                  @click="updateTicketStatus('resolved')"
                  class="status-btn"
                  :class="{ active: selectedTicket?.status === 'resolved' }"
                >
                  Решено
                </button>
              </div>
            </div>

            <!-- Сообщения -->
            <div ref="messagesContainer" class="messages-container">
              <div
                v-if="!selectedTicket?.messages?.length"
                class="empty-messages"
              >
                <p>Сообщений пока нет</p>
              </div>
              <div v-else class="messages-list">
                <div
                  v-for="message in selectedTicket.messages"
                  :key="message._id"
                  class="message-item"
                  :class="{
                    'admin-message': message.isAdmin,
                    'user-message': !message.isAdmin,
                  }"
                >
                  <div class="message-avatar">
                    <div
                      class="avatar-placeholder"
                      :class="{ 'admin-avatar': message.isAdmin }"
                    >
                      <svg
                        v-if="message.isAdmin"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span v-else class="avatar-letter">{{
                        message.userName?.charAt(0) || "П"
                      }}</span>
                    </div>
                  </div>
                  <div class="message-content">
                    <div class="message-header">
                      <span class="message-author">{{ message.userName }}</span>
                      <span class="message-date">{{
                        formatDate(message.createdAt)
                      }}</span>
                    </div>
                    <div class="message-text">{{ message.text }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Форма ответа -->
            <div class="reply-section">
              <label class="reply-label">Ответ модератора</label>
              <textarea
                v-model="adminReply"
                class="reply-input"
                rows="4"
                placeholder="Напишите ответ пользователю..."
              ></textarea>
              <button
                @click="sendReply"
                class="send-btn"
                :disabled="!adminReply.trim() || isSending"
              >
                <span v-if="isSending" class="spinner"></span>
                <span v-else>Отправить ответ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-tickets {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.admin-container {
  display: flex;
  padding: 40px;
  gap: 32px;
  min-height: calc(100vh - 80px);
}

.tickets-content {
  flex: 1;
  min-width: 0;
  animation: fadeIn 0.3s ease;
}

.tickets-header {
  margin-bottom: 32px;
}

.tickets-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tickets-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.status-open-card .stat-value {
  color: #f59e0b;
}
.status-progress-card .stat-value {
  color: #60a5fa;
}
.status-resolved-card .stat-value {
  color: #22c55e;
}

/* Filters Bar */
.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.search-wrapper {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.4);
}

.search-input {
  width: 85%;
  padding: 12px 16px 12px 42px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
}

.custom-select {
  position: relative;
  min-width: 180px;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.select-trigger:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
}

.select-trigger.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.select-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.select-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #2a2a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item.active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.all {
  background: #9ca3af;
}
.status-dot.open {
  background: #f59e0b;
}
.status-dot.progress {
  background: #60a5fa;
}
.status-dot.resolved {
  background: #22c55e;
}

.clear-filters {
  padding: 12px 20px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #f87171;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Dropdown Animation */
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

/* Tickets List */
.tickets-list {
  margin-top: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.tickets-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.ticket-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
  border-color: rgba(59, 130, 246, 0.3);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.ticket-info {
  flex: 1;
}

.ticket-id {
  font-size: 12px;
  color: #60a5fa;
  font-family: monospace;
  order: 1;
}

.ticket-user-info {
  order: 2;
}
.ticket-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.ticket-user {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.ticket-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 4px 12px;
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
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.ticket-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2a2a2e;
  border-radius: 24px;
  width: 95%;
  max-width: 1000px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalFadeIn 0.2s ease;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.modal-header-info h2 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.modal-header-details {
  display: flex;
  flex-direction: column;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  flex-wrap: wrap;
  gap: 4px;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 32px;
  cursor: pointer;
  transition: color 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: white;
}

.modal-body {
  padding: 24px 28px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Ticket Status Section */
.ticket-status-section {
  flex-shrink: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ticket-status-section label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.status-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.status-btn.active {
  border-color: currentColor;
  transform: scale(1.02);
}

.status-btn:nth-child(1) {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}
.status-btn:nth-child(1).active {
  background: rgba(245, 158, 11, 0.4);
}
.status-btn:nth-child(2) {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}
.status-btn:nth-child(2).active {
  background: rgba(59, 130, 246, 0.4);
}
.status-btn:nth-child(3) {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}
.status-btn:nth-child(3).active {
  background: rgba(34, 197, 94, 0.4);
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 20px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-messages {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
}

.message-item {
  display: flex;
  gap: 12px;
}

.message-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.admin-avatar {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
}

.avatar-letter {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.message-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 16px;
}

.admin-message .message-content {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.message-author {
  font-size: 14px;
  font-weight: 600;
  color: #60a5fa;
}

.admin-message .message-author {
  color: #a78bfa;
}

.message-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.message-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  word-break: break-word;
}

/* Reply Section */
.reply-section {
  flex-shrink: 0;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reply-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.reply-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.reply-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.12);
}

.send-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-state {
  text-align: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.5);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

/* Scrollbar */
.messages-container::-webkit-scrollbar,
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track,
.modal-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb,
.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover,
.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Animations */
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

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-bar {
    flex-direction: column;
  }

  .search-wrapper {
    width: 100%;
  }

  .custom-select {
    width: 100%;
  }

  .ticket-header {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
    height: 95vh;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-body {
    padding: 16px 20px;
  }

  .modal-header-details {
    flex-direction: column;
    gap: 4px;
  }

  .message-item {
    gap: 8px;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
  }
}
</style>
