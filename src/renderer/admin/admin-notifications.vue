<!-- src/renderer/views/admin/AdminNotificationsView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import AdminSidebar from "../components/admin-sidebar.vue";
import { fetcher } from "../helpers";

interface Notification {
  _id: string;
  title: string;
  content: string;
  type: "user" | "all";
  link?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  isRead: boolean;
  createdAt: string;
}

// Состояния
const notifications = ref<Notification[]>([]);
const loading = ref(false);
const searchQuery = ref("");
const typeFilter = ref<string>("all");
const showCreateModal = ref(false);
const isSubmitting = ref(false);

// Форма создания уведомления
const newNotification = ref({
  title: "",
  content: "",
  type: "all",
  link: "",
  userId: "",
});

// Поиск пользователя
const searchUserQuery = ref("");
const searchUserResults = ref<any[]>([]);
const isSearchingUser = ref(false);
let searchUserTimer: ReturnType<typeof setTimeout> | null = null;

// Пагинация
const skip = ref(0);
const limit = ref(50);
const hasMore = ref(true);
let isLoadingMore = false;

// Статистика
const stats = computed(() => ({
  total: notifications.value.length,
  all: notifications.value.filter((n) => n.type === "all").length,
  user: notifications.value.filter((n) => n.type === "user").length,
}));

const getTypeText = (type: string) => {
  return type === "all" ? "Для всех" : "Для пользователя";
};

const getTypeClass = (type: string) => {
  return type === "all" ? "type-all" : "type-user";
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

const loadNotifications = async (reset = true) => {
  if (loading.value) return;

  if (reset) {
    skip.value = 0;
    notifications.value = [];
    hasMore.value = true;
  }

  loading.value = true;

  try {
    const params = new URLSearchParams();
    params.append("skip", skip.value.toString());
    params.append("limit", limit.value.toString());
    if (typeFilter.value !== "all") params.append("type", typeFilter.value);
    if (searchQuery.value.trim())
      params.append("query", searchQuery.value.trim());

    const data = await fetcher({
      url: `/admin/notifications?${params.toString()}`,
      method: "GET",
    });

    if (data) {
      if (reset) {
        notifications.value = data.notifications || [];
      } else {
        notifications.value = [
          ...notifications.value,
          ...(data.notifications || []),
        ];
      }
      hasMore.value = data.notifications?.length === limit.value;
    }
  } catch (error) {
    console.error("Error loading notifications:", error);
  } finally {
    loading.value = false;
    isLoadingMore = false;
  }
};

const loadMore = () => {
  if (isLoadingMore || !hasMore.value || loading.value) return;
  isLoadingMore = true;
  skip.value += limit.value;
  loadNotifications(false);
};

const handleScroll = () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMore();
  }
};

const searchUsers = async () => {
  if (!searchUserQuery.value.trim() || searchUserQuery.value.length < 2) {
    searchUserResults.value = [];
    return;
  }

  if (searchUserTimer) clearTimeout(searchUserTimer);
  searchUserTimer = setTimeout(async () => {
    isSearchingUser.value = true;
    try {
      const data = await fetcher({
        url: `/admin/users/search?query=${searchUserQuery.value}`,
        method: "GET",
      });
      searchUserResults.value = data || [];
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      isSearchingUser.value = false;
    }
  }, 300);
};

const selectUser = (user: any) => {
  newNotification.value.userId = user._id;
  searchUserQuery.value = `${user.name || user.login} (${user.email})`;
  searchUserResults.value = [];
};

const clearUserSelection = () => {
  newNotification.value.userId = "";
  searchUserQuery.value = "";
  searchUserResults.value = [];
};

const createNotification = async () => {
  if (
    !newNotification.value.title.trim() ||
    !newNotification.value.content.trim()
  ) {
    return;
  }

  if (newNotification.value.type === "user" && !newNotification.value.userId) {
    alert("Выберите пользователя");
    return;
  }

  isSubmitting.value = true;

  try {
    const body: any = {
      title: newNotification.value.title,
      content: newNotification.value.content,
      type: newNotification.value.type,
    };
    if (newNotification.value.link) body.link = newNotification.value.link;
    if (newNotification.value.type === "user")
      body.userId = newNotification.value.userId;

    await fetcher({
      url: "/admin/notifications",
      method: "POST",
      body,
    });

    showCreateModal.value = false;
    newNotification.value = {
      title: "",
      content: "",
      type: "all",
      link: "",
      userId: "",
    };
    searchUserQuery.value = "";
    searchUserResults.value = [];
    await loadNotifications(true);
  } catch (error) {
    console.error("Error creating notification:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const deleteNotification = async (id: string) => {
  if (!confirm("Вы уверены, что хотите удалить это уведомление?")) return;

  try {
    await fetcher({
      url: `/admin/notifications/${id}`,
      method: "DELETE",
    });
    await loadNotifications(true);
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

const applyFilters = () => {
  loadNotifications(true);
};

const clearFilters = () => {
  typeFilter.value = "all";
  searchQuery.value = "";
  applyFilters();
};

const hasActiveFilters = computed(() => {
  return typeFilter.value !== "all" || searchQuery.value !== "";
});

onMounted(() => {
  loadNotifications(true);
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  if (searchUserTimer) clearTimeout(searchUserTimer);
});
</script>

<template>
  <div class="admin-notifications">
    <ProfileHeaderWithHouse />

    <div class="admin-container">
      <AdminSidebar />

      <main class="notifications-content">
        <div class="notifications-header">
          <div class="header-left">
            <h1 class="notifications-title">Управление уведомлениями</h1>
            <p class="notifications-subtitle">
              Создание и управление уведомлениями для пользователей
            </p>
          </div>
          <button class="create-btn" @click="showCreateModal = true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Создать уведомление
          </button>
        </div>

        <!-- Статистика -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Всего уведомлений</div>
          </div>
          <div class="stat-card type-all-card">
            <div class="stat-value">{{ stats.all }}</div>
            <div class="stat-label">Для всех</div>
          </div>
          <div class="stat-card type-user-card">
            <div class="stat-value">{{ stats.user }}</div>
            <div class="stat-label">Персональные</div>
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
              placeholder="Поиск по заголовку или ID пользователя..."
              class="search-input"
              @input="applyFilters"
            />
          </div>

          <div
            class="custom-select"
            @click.stop="
              typeFilter === 'all'
                ? (typeFilter = 'user')
                : typeFilter === 'user'
                  ? (typeFilter = 'all')
                  : (typeFilter = 'all')
            "
          >
            <div class="select-trigger">
              <span class="select-value">
                <span
                  :class="[
                    'type-dot',
                    typeFilter === 'all' ? 'dot-all' : 'dot-user',
                  ]"
                ></span>
                {{ typeFilter === "all" ? "Все типы" : "Персональные" }}
              </span>
              <svg
                class="select-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <button
            v-if="hasActiveFilters"
            class="clear-filters"
            @click="clearFilters"
          >
            Сбросить
          </button>
        </div>

        <!-- Список уведомлений -->
        <div class="notifications-list">
          <div
            v-if="loading && notifications.length === 0"
            class="loading-state"
          >
            <div class="spinner"></div>
            <p>Загрузка уведомлений...</p>
          </div>

          <div v-else-if="notifications.length === 0" class="empty-state">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
              />
            </svg>
            <p>Уведомления не найдены</p>
          </div>

          <div v-else class="notifications-grid">
            <div
              v-for="notification in notifications"
              :key="notification._id"
              class="notification-card"
            >
              <div class="notification-header">
                <div class="notification-info">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-meta">
                    <span
                      :class="['type-badge', getTypeClass(notification.type)]"
                    >
                      {{ getTypeText(notification.type) }}
                    </span>
                    <span
                      v-if="
                        notification.type === 'user' && notification.userName
                      "
                      class="user-info"
                    >
                      👤 {{ notification.userName }}
                    </span>
                    <span class="notification-date"
                      >📅 {{ formatDate(notification.createdAt) }}</span
                    >
                  </div>
                </div>
                <button
                  class="delete-btn"
                  @click="deleteNotification(notification._id)"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
              <div class="notification-content">{{ notification.content }}</div>
              <div v-if="notification.link" class="notification-link">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                  />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>{{ notification.link }}</span>
              </div>
            </div>
          </div>

          <div v-if="loading && notifications.length > 0" class="loading-more">
            <div class="spinner-small"></div>
            <span>Загрузка еще...</span>
          </div>
        </div>
      </main>
    </div>

    <!-- Модальное окно создания уведомления -->
    <Transition name="modal">
      <div
        v-if="showCreateModal"
        class="modal-overlay"
        @click.self="showCreateModal = false"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Создать уведомление</h2>
            <button class="close-btn" @click="showCreateModal = false">
              ×
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Тип уведомления</label>
              <div class="type-selector">
                <button
                  @click="newNotification.type = 'all'"
                  class="type-option"
                  :class="{ active: newNotification.type === 'all' }"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                    />
                  </svg>
                  Для всех
                </button>
                <button
                  @click="newNotification.type = 'user'"
                  class="type-option"
                  :class="{ active: newNotification.type === 'user' }"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Конкретному пользователю
                </button>
              </div>
            </div>

            <div v-if="newNotification.type === 'user'" class="form-group">
              <label class="form-label">Пользователь</label>
              <div class="user-search">
                <div class="search-input-wrapper">
                  <svg
                    class="search-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    v-model="searchUserQuery"
                    type="text"
                    placeholder="Поиск пользователя по имени или email..."
                    class="user-search-input"
                    @input="searchUsers"
                  />
                </div>
                <div v-if="searchUserResults.length > 0" class="search-results">
                  <div
                    v-for="user in searchUserResults"
                    :key="user._id"
                    class="search-result-item"
                    @click="selectUser(user)"
                  >
                    <div class="result-avatar">
                      {{
                        user.name ? user.name.charAt(0) : user.login.charAt(0)
                      }}
                    </div>
                    <div class="result-info">
                      <div class="result-name">
                        {{ user.name || user.login }}
                      </div>
                      <div class="result-email">{{ user.email }}</div>
                    </div>
                  </div>
                </div>
                <div v-if="newNotification.userId" class="selected-user">
                  <span class="selected-user-badge">
                    Пользователь выбран
                    <button class="remove-user" @click="clearUserSelection">
                      ×
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Заголовок</label>
              <input
                v-model="newNotification.title"
                type="text"
                class="form-input"
                placeholder="Введите заголовок уведомления"
                maxlength="200"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Содержание</label>
              <textarea
                v-model="newNotification.content"
                class="form-textarea"
                rows="5"
                placeholder="Введите текст уведомления"
                maxlength="1000"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Ссылка (опционально)</label>
              <input
                v-model="newNotification.link"
                type="text"
                class="form-input"
                placeholder="Например: /tickets/123"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="showCreateModal = false">
              Отмена
            </button>
            <button
              class="create-submit-btn"
              @click="createNotification"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="spinner"></span>
              <span v-else>Создать</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-notifications {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.admin-container {
  display: flex;
  padding: 40px;
  gap: 32px;
  min-height: calc(100vh - 80px);
}

.notifications-content {
  flex: 1;
  min-width: 0;
  animation: fadeIn 0.3s ease;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.notifications-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.notifications-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.type-all-card .stat-value {
  color: #60a5fa;
}
.type-user-card .stat-value {
  color: #a78bfa;
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
  width: 100%;
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
  min-width: 160px;
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
}

.select-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-all {
  background: #60a5fa;
}
.dot-user {
  background: #a78bfa;
}

.select-arrow {
  width: 16px;
  height: 16px;
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

/* Notifications List */
.notifications-list {
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

.notifications-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s;
}

.notification-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.notification-info {
  flex: 1;
}

.notification-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.notification-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.type-all {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.type-user {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.user-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.notification-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #f87171;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.notification-content {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin-bottom: 12px;
}

.notification-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
  padding: 6px 12px;
  border-radius: 8px;
  width: fit-content;
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
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  animation: modalFadeIn 0.2s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: white;
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
  padding: 28px;
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

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.type-selector {
  display: flex;
  gap: 12px;
}

.type-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-option.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: white;
}

.user-search {
  position: relative;
}

.search-input-wrapper {
  position: relative;
}

.user-search-input {
  width: 100%;
  padding: 12px 16px 12px 36px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  font-size: 14px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #2a2a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.result-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
}

.result-info {
  flex: 1;
}

.result-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.result-email {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.selected-user {
  margin-top: 8px;
}

.selected-user-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  font-size: 13px;
  color: #60a5fa;
}

.remove-user {
  background: none;
  border: none;
  color: #f87171;
  font-size: 16px;
  cursor: pointer;
  margin-left: 4px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.create-submit-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.create-submit-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
}

.create-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.create-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading States */
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

/* Scrollbar */
.notifications-grid::-webkit-scrollbar,
.modal-content::-webkit-scrollbar,
.search-results::-webkit-scrollbar {
  width: 6px;
}

.notifications-grid::-webkit-scrollbar-track,
.modal-content::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.notifications-grid::-webkit-scrollbar-thumb,
.modal-content::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
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

  .notifications-header {
    flex-direction: column;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .type-selector {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
    max-height: 90vh;
  }
}
</style>
