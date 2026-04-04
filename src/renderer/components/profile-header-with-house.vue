<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { fetcher } from "../helpers";

const router = useRouter();
const user = localStorage.getItem("profile");
const userData = user ? JSON.parse(user) : null;
const userRole = ref<string | null>(null);

const isDropdownOpen = ref(false);
const isNotificationsOpen = ref(false);

// Моковые данные уведомлений
const notifications = ref([
  {
    id: 1,
    title: "Новый ответ в обращении",
    message: "Администратор ответил на ваше обращение #TKT-001",
    read: false,
    createdAt: new Date().toISOString(),
    link: "/tickets/69d1595ca74f3f07ab53e779",
  },
  {
    id: 2,
    title: "Статус обращения изменен",
    message: "Ваше обращение #TKT-002 переведено в статус 'В работе'",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    link: "/tickets/69d1595ca74f3f07ab53e780",
  },
  {
    id: 3,
    title: "Новое сообщение",
    message: "Вы получили новое сообщение в обращении #TKT-003",
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    link: "/tickets/69d1595ca74f3f07ab53e781",
  },
]);

const unreadCount = computed(
  () => notifications.value.filter((n) => !n.read).length,
);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isNotificationsOpen.value) isNotificationsOpen.value = false;
};

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
  if (isDropdownOpen.value) isDropdownOpen.value = false;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
  isNotificationsOpen.value = false;
};

const navigateTo = (path: string) => {
  closeDropdown();
  router.push(path);
};

const logout = () => {
  closeDropdown();
  router.push("/");
};

const goToMain = () => {
  router.push("/main");
};

const markAsRead = async (notification: any) => {
  notification.read = true;
  // TODO: Отправить запрос на сервер
  // await fetcher({ url: `/notifications/${notification.id}/read`, method: "PATCH" });
};

const markAllAsRead = async () => {
  notifications.value.forEach((n) => (n.read = true));
  // TODO: Отправить запрос на сервер
  // await fetcher({ url: "/notifications/read-all", method: "PATCH" });
};

const formatNotificationDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return "Только что";
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} д назад`;
};

const isAdminOrModer = () => {
  return userRole.value === "admin" || userRole.value === "moder";
};

// Получаем роль с сервера для защиты от подмены в localStorage
const fetchUserRole = async () => {
  try {
    const response = await fetcher({ url: "/profile", method: "GET" });
    if (response && response.role) {
      userRole.value = response.role;
    }
  } catch (error) {
    console.error("Ошибка получения роли:", error);
    userRole.value = null;
  }
};

// Закрываем меню при клике вне
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".header-right")) {
    closeDropdown();
  }
};

onMounted(() => {
  fetchUserRole();
  document.addEventListener("click", handleClickOutside);
});
</script>

<template>
  <header class="header">
    <div class="header-left">
      <button class="back-btn" @click="goToMain">
        <svg
          class="home-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H9v8H5a2 2 0 0 1-2-2z" />
        </svg>
      </button>
      <h1 class="logo">HH Helper</h1>
    </div>
    <div class="header-right">
      <!-- Уведомления -->
      <div class="notifications-wrapper">
        <div class="notifications-icon" @click.stop="toggleNotifications">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span v-if="unreadCount > 0" class="notification-badge">{{
            unreadCount > 99 ? "99+" : unreadCount
          }}</span>
        </div>

        <Transition name="dropdown">
          <div v-if="isNotificationsOpen" class="notifications-dropdown">
            <div class="notifications-header">
              <span>Уведомления</span>
              <button
                v-if="unreadCount > 0"
                class="mark-all-read"
                @click.stop="markAllAsRead"
              >
                Прочитать все
              </button>
            </div>
            <div class="notifications-list">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="{ unread: !notification.read }"
                @click.stop="
                  navigateTo(notification.link);
                  markAsRead(notification);
                "
              >
                <div class="notification-dot" v-if="!notification.read"></div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">
                    {{ notification.message }}
                  </div>
                  <div class="notification-time">
                    {{ formatNotificationDate(notification.createdAt) }}
                  </div>
                </div>
              </div>
              <div
                v-if="notifications.length === 0"
                class="notifications-empty"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                  />
                </svg>
                <p>Нет уведомлений</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Пользователь -->
      <div class="user-info" @click.stop="toggleDropdown">
        <span class="username">{{
          user ? (userData.name ? userData.name : userData.login) : null
        }}</span>
        <div class="avatar">
          <svg
            v-if="!userData.avatar"
            class="avatar-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <img v-else :src="userData.avatar" alt="avatar" class="avatar-img" />
        </div>
      </div>

      <Transition name="dropdown">
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <button @click="navigateTo('/profile')" class="dropdown-item">
            <svg
              class="dropdown-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Мой профиль
          </button>

          <button @click="navigateTo('/tariffs')" class="dropdown-item">
            <svg
              class="dropdown-icon"
              fill="#fff"
              width="800px"
              height="800px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM8.5,6.5a2,2,0,1,1-2,2A2,2,0,0,1,8.5,6.5Zm.207,10.207a1,1,0,1,1-1.414-1.414l8-8a1,1,0,1,1,1.414,1.414ZM15.5,17.5a2,2,0,1,1,2-2A2,2,0,0,1,15.5,17.5Z"
              />
            </svg>
            Тарифы
          </button>

          <button @click="navigateTo('/tickets')" class="dropdown-item">
            <svg
              class="dropdown-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                fill="none"
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
            Обращения
          </button>

          <button @click="navigateTo('/settings')" class="dropdown-item">
            <svg
              class="dropdown-icon"
              width="800px"
              height="800px"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="8" cy="8" r="1.75" />
              <path
                d="m6.75 1.75-.5 1.5-1.5 1-2-.5-1 2 1.5 1.5v1.5l-1.5 1.5 1 2 2-.5 1.5 1 .5 1.5h2.5l.5-1.5 1.5-1 2 .5 1-2-1.5-1.5v-1.5l1.5-1.5-1-2-2 .5-1.5-1-.5-1.5z"
              />
            </svg>
            Настройки
          </button>

          <button
            v-if="isAdminOrModer()"
            @click="navigateTo('/admin/main')"
            class="dropdown-item admin-item"
          >
            <svg
              class="dropdown-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              />
            </svg>
            Админ-панель
          </button>

          <button @click="logout" class="dropdown-item logout">
            <svg
              class="dropdown-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Выйти
          </button>
        </div>
      </Transition>
    </div>
  </header>
</template>

<style scoped>
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
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Notifications */
.notifications-wrapper {
  position: relative;
}

.notifications-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 40px;
  transition: background 0.2s;
  color: rgba(255, 255, 255, 0.8);
}

.notifications-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  width: 380px;
  background: #2a2a2e;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
  overflow: hidden;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: white;
}

.mark-all-read {
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.mark-all-read:hover {
  opacity: 0.8;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.notification-item.unread {
  background: rgba(59, 130, 246, 0.1);
}

.notification-item.unread:hover {
  background: rgba(59, 130, 246, 0.15);
}

.notification-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.notifications-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.notifications-empty svg {
  margin-bottom: 12px;
  opacity: 0.5;
}

/* User Info */
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

/* Dropdown Menu */
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

.dropdown-item.admin-item {
  margin-bottom: 4px;
}

.dropdown-item.admin-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Scrollbar */
.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 16px 20px;
  }

  .logo {
    font-size: 20px;
  }

  .username {
    display: none;
  }

  .notifications-dropdown {
    width: 320px;
    right: -40px;
  }

  .notification-title {
    font-size: 13px;
  }

  .notification-message {
    font-size: 12px;
  }
}
</style>
