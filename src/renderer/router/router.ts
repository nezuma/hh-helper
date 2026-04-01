import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "main",
    component: () => import("../components/main.vue"), // относительный путь
  },
  {
    path: "/auth",
    name: "auth",
    component: () => import("../pages/auth-page.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
