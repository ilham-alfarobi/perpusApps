// src/router/index.js
// Konfigurasi Vue Router untuk navigasi antar halaman.
// - Route '/'                  → Login.vue (halaman publik)
// - Route '/dashboard'         → Dashboard.vue (halaman terproteksi, semua user)
// - Route '/transaksi'         → KelolaTransaksi.vue (khusus Admin)
// Navigation Guard:
//   - Jika token tidak ada, redirect ke Login.
//   - Jika rute requiresAdmin tapi role bukan ADMIN, redirect ke /dashboard.

import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import KelolaTransaksi from "../views/KelolaTransaksi.vue";

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
  {
    path: "/transaksi",
    name: "KelolaTransaksi",
    component: KelolaTransaksi,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  // Catch-all: redirect URL tidak dikenal ke login
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ─── Navigation Guard Global ──────────────────────────────────────────────────
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("perpus_token");
  const role = localStorage.getItem("perpus_role");
  const requiresAuth = to.meta.requiresAuth;
  const requiresAdmin = to.meta.requiresAdmin;

  if (requiresAuth && !token) {
    // Halaman butuh auth tapi tidak ada token → ke Login
    next({ name: "Login" });
  } else if (!requiresAuth && token && to.name === "Login") {
    // Sudah login tapi ke halaman Login → ke Dashboard
    next({ name: "Dashboard" });
  } else if (requiresAdmin && role !== "ADMIN") {
    // Halaman hanya untuk Admin, tapi role bukan ADMIN
    alert("Akses ditolak. Halaman ini hanya untuk Admin.");
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;
