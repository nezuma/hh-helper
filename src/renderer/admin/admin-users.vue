<!-- src/renderer/views/admin/AdminUsersView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import { useNotification } from "../composables/eventBus";
import AdminSidebar from "../components/admin-sidebar.vue";
import { fetcher } from "../helpers";

const { showSuccess } = useNotification();
const searchQuery = ref("");
const showEditModal = ref(false);
const selectedUser = ref<any>(null);
const editingUser = ref<any>(null);

// Хардкодные данные пользователей
const users = ref([
  {
    _id: "1",
    login: "john_doe",
    email: "john@example.com",
    name: "Джон Доу",
    phone: "+7 999 123-45-67",
    role: "admin",
    accepted: true,
    tariff: {
      tariffName: "premium",
      tariffDuration: "2025-12-31",
    },
    avatar: null,
    createdAt: "2024-01-15T10:00:00Z",
  },
]);

const selectedTariff = computed({
  get: () => editingUser.value?.tariff?.tariffName || "base",
  set: (val) => {
    if (editingUser.value) {
      if (!editingUser.value.tariff) {
        editingUser.value.tariff = {};
      }
      editingUser.value.tariff.tariffName = val;
    }
  },
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter(
    (user: any) =>
      user.login.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (user.name &&
        user.name.toLowerCase().includes(searchQuery.value.toLowerCase())),
  );
});

const deleteUser = (userId: string, userLogin: string) => {
  if (confirm(`Вы уверены, что хотите удалить пользователя ${userLogin}?`)) {
    const index = users.value.findIndex((u) => u._id === userId);
    if (index !== -1) {
      users.value.splice(index, 1);
      showSuccess(`Пользователь ${userLogin} удален`);
    }
  }
};

const openEditModal = (user: any) => {
  selectedUser.value = user;
  editingUser.value = JSON.parse(JSON.stringify(user));
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedUser.value = null;
  editingUser.value = null;
};

const saveUserChanges = () => {
  const index = users.value.findIndex((u) => u._id === selectedUser.value._id);
  if (index !== -1) {
    users.value[index] = { ...editingUser.value };
    showSuccess("Данные пользователя обновлены");
    closeEditModal();
  }
};

const getRoleName = (role: string) => {
  switch (role) {
    case "admin":
      return "Администратор";
    case "moder":
      return "Модератор";
    case "premium":
      return "Премиум";
    case "applicant":
      return "Пользователь";
    default:
      return role;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "#ef4444";
    case "moder":
      return "#f59e0b";
    case "premium":
      return "#fbbf24";
    default:
      return "#10b981";
  }
};

onMounted(async () => {
  users.value = await fetcher({ url: "/admin/users", method: "GET" });
});
</script>

<template>
  <div class="admin-users">
    <ProfileHeaderWithHouse />

    <div class="admin-container">
      <AdminSidebar />

      <main class="users-content">
        <div class="users-header">
          <h1 class="users-title">Управление пользователями</h1>
          <div class="search-section">
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
                placeholder="Поиск по логину, email или имени..."
                class="search-input"
              />
            </div>
          </div>
        </div>

        <div class="users-list">
          <div v-if="filteredUsers.length === 0" class="empty-state">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <p>Пользователи не найдены</p>
          </div>
          <div v-else class="users-grid">
            <div
              v-for="user in filteredUsers"
              :key="user._id"
              class="user-card"
              @click="openEditModal(user)"
            >
              <div class="user-avatar">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div class="user-info">
                <div class="user-name">
                  {{ user.name ? user.name : "Без имени" }}
                </div>
                <div class="user-login">Почта: {{ user.email }}</div>
                <div class="user-login">Логин: {{ user.login }}</div>
              </div>
              <div
                class="user-role"
                :style="{
                  backgroundColor: getRoleColor(user.role) + '20',
                  color: getRoleColor(user.role),
                }"
              >
                {{ getRoleName(user.role) }}
              </div>
              <button
                class="delete-btn"
                @click.stop="deleteUser(user._id, user.login)"
              >
                <svg
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
                Удалить
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Модальное окно редактирования -->
    <Transition name="modal">
      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click.self="closeEditModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2>Редактирование пользователя</h2>
            <button class="close-btn" @click="closeEditModal">×</button>
          </div>
          <div class="modal-body">
            <div class="edit-avatar">
              <div class="avatar-preview">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <button class="change-avatar-btn">Изменить аватар</button>
            </div>

            <div class="edit-field">
              <label>Почта (не редактируется)</label>
              <input type="email" :value="editingUser?.email" disabled />
            </div>

            <div class="edit-field">
              <label>Логин</label>
              <input type="text" v-model="editingUser.login" />
            </div>

            <div class="edit-field">
              <label>Имя</label>
              <input type="text" v-model="editingUser.name" />
            </div>

            <div class="edit-field">
              <label>Роль</label>
              <select v-model="editingUser.role" class="custom-select">
                <option value="applicant">Пользователь</option>
                <option value="premium">Премиум</option>
                <option value="moder">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
            </div>

            <div class="edit-field">
              <label>Тариф</label>
              <select v-model="selectedTariff" class="custom-select">
                <option value="base">Базовый</option>
                <option value="advanced">Расширенный</option>
                <option value="premium">Премиум</option>
              </select>
            </div>

            <div class="edit-field">
              <label class="checkbox-label">
                <input type="checkbox" v-model="editingUser.accepted" />
                <span>Подтверждение (аккаунт подтвержден)</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="closeEditModal">Отмена</button>
            <button class="save-btn" @click="saveUserChanges">Сохранить</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-users {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.admin-container {
  display: flex;
  padding: 40px;
  gap: 32px;
  min-height: calc(100vh - 80px);
  width: 90%;
}

.users-content {
  flex: 1;
  min-width: 0;
  width: 100%;
  animation: fadeIn 0.3s ease;
}

.users-header {
  margin-bottom: 32px;
  width: 98.8%;
}

.users-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-section {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
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

.users-list {
  margin-top: 24px;
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.users-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.user-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar svg {
  width: 28px;
  height: 28px;
  color: white;
}

.user-info {
  flex: 1;
  min-width: 150px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.user-login {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.user-role {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.02);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2a2a2e;
  border-radius: 20px;
  width: 90%;
  max-width: 700px;
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
}

.edit-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview svg {
  width: 56px;
  height: 56px;
  color: white;
}

.change-avatar-btn {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.change-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.edit-field {
  margin-bottom: 24px;
}

.edit-field label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.edit-field input {
  width: 95%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: white;
  font-size: 15px;
  transition: all 0.2s;
}

.custom-select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: white;
  font-size: 15px;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2360a5fa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  cursor: pointer;
}

.custom-select:hover {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: #3b82f6;
}

.custom-select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: rgba(255, 255, 255, 0.15);
}

.custom-select option {
  background: #2a2a2e;
  color: white;
  padding: 10px;
}

.edit-field input:focus,
.edit-field select:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.12);
}

.edit-field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.modal-footer {
  display: flex;
  gap: 16px;
  padding: 24px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
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
  .admin-container {
    flex-direction: column;
    padding: 20px;
  }

  .user-card {
    flex-wrap: wrap;
  }

  .delete-btn {
    width: 100%;
    justify-content: center;
  }

  .search-section {
    flex-direction: column;
  }

  .search-wrapper {
    width: 100%;
  }

  .users-title {
    font-size: 24px;
  }

  .modal-content {
    max-width: 95%;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-footer {
    padding: 20px;
  }
}
</style>
