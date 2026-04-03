import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "start",
    component: () => import("../components/main.vue"), // относительный путь
  },

  {
    path: "/main",
    name: "main",
    component: () => import("../pages/main-page.vue"),
  },
  {
    path: "/main/hh",
    name: "hh",
    component: () => import("../pages/main-hh-page.vue"),
  },
  {
    path: "/main/habr",
    name: "habr",
    component: () => import("../pages/main-habr-page.vue"),
  },

  {
    path: "/auth",
    name: "auth",
    component: () => import("../pages/auth-page.vue"),
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
  {
    path: "/loading",
    name: "loading",
    component: () => import("../components/loading.vue"),
  },

  {
    path: "/admin/main",
    name: "admin-main",
    component: () => import("../admin/admin-main.vue"),
  },
  {
    path: "/admin/analytics",
    name: "admin-analytics",
    component: () => import("../admin/admin-analytics.vue"),
  },
  {
    path: "/admin/users",
    name: "admin-users",
    component: () => import("../admin/admin-users.vue"),
  },
  {
    path: "/admin/tariffs",
    name: "admin-tariffs",
    component: () => import("../admin/admin-tariffs.vue"),
  },
  {
    path: "/admin/service",
    name: "admin-service",
    component: () => import("../admin/admin-service.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
