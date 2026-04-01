<!-- pages/AuthPage.vue -->
<script setup lang="ts">
import AuthModal from "../components/auth-modal.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const handleClose = () => {
  router.push("/");
};

const handleLogin = (data: { login: string; password: string }) => {
  console.log("Login:", data);
  router.push("/main");
};

const handleRegister = (data: {
  email: string;
  login: string;
  password: string;
}) => {
  console.log("Register:", data);
  router.push("/");
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
