<!-- components/AuthModal.vue -->
<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useNotification } from "../composables/eventBus";

const { showError } = useNotification();

const router = useRouter();
const isLoginMode = ref(true);
const isAnimating = ref(false);
const showContent = ref(true);
const showSvg = ref(false);
const acceptPolicy = ref(false);
const isLoginLoading = ref(false);
const isRegisterLoading = ref(false);

const loginForm = ref({
  login: "",
  password: "",
});

const registerForm = ref({
  email: "",
  login: "",
  password: "",
  confirmPassword: "",
});

// Валидация формы регистрации
const registerErrors = ref({
  email: "",
  login: "",
  password: "",
  confirmPassword: "",
});

const validateRegisterForm = () => {
  let isValid = true;

  // Очищаем ошибки
  registerErrors.value = {
    email: "",
    login: "",
    password: "",
    confirmPassword: "",
  };

  // Проверка email
  if (!registerForm.value.email.trim()) {
    registerErrors.value.email = "Введите email";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)) {
    registerErrors.value.email = "Введите корректный email";
    isValid = false;
  }

  // Проверка логина
  if (!registerForm.value.login.trim()) {
    registerErrors.value.login = "Введите логин";
    isValid = false;
  } else if (registerForm.value.login.length < 3) {
    registerErrors.value.login = "Логин должен содержать не менее 3 символов";
    isValid = false;
  }

  // Проверка пароля
  if (!registerForm.value.password) {
    registerErrors.value.password = "Введите пароль";
    isValid = false;
  } else if (registerForm.value.password.length < 6) {
    registerErrors.value.password =
      "Пароль должен содержать не менее 6 символов";
    isValid = false;
  }

  // Проверка подтверждения пароля
  if (!registerForm.value.confirmPassword) {
    registerErrors.value.confirmPassword = "Подтвердите пароль";
    isValid = false;
  } else if (
    registerForm.value.password !== registerForm.value.confirmPassword
  ) {
    registerErrors.value.confirmPassword = "Пароли не совпадают";
    isValid = false;
  }

  return isValid;
};

const emit = defineEmits<{
  (e: "close"): void;
  (e: "login", data: { login: string; password: string }): void;
  (
    e: "register",
    data: {
      email: string;
      login: string;
      password: string;
      confirmPassword: string;
    },
  ): void;
}>();

const animate = async (targetMode: boolean) => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  const modal = document.querySelector(".auth-modal") as HTMLElement;

  showContent.value = false;
  await nextTick();

  modal.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  modal.style.width = "80px";
  modal.style.minHeight = "80px";
  modal.style.borderRadius = "50%";
  modal.style.overflow = "visible";

  await new Promise((resolve) => setTimeout(resolve, 300));

  showSvg.value = true;
  await nextTick();

  const svgContainer = document.querySelector(".svg-container") as HTMLElement;
  if (svgContainer) {
    svgContainer.style.borderRadius = "50%";
    svgContainer.style.transition = "all 0.1s ease";

    for (let i = 0; i < 2; i++) {
      svgContainer.style.transition = "all 0.1s ease";
      await new Promise((resolve) => setTimeout(resolve, 150));
      svgContainer.style.boxShadow = "0 0 25px 10px rgba(255, 255, 255, 0.5)";
      await new Promise((resolve) => setTimeout(resolve, 150));
      svgContainer.style.boxShadow = "none";
    }
  }

  if (svgContainer) {
    svgContainer.style.border = "none";
    await new Promise((resolve) => setTimeout(resolve, 150));
    svgContainer.style.padding = "0";
    await new Promise((resolve) => setTimeout(resolve, 150));
    svgContainer.style.boxShadow = "none";
  }
  showSvg.value = false;
  await nextTick();

  isLoginMode.value = targetMode;

  modal.style.width = "400px";
  modal.style.minHeight = "464px";
  modal.style.borderRadius = "16px";
  modal.style.overflow = "hidden";

  await new Promise((resolve) => setTimeout(resolve, 300));

  showContent.value = true;
  await nextTick();

  isAnimating.value = false;
};

const switchToRegister = () => animate(false);
const switchToLogin = () => animate(true);

const handleLogin = async () => {
  if (isLoginLoading.value) return;

  if (!loginForm.value.login.trim()) {
    showError("Введите логин");
    return;
  }
  if (!loginForm.value.password) {
    showError("Введите пароль");
    return;
  }

  isLoginLoading.value = true;

  try {
    await emit("login", loginForm.value);
  } finally {
    setTimeout(() => {
      isLoginLoading.value = false;
    }, 500);
  }
};

const handleRegister = async () => {
  if (isRegisterLoading.value) return;

  // Валидация формы
  if (!validateRegisterForm()) {
    // Показываем первую ошибку
    const firstError = Object.values(registerErrors.value).find((err) => err);
    if (firstError) {
      showError(firstError);
    }
    return;
  }

  if (!acceptPolicy.value) {
    showError("Необходимо принять политику конфиденциальности");
    return;
  }

  isRegisterLoading.value = true;

  try {
    await emit("register", {
      email: registerForm.value.email,
      login: registerForm.value.login,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword,
    });
  } finally {
    setTimeout(() => {
      isRegisterLoading.value = false;
    }, 500);
  }
};

const openPrivacyPolicy = () => {
  router.push("/privacy-policy");
};

const goToHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="auth-overlay">
    <header class="auth-header">
      <div class="header-left">
        <button class="back-btn" @click="goToHome">
          <svg
            class="home-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H9v8H5a2 2 0 0 1-2-2z"
            />
          </svg>
        </button>
        <h1 class="logo">HH Helper</h1>
      </div>
    </header>

    <div class="auth-modal-wrapper">
      <div class="auth-modal">
        <div class="content" v-if="showContent">
          <h2 class="auth-title">{{ isLoginMode ? "Вход" : "Регистрация" }}</h2>

          <div v-if="isLoginMode" class="auth-form">
            <input
              v-model="loginForm.login"
              type="text"
              placeholder="Логин"
              class="auth-input"
              :class="{
                error: loginForm.login.trim() === '' && loginForm.login !== '',
              }"
              :disabled="isLoginLoading"
            />
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="Пароль"
              class="auth-input"
              :disabled="isLoginLoading"
            />
            <button
              @click="handleLogin"
              class="auth-btn-submit"
              :disabled="isLoginLoading"
            >
              <span v-if="!isLoginLoading">Войти</span>
              <span v-else class="btn-loader"></span>
            </button>
            <button
              @click="switchToRegister"
              class="auth-link"
              :disabled="isLoginLoading"
            >
              Еще нет аккаунта?
            </button>
          </div>

          <div v-else class="auth-form">
            <div class="input-wrapper">
              <input
                v-model="registerForm.email"
                type="email"
                placeholder="Почта"
                class="auth-input"
                :class="{ error: registerErrors.email }"
                :disabled="isRegisterLoading"
              />
              <span v-if="registerErrors.email" class="error-message">{{
                registerErrors.email
              }}</span>
            </div>

            <div class="input-wrapper">
              <input
                v-model="registerForm.login"
                type="text"
                placeholder="Логин"
                class="auth-input"
                :class="{ error: registerErrors.login }"
                :disabled="isRegisterLoading"
              />
              <span v-if="registerErrors.login" class="error-message">{{
                registerErrors.login
              }}</span>
            </div>

            <div class="input-wrapper">
              <input
                v-model="registerForm.password"
                type="password"
                placeholder="Пароль"
                class="auth-input"
                :class="{ error: registerErrors.password }"
                :disabled="isRegisterLoading"
              />
              <span v-if="registerErrors.password" class="error-message">{{
                registerErrors.password
              }}</span>
            </div>

            <div class="input-wrapper">
              <input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="Подтверждение пароля"
                class="auth-input"
                :class="{ error: registerErrors.confirmPassword }"
                :disabled="isRegisterLoading"
              />
              <span
                v-if="registerErrors.confirmPassword"
                class="error-message"
                >{{ registerErrors.confirmPassword }}</span
              >
            </div>

            <label
              class="checkbox-label"
              :class="{ disabled: isRegisterLoading }"
            >
              <input
                type="checkbox"
                v-model="acceptPolicy"
                :disabled="isRegisterLoading"
              />
              <span class="checkmark"></span>
              <span class="checkbox-text">
                Я принимаю
                <button
                  type="button"
                  @click="openPrivacyPolicy"
                  class="policy-link"
                  :disabled="isRegisterLoading"
                >
                  политику конфиденциальности
                </button>
              </span>
            </label>

            <button
              @click="handleRegister"
              class="auth-btn-submit"
              :disabled="isRegisterLoading"
            >
              <span v-if="!isRegisterLoading">Зарегистрироваться</span>
              <span v-else class="btn-loader"></span>
            </button>
            <button
              @click="switchToLogin"
              class="auth-link"
              :disabled="isRegisterLoading"
            >
              Уже есть аккаунт?
            </button>
          </div>
        </div>

        <div class="svg-container" v-if="showSvg">
          <div class="circle-icon">
            <svg
              v-if="isLoginMode"
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <svg
              v-else
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  z-index: 1000;
  overflow-y: auto;
}

.auth-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
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

.auth-modal-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 100px 20px 40px;
}

.auth-modal {
  width: 400px;
  min-height: 464px;
  background: #2a2a2e;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.content {
  width: 100%;
  padding: 32px;
}

.svg-container {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
}

.circle-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.2s ease;
}

.icon {
  width: 40px;
  height: 40px;
  color: white;
  animation: iconRotate 0.2s ease;
}

.auth-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  color: white;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auth-input {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}

.auth-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.15);
}

.auth-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.auth-input.error {
  border-color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.auth-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  font-size: 12px;
  color: #f87171;
  margin-left: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-left: 8px;
  margin-top: 8px;
}

.checkbox-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox-label:hover .checkmark {
  background: rgba(255, 255, 255, 0.15);
  border-color: #3b82f6;
}

.checkbox-label input:checked ~ .checkmark {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: #3b82f6;
}

.checkbox-label input:checked ~ .checkmark::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.policy-link {
  background: none;
  border: none;
  color: #60a5fa;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
  padding: 0;
  margin: 0;
  transition: color 0.2s;
}

.policy-link:hover {
  color: #3b82f6;
}

.policy-link:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-btn-submit {
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.auth-btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.auth-btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.auth-link {
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
  text-decoration: underline;
}

.auth-link:hover:not(:disabled) {
  color: #3b82f6;
}

.auth-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes iconRotate {
  0% {
    transform: rotate(-180deg) scale(0);
    opacity: 0;
  }
  100% {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .auth-header {
    padding: 16px 20px;
  }

  .auth-modal-wrapper {
    padding: 80px 16px 32px;
  }

  .auth-modal {
    width: 100%;
    max-width: 400px;
  }

  .content {
    padding: 24px;
  }

  .auth-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
}
</style>
