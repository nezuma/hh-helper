<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { fetcher } from "../helpers";

const router = useRouter();
const user = localStorage.getItem("profile");
const userData = user ? JSON.parse(user) : null;
const userRole = ref<string | null>(null);

const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
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

onMounted(() => {
  fetchUserRole();
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
      <div class="user-info" @click="toggleDropdown">
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

.dropdown-item.admin-item {
  margin-bottom: 4px;
}

.dropdown-item.admin-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
