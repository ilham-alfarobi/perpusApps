// src/router/index.js
// Konfigurasi Vue Router untuk navigasi antar halaman.
// - Route '/'           → Login.vue (halaman publik)
// - Route '/dashboard'  → Dashboard.vue (halaman terproteksi)
// Navigation Guard: Jika token tidak ada di localStorage, redirect ke Login.

import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  // Catch-all: redirect URL tidak dikenal ke login
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ─── Navigation Guard Global 
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("perpus_token");
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !token) {
    // Halaman butuh auth tapi tidak ada token → ke Login
    next({ name: "Login" });
  } else if (!requiresAuth && token && to.name === "Login") {
    // Sudah login tapi ke halaman Login → ke Dashboard
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;
