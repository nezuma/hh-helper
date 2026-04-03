<!-- src/renderer/views/ProfileView.vue -->
<script setup lang="ts">
import { fetcher, formatDate } from "../helpers";
import { useNotification } from "../composables/eventBus";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";
import { onMounted, ref } from "vue";
import Loading from "../components/loading.vue";

const userData = ref();
const loading = ref(true);

const { showError } = useNotification();

const editProfile = () => {
  showError("На данный момент в разработке");
};

const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (local.length <= 3) return email;
  const maskedLocal = local.slice(0, 3) + "***" + local.slice(-1);
  return `${maskedLocal}@${domain}`;
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin":
      return { text: "Администратор", class: "role-admin" };
    case "moder":
      return { text: "Модератор", class: "role-moder" };
    case "premium":
      return { text: "Премиум", class: "role-premium" };
    case "applicant":
      return { text: "Пользователь", class: "role-applicant" };
    default:
      return { text: role, class: "role-default" };
  }
};

onMounted(async () => {
  userData.value = await fetcher({ url: "/profile", method: "GET" });
  loading.value = false;
});
</script>

<template>
  <Loading v-if="loading" />
  <div v-else class="profile-view">
    <ProfileHeaderWithHouse />

    <div class="profile-container">
      <div class="profile-card">
        <div class="profile-avatar-section">
          <div class="profile-avatar">
            <svg
              v-if="!userData.avatar"
              class="profile-avatar-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <img
              v-else
              :src="userData.avatar"
              alt="avatar"
              class="profile-avatar-img"
            />
          </div>
          <div class="role-badge" :class="getRoleLabel(userData.role).class">
            <svg
              v-if="userData.role === 'admin'"
              class="role-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              />
            </svg>
            <svg
              v-else-if="userData.role === 'moder'"
              class="role-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else-if="userData.role === 'premium'"
              class="role-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
            <svg
              v-else
              class="role-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {{ getRoleLabel(userData.role).text }}
          </div>
          <button class="edit-btn" @click="editProfile">Редактировать</button>
        </div>

        <div class="profile-info">
          <div class="info-row">
            <span class="info-label">Ник</span>
            <span class="info-value">{{
              userData.name ? userData.name : userData.login
            }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Почта</span>
            <span class="info-value">{{ maskEmail(userData.email) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Дата регистрации</span>
            <span class="info-value">{{ formatDate(userData.createdAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Тариф</span>
            <span v-if="userData.tariff?.tariffDuration" class="info-value"
              >{{ userData.tariff.tariffName }} (до
              {{ userData.tariff.tariffDuration }})</span
            >
            <span v-else class="info-value"
              >{{ userData.tariff?.tariffName || "Базовый" }} (Вечный)</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 40px;
}

.profile-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  max-width: 800px;
  width: 100%;
  display: flex;
  gap: 48px;
  animation: fadeIn 0.3s ease;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #3b82f6;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar-svg {
  width: 80px;
  height: 80px;
  color: white;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-icon {
  width: 14px;
  height: 14px;
}

.role-admin {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.role-moder {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.role-premium {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1a1a2e;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

.role-applicant {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.role-default {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
}

.edit-btn {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 18px;
  font-weight: 500;
  color: white;
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
  .profile-container {
    padding: 20px;
  }

  .profile-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px;
  }

  .info-row {
    align-items: center;
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
  }

  .profile-avatar-svg {
    width: 60px;
    height: 60px;
  }
}
</style>
