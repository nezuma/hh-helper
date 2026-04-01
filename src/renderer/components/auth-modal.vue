<!-- components/AuthModal.vue -->
<script setup lang="ts">
import { ref, nextTick } from "vue";

const isLoginMode = ref(true);
const isAnimating = ref(false);
const showContent = ref(true);
const showSvg = ref(false);

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

const emit = defineEmits<{
  (e: "close"): void;
  (e: "login", data: { login: string; password: string }): void;
  (
    e: "register",
    data: { email: string; login: string; password: string },
  ): void;
}>();

const animate = async (targetMode: boolean) => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  const modal = document.querySelector(".auth-modal") as HTMLElement;

  // 1. удаление содержимого блока
  showContent.value = false;
  await nextTick();

  // 2. уменьшение до кружочка
  modal.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  modal.style.width = "80px";
  modal.style.minHeight = "80px";
  modal.style.borderRadius = "50%";
  modal.style.overflow = "visible";

  await new Promise((resolve) => setTimeout(resolve, 300));

  // 3. добавление svg
  showSvg.value = true;
  await nextTick();

  const svgContainer = document.querySelector(".svg-container") as HTMLElement;
  if (svgContainer) {
    svgContainer.style.borderRadius = "50%";
    svgContainer.style.transition = "all 0.1s ease";

    // анимация свечения (3 моргания)
    for (let i = 0; i < 2; i++) {
      svgContainer.style.transition = "all 0.1s ease";
      await new Promise((resolve) => setTimeout(resolve, 150));
      svgContainer.style.boxShadow = "0 0 25px 10px rgba(255, 255, 255, 0.5)";
      await new Promise((resolve) => setTimeout(resolve, 150));
      svgContainer.style.boxShadow = "none";
    }
  }

  // 4. удаление svg, border и свечения
  if (svgContainer) {
    svgContainer.style.border = "none";
    await new Promise((resolve) => setTimeout(resolve, 150));
    svgContainer.style.padding = "0";
    await new Promise((resolve) => setTimeout(resolve, 150));
    svgContainer.style.boxShadow = "none";
  }
  showSvg.value = false;
  await nextTick();

  // смена режима
  isLoginMode.value = targetMode;

  // 5. расширение блока до нужного размера
  modal.style.width = "400px";
  modal.style.minHeight = "464px";
  modal.style.borderRadius = "16px";
  modal.style.overflow = "hidden";

  await new Promise((resolve) => setTimeout(resolve, 300));

  // 6. отображение содержимого блока
  showContent.value = true;
  await nextTick();

  isAnimating.value = false;
};

const switchToRegister = () => animate(false);
const switchToLogin = () => animate(true);

const handleLogin = () => {
  emit("login", loginForm.value);
};

const handleRegister = () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    console.log("Пароли не совпадают");
    return;
  }
  emit("register", {
    email: registerForm.value.email,
    login: registerForm.value.login,
    password: registerForm.value.password,
  });
};
</script>

<template>
  <div class="auth-overlay" @click.self="emit('close')">
    <div class="auth-modal">
      <div class="content" v-if="showContent">
        <h2 class="auth-title">{{ isLoginMode ? "Вход" : "Регистрация" }}</h2>

        <div v-if="isLoginMode" class="auth-form">
          <input
            v-model="loginForm.login"
            type="text"
            placeholder="Логин"
            class="auth-input"
          />
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="Пароль"
            class="auth-input"
          />
          <button @click="handleLogin" class="auth-btn-submit">Войти</button>
          <button @click="switchToRegister" class="auth-link">
            Еще нет аккаунта?
          </button>
        </div>

        <div v-else class="auth-form">
          <input
            v-model="registerForm.email"
            type="email"
            placeholder="Почта"
            class="auth-input"
          />
          <input
            v-model="registerForm.login"
            type="text"
            placeholder="Логин"
            class="auth-input"
          />
          <input
            v-model="registerForm.password"
            type="password"
            placeholder="Пароль"
            class="auth-input"
          />
          <input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="Подтверждение пароля"
            class="auth-input"
          />
          <button @click="handleRegister" class="auth-btn-submit">
            Зарегистрироваться
          </button>
          <button @click="switchToLogin" class="auth-link">
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
</template>

<style scoped>
.auth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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
  /* background: linear-gradient(135deg, #3b82f6, #2563eb); */
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
}

.auth-btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

.auth-link:hover {
  color: #3b82f6;
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
</style>
