<!-- pages/AuthPage.vue -->
<script setup lang="ts">
import AuthModal from "../components/auth-modal.vue";
import { useRouter } from "vue-router";
import { fetcher } from "../helpers";

const router = useRouter();

const handleClose = () => {
  router.push("/");
};

const handleLogin = (data: { login: string; password: string }) => {
  router.push("/main");
};

const handleRegister = async (data: {
  email: string;
  login: string;
  password: string;
  confirmPassword: string;
}) => {
  console.log(data);
  await fetcher({ url: "/register", method: "POST", body: data });
  // router.push("/");
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
