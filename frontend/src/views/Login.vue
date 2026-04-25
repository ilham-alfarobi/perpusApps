<!-- src/views/Login.vue -->
<!-- Halaman login untuk autentikasi petugas perpustakaan.
     Mengirim POST ke /api/auth/login, menyimpan JWT ke localStorage,
     lalu redirect ke Dashboard jika berhasil. -->

<template>
  <v-app :theme="'perpusTheme'">
    <v-main class="login-bg">
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center" class="fill-height">
          <!-- Panel kiri: ilustrasi & branding -->
          <v-col cols="12" md="6" lg="5" class="d-none d-md-flex">
            <div class="brand-panel">
              <div class="brand-icon-wrapper mb-6">
                <v-icon size="80" color="white">mdi-book-open-page-variant</v-icon>
              </div>
              <h1 class="brand-title">PerpusApp</h1>
              <p class="brand-subtitle">
                Sistem Pendataan Buku Perpustakaan<br />
                yang Modern &amp; Efisien
              </p>
              <div class="brand-features mt-8">
                <div v-for="feat in features" :key="feat" class="feature-item">
                  <v-icon color="white" size="18" class="mr-2">mdi-check-circle</v-icon>
                  <span>{{ feat }}</span>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Panel kanan: form login -->
          <v-col cols="12" sm="10" md="6" lg="4">
            <v-card class="login-card" elevation="0">
              <!-- Header kartu -->
              <div class="login-card-header">
                <v-avatar color="primary" size="56" class="mb-4">
                  <v-icon color="white" size="30">mdi-lock-outline</v-icon>
                </v-avatar>
                <h2 class="login-title">Selamat Datang</h2>
                <p class="login-subtitle">Masuk ke akun petugas perpustakaan Anda</p>
              </div>

              <v-divider class="my-4" />

              <!-- Form Login -->
              <v-form
                ref="formRef"
                @submit.prevent="handleLogin"
                class="login-form"
              >
                <!-- Alert error -->
                <v-alert
                  v-if="errorMessage"
                  type="error"
                  variant="tonal"
                  closable
                  class="mb-4"
                  @click:close="errorMessage = ''"
                >
                  {{ errorMessage }}
                </v-alert>

                <!-- Input Username -->
                <v-text-field
                  id="input-username"
                  v-model="form.username"
                  label="Username"
                  prepend-inner-icon="mdi-account-outline"
                  :rules="[rules.required]"
                  autocomplete="username"
                  class="mb-2"
                  :disabled="loading"
                />

                <!-- Input Password -->
                <v-text-field
                  id="input-password"
                  v-model="form.password"
                  label="Password"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="[rules.required]"
                  autocomplete="current-password"
                  class="mb-4"
                  :disabled="loading"
                  @click:append-inner="showPassword = !showPassword"
                />

                <!-- Tombol Login -->
                <v-btn
                  id="btn-login"
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  class="login-btn"
                >
                  <v-icon left class="mr-2">mdi-login</v-icon>
                  Masuk
                </v-btn>
              </v-form>

              <div class="login-footer mt-4">
                <v-icon size="14" color="grey">mdi-shield-lock-outline</v-icon>
                <span class="text-caption text-grey ml-1">Koneksi aman &amp; terenkripsi</span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import apiClient from "../api/axios.js";

const router = useRouter();

// ─── State ─────────────────────────────────────────────────────────────────
const formRef = ref(null);
const loading = ref(false);
const errorMessage = ref("");
const showPassword = ref(false);

const form = reactive({
  username: "",
  password: "",
});

// ─── Fitur branding panel kiri ─────────────────────────────────────────────
const features = [
  "Manajemen buku lengkap",
  "Pencarian cepat & akurat",
  "Data aman dengan JWT",
  "Antarmuka modern & responsif",
];

// ─── Validasi ──────────────────────────────────────────────────────────────
const rules = {
  required: (v) => !!v || "Field ini wajib diisi.",
};

// ─── Handler Login ─────────────────────────────────────────────────────────
async function handleLogin() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const { data } = await apiClient.post("/auth/login", {
      username: form.username,
      password: form.password,
    });

    // Simpan token, role, dan data user ke localStorage
    localStorage.setItem("perpus_token", data.token);
    localStorage.setItem("perpus_role", data.role);
    localStorage.setItem("perpus_user", JSON.stringify(data.user));

    // Redirect ke dashboard
    router.push({ name: "Dashboard" });
  } catch (err) {
    errorMessage.value =
      err.response?.data?.message || "Terjadi kesalahan. Coba lagi.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 40%, #01579b 100%);
  min-height: 100vh;
}

/* ─── Brand Panel ─── */
.brand-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 3rem;
  color: white;
}

.brand-icon-wrapper {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 2.8rem;
  font-weight: 700;
  letter-spacing: -1px;
  margin-bottom: 0.5rem;
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.85;
  line-height: 1.6;
}

.feature-item {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

/* ─── Login Card ─── */
.login-card {
  background: white;
  border-radius: 24px !important;
  padding: 2.5rem 2rem;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18) !important;
}

.login-card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.login-title {
  font-size: 1.7rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.4rem;
}

.login-subtitle {
  color: #666;
  font-size: 0.9rem;
}

.login-btn {
  height: 52px !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px;
}

.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
