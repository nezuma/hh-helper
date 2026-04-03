<!-- src/renderer/views/SettingsView.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { delCookie, fetcher } from "../helpers";
import { useNotification } from "../composables/eventBus";
import ProfileHeaderWithHouse from "../components/profile-header-with-house.vue";

const { showError } = useNotification();

const router = useRouter();

const showDeleteModal = ref(false);
const showCancelSubscriptionModal = ref(false);
const showPromoOfferModal = ref(false);
const discountCode = ref("");

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

const nicknameForm = ref({
  newName: "",
});

const changePassword = async () => {
  if (
    passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword
  ) {
    showError("Новые пароли не совпадают");
    return;
  }

  const res = await fetcher({
    url: "/profile/settings?settingType=changePassword",
    method: "PATCH",
    body: passwordForm.value,
  });

  if (res.changePassword) {
    delCookie("accessToken");
    delCookie("refreshToken");
    localStorage.removeItem("profile");
    setTimeout(() => router.push("/auth"));
  }
};

const changeNickname = async () => {
  if (nicknameForm.value.newName.trim()) {
    await fetcher({
      url: "/profile/settings?settingType=changeName",
      method: "PATCH",
      body: nicknameForm.value,
    });
    const user = await fetcher({
      url: "/profile",
      method: "GET",
    });
    localStorage.removeItem("profile");
    localStorage.setItem("profile", JSON.stringify(user));
    window.location.reload();
  }
};

const confirmDeleteAccount = () => {
  showError("Функция в разработке");
  showDeleteModal.value = false;
  router.push("/");
};

const confirmCancelSubscription = () => {
  showCancelSubscriptionModal.value = false;
  generatePromoCode();
  showPromoOfferModal.value = true;
};

const generatePromoCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  discountCode.value = result;
};

const acceptPromoCode = () => {
  navigator.clipboard.writeText(discountCode.value);
  alert(
    `Промокод ${discountCode.value} скопирован! Скидка 20% на продление подписки.`,
  );
  showPromoOfferModal.value = false;
  discountCode.value = "";
  console.log("Subscription cancelled with promo code");
};

const rejectPromoCode = () => {
  showPromoOfferModal.value = false;
  discountCode.value = "";
  console.log("Subscription cancelled without promo code");
};

const copyPromoCode = () => {
  navigator.clipboard.writeText(discountCode.value);
  alert("Промокод скопирован!");
};
</script>

<template>
  <div class="settings-view">
    <ProfileHeaderWithHouse />

    <div class="settings-container">
      <h2 class="settings-title">Настройки</h2>

      <div class="settings-section">
        <h3 class="section-title">Изменить пароль</h3>
        <div class="section-content">
          <div class="form-group">
            <label>Старый пароль</label>
            <input
              type="password"
              v-model="passwordForm.oldPassword"
              placeholder="Введите старый пароль"
            />
          </div>
          <div class="form-group">
            <label>Новый пароль</label>
            <input
              type="password"
              v-model="passwordForm.newPassword"
              placeholder="Введите новый пароль"
            />
          </div>
          <div class="form-group">
            <label>Повторение пароля</label>
            <input
              type="password"
              v-model="passwordForm.confirmNewPassword"
              placeholder="Повторите новый пароль"
            />
          </div>
          <button class="btn-save" @click="changePassword">
            Сохранить пароль
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">Изменить никнейм</h3>
        <div class="section-content">
          <div class="form-group">
            <label>Новый никнейм</label>
            <input
              type="text"
              v-model="nicknameForm.newName"
              placeholder="Введите новый никнейм"
            />
          </div>
          <button class="btn-save" @click="changeNickname">
            Сохранить никнейм
          </button>
        </div>
      </div>

      <div class="settings-section danger-zone">
        <h3 class="section-title danger-title">Danger zone!</h3>
        <div class="section-content">
          <div class="danger-actions">
            <div class="danger-item">
              <div class="danger-info">
                <span class="danger-label">Удалить аккаунт</span>
                <span class="danger-description"
                  >Аккаунт будет полностью удален и не может быть
                  восстановлен</span
                >
              </div>
              <button class="btn-danger" @click="showDeleteModal = true">
                Удалить аккаунт
              </button>
            </div>
            <div class="danger-item">
              <div class="danger-info">
                <span class="danger-label">Сбросить подписку</span>
                <span class="danger-description"
                  >Отменить текущую подписку</span
                >
              </div>
              <button
                class="btn-warning"
                @click="showCancelSubscriptionModal = true"
              >
                Сбросить подписку
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления аккаунта -->
    <Transition name="modal">
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="showDeleteModal = false"
      >
        <div class="modal-content">
          <div class="modal-icon delete-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 class="modal-title">Вы точно уверены в своем выборе?</h3>
          <p class="modal-description">
            Аккаунт будет полностью удален и не может быть восстановлен
          </p>
          <div class="modal-actions">
            <button class="btn-modal-cancel" @click="showDeleteModal = false">
              Отмена
            </button>
            <button class="btn-modal-confirm" @click="confirmDeleteAccount">
              Подтверждаю удаление
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Модальное окно подтверждения сброса подписки -->
    <Transition name="modal">
      <div
        v-if="showCancelSubscriptionModal"
        class="modal-overlay"
        @click.self="showCancelSubscriptionModal = false"
      >
        <div class="modal-content">
          <div class="modal-icon warning-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 class="modal-title">Отменить подписку?</h3>
          <p class="modal-description">
            Вы уверены, что хотите отменить текущую подписку?
          </p>
          <div class="modal-actions">
            <button
              class="btn-modal-cancel"
              @click="showCancelSubscriptionModal = false"
            >
              Отмена
            </button>
            <button
              class="btn-modal-confirm"
              @click="confirmCancelSubscription"
            >
              Подтверждаю
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Модальное окно с предложением промокода -->
    <Transition name="modal">
      <div
        v-if="showPromoOfferModal"
        class="modal-overlay"
        @click.self="rejectPromoCode"
      >
        <div class="modal-content promo-modal">
          <div class="modal-icon success-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 class="modal-title">Специальное предложение!</h3>
          <p class="modal-description">
            Получите промокод на скидку 20% при продлении подписки
          </p>
          <div class="promo-code">
            <span class="code">{{ discountCode }}</span>
            <button class="btn-copy" @click="copyPromoCode">Копировать</button>
          </div>
          <div class="modal-actions double">
            <button class="btn-modal-reject" @click="rejectPromoCode">
              Отказаться
            </button>
            <button class="btn-modal-accept" @click="acceptPromoCode">
              Получить промокод
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.settings-view {
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

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 40px;
}

.settings-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #fff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 32px;
  overflow: hidden;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.section-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  max-width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.15);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.btn-save {
  padding: 10px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.danger-zone {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.danger-title {
  color: #f87171;
  border-bottom-color: rgba(239, 68, 68, 0.3);
}

.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.danger-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.danger-label {
  font-size: 16px;
  font-weight: 600;
  color: #f87171;
}

.danger-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.btn-danger {
  padding: 8px 20px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 8px;
  color: #f87171;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.btn-warning {
  padding: 8px 20px;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.5);
  border-radius: 8px;
  color: #fbbf24;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-warning:hover {
  background: rgba(245, 158, 11, 0.3);
  transform: translateY(-1px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2a2a2e;
  border-radius: 20px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: modalFadeIn 0.2s ease;
}

.modal-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-icon svg {
  width: 32px;
  height: 32px;
}

.delete-icon {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.warning-icon {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.success-icon {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.modal-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-actions.double {
  flex-direction: row;
}

.btn-modal-cancel {
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

.btn-modal-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-modal-confirm {
  padding: 10px 24px;
  background: #f87171;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-confirm:hover {
  background: #ef4444;
  transform: translateY(-1px);
}

.btn-modal-reject {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-modal-reject:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-modal-accept {
  padding: 10px 24px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-modal-accept:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.promo-modal {
  max-width: 450px;
}

.promo-code {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.code {
  font-size: 18px;
  font-weight: 600;
  font-family: monospace;
  color: #60a5fa;
  letter-spacing: 1px;
  word-break: break-all;
}

.btn-copy {
  padding: 6px 16px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 8px;
  color: #60a5fa;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-copy:hover {
  background: rgba(59, 130, 246, 0.3);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
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

@media (max-width: 768px) {
  .settings-container {
    padding: 40px 20px;
  }

  .danger-item {
    flex-direction: column;
    text-align: center;
  }

  .danger-info {
    text-align: center;
  }

  .modal-actions.double {
    flex-direction: column;
  }

  .promo-code {
    flex-direction: column;
    text-align: center;
  }
}
</style>
