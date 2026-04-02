import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "start",
    component: () => import("../components/main.vue"), // относительный путь
  },
  {
    path: "/auth",
    name: "auth",
    component: () => import("../pages/auth-page.vue"),
  },
  {
    path: "/main",
    name: "main",
    component: () => import("../pages/main-page.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("../pages/profile-page.vue"),
  },
  {
    path: "/tariffs",
    name: "tariffs",
    component: () => import("../pages/tariff-page.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../pages/settings-page.vue"),
  },
  {
    path: "/register/accept",
    name: "auth-accept",
    component: () => import("../pages/register-accept-page.vue"),
  },
  {
    path: "/privacy-policy",
    name: "privacy-policy",
    component: () => import("../pages/privacy-policy-page.vue"),
  },
  {
    path: "/register/success",
    name: "success-register",
    component: () => import("../pages/register-success-page.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
