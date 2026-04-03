<!-- pages/AuthPage.vue -->
<script setup lang="ts">
import AuthModal from "../components/auth-modal.vue";
import { useRouter } from "vue-router";
import { fetcher, setCookie } from "../helpers";

const router = useRouter();

const handleClose = () => {
  router.push("/");
};

const handleLogin = async (data: { login: string; password: string }) => {
  const res = await fetcher({ url: "/auth", method: "POST", body: data });
  localStorage.setItem("profile", JSON.stringify(res.profile));
  setCookie(
    "accessToken",
    res.tokens.accessToken,
    Number(new Date()) + 5 * 60 * 1000,
  );
  setCookie(
    "refreshToken",
    res.tokens.refreshToken,
    Number(new Date()) + 7 * 24 * 60 * 60 * 1000,
  );
  router.push("/main");
};

const handleRegister = async (data: {
  email: string;
  login: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await fetcher({
    url: "/register",
    method: "POST",
    body: data,
  });
  if (response.success === true) {
    router.push("/register/success");
  }
};
</script>

<template>
  <div class="auth-page">
    <AuthModal
      @close="handleClose"
      @login="handleLogin"
      @register="handleRegister"
    />
  </div>
</template>

<style scoped>
.auth-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}
</style>
