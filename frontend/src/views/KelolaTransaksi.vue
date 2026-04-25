<!-- src/views/KelolaTransaksi.vue -->
<!-- Halaman Kelola Transaksi Peminjaman — KHUSUS ADMIN
     Menampilkan seluruh riwayat peminjaman buku dengan opsi:
     - 'Buku Dikembalikan': memanggil PUT /api/transactions/:id/return
     - 'Hapus Riwayat': memanggil DELETE /api/transactions/:id (safe delete) -->

<template>
  <v-app>
    <!-- ─── App Bar ─────────────────────────────────────────────────────── -->
    <v-app-bar color="primary" elevation="2" height="64">
      <template #prepend>
        <v-btn
          id="btn-back-dashboard"
          icon
          color="white"
          variant="text"
          @click="$router.push({ name: 'Dashboard' })"
        >
          <v-icon>mdi-arrow-left</v-icon>
          <v-tooltip activator="parent" location="bottom">Kembali ke Dashboard</v-tooltip>
        </v-btn>
      </template>

      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon color="white" class="mr-2">mdi-swap-horizontal-bold</v-icon>
          <span class="app-bar-title">Kelola Transaksi</span>
        </div>
      </v-app-bar-title>

      <template #append>
        <div class="d-flex align-center mr-2">
          <v-chip color="warning" variant="tonal" size="small" class="mr-3 d-none d-sm-flex">
            <v-icon start size="14">mdi-shield-crown</v-icon>
            Admin
          </v-chip>
          <span class="text-white text-body-2 d-none d-sm-inline">
            {{ currentUser?.username }}
          </span>
        </div>
        <v-btn
          id="btn-logout"
          icon
          color="white"
          variant="text"
          @click="handleLogout"
        >
          <v-icon>mdi-logout</v-icon>
          <v-tooltip activator="parent" location="bottom">Logout</v-tooltip>
        </v-btn>
      </template>
    </v-app-bar>

    <!-- ─── Main Content ───────────────────────────────────────────────── -->
    <v-main class="dashboard-bg">
      <v-container class="py-8" max-width="1400">

        <!-- Statistik Ringkas -->
        <v-row class="mb-6" dense>
          <v-col cols="12" sm="4">
            <v-card class="stat-card" color="primary" variant="flat">
              <v-card-text>
                <div class="stat-label">Total Transaksi</div>
                <div class="stat-value">{{ transactions.length }}</div>
                <v-icon class="stat-icon">mdi-clipboard-list-outline</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card class="stat-card" color="error" variant="flat">
              <v-card-text>
                <div class="stat-label">Masih Dipinjam</div>
                <div class="stat-value">{{ countDipinjam }}</div>
                <v-icon class="stat-icon">mdi-book-arrow-right-outline</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card class="stat-card" color="success" variant="flat">
              <v-card-text>
                <div class="stat-label">Sudah Dikembalikan</div>
                <div class="stat-value">{{ countDikembalikan }}</div>
                <v-icon class="stat-icon">mdi-book-check-outline</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tabel Transaksi -->
        <v-card class="table-card" elevation="0">
          <v-card-title class="table-header pa-6">
            <div class="d-flex align-center justify-space-between flex-wrap gap-3">
              <div>
                <h2 class="table-title">Riwayat Transaksi Peminjaman</h2>
                <p class="text-body-2 text-grey mt-1">
                  Pantau & kelola semua aktivitas peminjaman buku
                </p>
              </div>
              <div class="d-flex align-center gap-3">
                <!-- Filter Status -->
                <v-select
                  id="filter-status"
                  v-model="filterStatus"
                  :items="statusOptions"
                  label="Filter Status"
                  hide-details
                  density="compact"
                  style="min-width: 180px"
                  clearable
                />
                <!-- Search -->
                <v-text-field
                  id="input-search"
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="Cari transaksi..."
                  hide-details
                  density="compact"
                  style="min-width: 220px"
                  clearable
                />
                <!-- Refresh -->
                <v-btn
                  id="btn-refresh"
                  icon
                  variant="tonal"
                  color="primary"
                  :loading="tableLoading"
                  @click="fetchTransactions"
                >
                  <v-icon>mdi-refresh</v-icon>
                  <v-tooltip activator="parent" location="bottom">Refresh</v-tooltip>
                </v-btn>
              </div>
            </div>
          </v-card-title>

          <v-divider />

          <!-- Data Table -->
          <v-data-table
            id="table-transactions"
            :headers="headers"
            :items="filteredTransactions"
            :search="search"
            :loading="tableLoading"
            loading-text="Memuat data transaksi..."
            no-data-text="Belum ada data transaksi."
            items-per-page="15"
            class="transactions-table"
          >
            <!-- No -->
            <template #item.no="{ index }">
              <span class="text-body-2 text-grey">{{ index + 1 }}</span>
            </template>

            <!-- Peminjam -->
            <template #item.user="{ item }">
              <div class="d-flex align-center">
                <v-avatar color="primary" variant="tonal" size="32" class="mr-2">
                  <v-icon size="16">mdi-account</v-icon>
                </v-avatar>
                <span class="font-weight-medium">{{ item.user?.username }}</span>
              </div>
            </template>

            <!-- Judul Buku -->
            <template #item.book="{ item }">
              <div>
                <div class="font-weight-semibold">{{ item.book?.title }}</div>
                <div class="text-caption text-grey">{{ item.book?.author }}</div>
              </div>
            </template>

            <!-- Tanggal Pinjam -->
            <template #item.borrowDate="{ item }">
              <span class="text-body-2">{{ formatDate(item.borrowDate) }}</span>
            </template>

            <!-- Tanggal Kembali -->
            <template #item.returnDate="{ item }">
              <span class="text-body-2 text-grey">
                {{ item.returnDate ? formatDate(item.returnDate) : "—" }}
              </span>
            </template>

            <!-- Status -->
            <template #item.status="{ item }">
              <v-chip
                :color="item.status === 'DIKEMBALIKAN' ? 'success' : 'error'"
                variant="tonal"
                size="small"
              >
                <v-icon start size="12">
                  {{ item.status === 'DIKEMBALIKAN' ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                </v-icon>
                {{ item.status }}
              </v-chip>
            </template>

            <!-- Aksi -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <!-- Tombol Kembalikan (hanya jika masih DIPINJAM) -->
                <v-btn
                  v-if="item.status === 'DIPINJAM'"
                  :id="`btn-return-${item.id}`"
                  size="small"
                  color="success"
                  variant="tonal"
                  prepend-icon="mdi-book-check"
                  :loading="returningId === item.id"
                  @click="handleReturn(item)"
                >
                  Dikembalikan
                </v-btn>

                <!-- Tombol Hapus Riwayat -->
                <v-btn
                  :id="`btn-delete-transaction-${item.id}`"
                  icon
                  size="small"
                  color="error"
                  variant="tonal"
                  @click="openDeleteDialog(item)"
                >
                  <v-icon size="16">mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Hapus Riwayat</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </v-main>

    <!-- ─── Dialog Konfirmasi Hapus ────────────────────────────────────── -->
    <v-dialog
      id="dialog-confirm-delete-transaction"
      v-model="deleteDialog.show"
      max-width="440"
    >
      <v-card>
        <v-card-text class="pa-6 text-center">
          <v-avatar color="error" variant="tonal" size="64" class="mb-4">
            <v-icon color="error" size="32">mdi-delete-alert-outline</v-icon>
          </v-avatar>
          <h3 class="mb-2" style="font-size: 1.2rem">Hapus Riwayat?</h3>
          <p class="text-body-2 text-grey">
            Anda akan menghapus riwayat peminjaman buku
            <strong>"{{ deleteDialog.transaction?.book?.title }}"</strong>
            oleh <strong>{{ deleteDialog.transaction?.user?.username }}</strong>.
          </p>
          <!-- Peringatan jika status masih DIPINJAM -->
          <v-alert
            v-if="deleteDialog.transaction?.status === 'DIPINJAM'"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-3 text-left"
          >
            <strong>Perhatian:</strong> Buku ini belum dikembalikan. Stok buku akan otomatis
            dikembalikan saat riwayat ini dihapus.
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            id="btn-cancel-delete-transaction"
            variant="outlined"
            :disabled="deleteDialog.loading"
            @click="deleteDialog.show = false"
          >
            Batal
          </v-btn>
          <v-btn
            id="btn-confirm-delete-transaction"
            color="error"
            :loading="deleteDialog.loading"
            @click="confirmDelete"
          >
            Ya, Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Snackbar ───────────────────────────────────────────────────── -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom right"
      :timeout="3000"
      rounded="lg"
    >
      <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "../api/axios.js";

const router = useRouter();

// ─── State
const transactions = ref([]);
const tableLoading = ref(false);
const returningId = ref(null); // ID transaksi yang sedang diproses pengembalian
const search = ref("");
const filterStatus = ref(null);
const currentUser = ref(JSON.parse(localStorage.getItem("perpus_user")));

// ─── Status Filter Options
const statusOptions = ["DIPINJAM", "DIKEMBALIKAN"];

// ─── Headers Tabel
const headers = [
  { title: "No", key: "no", sortable: false, width: "60px" },
  { title: "Peminjam", key: "user", sortable: false },
  { title: "Buku", key: "book", sortable: false },
  { title: "Tgl Pinjam", key: "borrowDate", sortable: true },
  { title: "Tgl Kembali", key: "returnDate", sortable: true },
  { title: "Status", key: "status", sortable: true, align: "center" },
  { title: "Aksi", key: "actions", sortable: false, align: "center", width: "200px" },
];

// ─── Statistik
const countDipinjam = computed(
  () => transactions.value.filter((t) => t.status === "DIPINJAM").length
);
const countDikembalikan = computed(
  () => transactions.value.filter((t) => t.status === "DIKEMBALIKAN").length
);

// ─── Filtered Transactions
const filteredTransactions = computed(() => {
  if (!filterStatus.value) return transactions.value;
  return transactions.value.filter((t) => t.status === filterStatus.value);
});

// ─── Dialog Hapus
const deleteDialog = reactive({
  show: false,
  loading: false,
  transaction: null,
});

// ─── Snackbar
const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
  icon: "mdi-check-circle",
});

function showSnackbar(text, color = "success") {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.icon = color === "success" ? "mdi-check-circle" : "mdi-alert-circle";
  snackbar.show = true;
}

// ─── Format Tanggal
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Fetch Semua Transaksi
async function fetchTransactions() {
  tableLoading.value = true;
  try {
    const { data } = await apiClient.get("/transactions");
    transactions.value = data;
  } catch {
    showSnackbar("Gagal memuat data transaksi.", "error");
  } finally {
    tableLoading.value = false;
  }
}

// ─── Kembalikan Buku (PUT)
async function handleReturn(transaction) {
  returningId.value = transaction.id;
  try {
    await apiClient.put(`/transactions/${transaction.id}/return`);
    showSnackbar(`Buku "${transaction.book?.title}" berhasil dikembalikan!`);
    await fetchTransactions();
  } catch (err) {
    showSnackbar(
      err.response?.data?.message || "Gagal memproses pengembalian.",
      "error"
    );
  } finally {
    returningId.value = null;
  }
}

// ─── Buka Dialog Hapus
function openDeleteDialog(transaction) {
  deleteDialog.transaction = transaction;
  deleteDialog.show = true;
}

// ─── Konfirmasi Hapus Riwayat (DELETE)
async function confirmDelete() {
  deleteDialog.loading = true;
  try {
    await apiClient.delete(`/transactions/${deleteDialog.transaction.id}`);
    showSnackbar("Riwayat transaksi berhasil dihapus.");
    await fetchTransactions();
    deleteDialog.show = false;
  } catch (err) {
    showSnackbar(
      err.response?.data?.message || "Gagal menghapus transaksi.",
      "error"
    );
  } finally {
    deleteDialog.loading = false;
  }
}

// ─── Logout
function handleLogout() {
  localStorage.removeItem("perpus_token");
  localStorage.removeItem("perpus_user");
  localStorage.removeItem("perpus_role");
  router.push({ name: "Login" });
}

// ─── Lifecycle
onMounted(fetchTransactions);
</script>

<style scoped>
.dashboard-bg {
  background: #f0f4f8;
  min-height: 100vh;
}

.app-bar-title {
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: -0.3px;
}

/* ─── Stat Cards ─── */
.stat-card {
  border-radius: 16px !important;
  position: relative;
  overflow: hidden;
  min-height: 110px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.stat-value {
  color: white;
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 1;
}

.stat-icon {
  position: absolute;
  right: 20px;
  bottom: 16px;
  font-size: 52px !important;
  opacity: 0.2;
  color: white;
}

/* ─── Table Card ─── */
.table-card {
  border-radius: 20px !important;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: white;
}

.table-header {
  background: white;
}

.table-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a2e;
}

.transactions-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #475569;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.transactions-table :deep(tr:hover td) {
  background: #f8faff !important;
}

.gap-3 {
  gap: 12px;
}
.gap-1 {
  gap: 4px;
}
</style>
