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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
