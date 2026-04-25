<!-- src/views/Dashboard.vue -->
<!-- Halaman utama manajemen buku perpustakaan.
     - v-data-table: menampilkan daftar buku dari backend.
     - v-dialog: form tambah / edit buku.
     - Dialog konfirmasi: sebelum menghapus buku.
     - RBAC: Tombol Tambah/Edit/Hapus hanya tampil untuk ADMIN.
     - Tombol Pinjam hanya tampil untuk ANGGOTA.
     - Logout: hapus semua data dari localStorage dan redirect ke Login. -->

<template>
  <v-app>
    <!-- ─── App Bar ─────────────────────────────────────────────────────── -->
    <v-app-bar color="primary" elevation="2" height="64">
      <template #prepend>
        <v-app-bar-nav-icon color="white" />
      </template>

      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon color="white" class="mr-2">mdi-book-open-page-variant</v-icon>
          <span class="app-bar-title">PerpusApp</span>
        </div>
      </v-app-bar-title>

      <template #append>
        <div class="d-flex align-center mr-2">
          <!-- Badge Role -->
          <v-chip
            :color="isAdmin ? 'warning' : 'success'"
            variant="tonal"
            size="small"
            class="mr-3 d-none d-sm-flex"
          >
            <v-icon start size="14">{{ isAdmin ? 'mdi-shield-crown' : 'mdi-account' }}</v-icon>
            {{ isAdmin ? 'Admin' : 'Anggota' }}
          </v-chip>

          <v-avatar color="white" size="34" class="mr-2">
            <v-icon color="primary" size="20">mdi-account</v-icon>
          </v-avatar>
          <span class="text-white text-body-2 d-none d-sm-inline">
            {{ currentUser?.username }}
          </span>
        </div>

        <!-- Tombol Kelola Transaksi (Hanya Admin) -->
        <v-btn
          v-if="isAdmin"
          id="btn-kelola-transaksi"
          prepend-icon="mdi-swap-horizontal"
          color="white"
          variant="tonal"
          class="mr-2 d-none d-sm-flex"
          @click="$router.push({ name: 'KelolaTransaksi' })"
        >
          Transaksi
        </v-btn>

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
      <v-container class="py-8" max-width="1300">
        <!-- Statistik singkat -->
        <v-row class="mb-6" dense>
          <v-col cols="12" sm="4">
            <v-card class="stat-card" color="primary" variant="flat">
              <v-card-text>
                <div class="stat-label">Total Buku</div>
                <div class="stat-value">{{ books.length }}</div>
                <v-icon class="stat-icon">mdi-book-multiple</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card class="stat-card" color="success" variant="flat">
              <v-card-text>
                <div class="stat-label">Total Stok</div>
                <div class="stat-value">{{ totalStock }}</div>
                <v-icon class="stat-icon">mdi-archive-outline</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card class="stat-card" color="accent" variant="flat">
              <v-card-text>
                <div class="stat-label">Penerbit Unik</div>
                <div class="stat-value">{{ uniquePublishers }}</div>
                <v-icon class="stat-icon">mdi-office-building-outline</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tabel Buku -->
        <v-card class="table-card" elevation="0">
          <v-card-title class="table-header pa-6">
            <div class="d-flex align-center justify-space-between flex-wrap gap-3">
              <div>
                <h2 class="table-title">Daftar Buku</h2>
                <p class="text-body-2 text-grey mt-1">
                  Kelola seluruh koleksi buku perpustakaan
                </p>
              </div>
              <div class="d-flex align-center gap-3">
                <!-- Search -->
                <v-text-field
                  id="input-search"
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="Cari buku..."
                  hide-details
                  density="compact"
                  style="min-width: 220px"
                  clearable
                />
                <!-- Tombol Tambah — Hanya tampil untuk ADMIN -->
                <v-btn
                  v-if="isAdmin"
                  id="btn-add-book"
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="openAddDialog"
                >
                  Tambah Buku
                </v-btn>
              </div>
            </div>
          </v-card-title>

          <v-divider />

          <!-- Data Table -->
          <v-data-table
            id="table-books"
            :headers="tableHeaders"
            :items="books"
            :search="search"
            :loading="tableLoading"
            loading-text="Memuat data buku..."
            no-data-text="Belum ada data buku."
            items-per-page="10"
            class="books-table"
          >
            <!-- Kolom nomor urut -->
            <template #item.no="{ index }">
              <span class="text-body-2 text-grey">{{ index + 1 }}</span>
            </template>

            <!-- Kolom judul dengan styling bold -->
            <template #item.title="{ item }">
              <div class="d-flex align-center">
                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="36"
                  class="mr-3"
                >
                  <v-icon size="18">mdi-book-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-semibold">{{ item.title }}</div>
                  <div class="text-caption text-grey">{{ item.author }}</div>
                </div>
              </div>
            </template>

            <!-- Kolom stok dengan chip warna -->
            <template #item.stock="{ item }">
              <v-chip
                :color="item.stock > 5 ? 'success' : item.stock > 0 ? 'warning' : 'error'"
                variant="tonal"
                size="small"
              >
                {{ item.stock }} buku
              </v-chip>
            </template>

            <!-- Kolom tanggal di-format -->
            <template #item.createdAt="{ item }">
              <span class="text-body-2 text-grey">
                {{ formatDate(item.createdAt) }}
              </span>
            </template>

            <!-- Kolom aksi Admin: tombol edit & hapus -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <template v-if="isAdmin">
                  <v-btn
                    :id="`btn-edit-${item.id}`"
                    icon
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="openEditDialog(item)"
                  >
                    <v-icon size="16">mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                  </v-btn>
                  <v-btn
                    :id="`btn-delete-${item.id}`"
                    icon
                    size="small"
                    variant="tonal"
                    color="error"
                    @click="openDeleteDialog(item)"
                  >
                    <v-icon size="16">mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">Hapus</v-tooltip>
                  </v-btn>
                </template>
                <span v-else class="text-grey text-caption">—</span>
              </div>
            </template>

            <!-- Kolom Aksi Peminjaman: tombol Pinjam (hanya ANGGOTA) -->
            <template #item.borrow="{ item }">
              <v-btn
                v-if="!isAdmin"
                :id="`btn-borrow-${item.id}`"
                color="teal"
                variant="tonal"
                size="small"
                prepend-icon="mdi-book-arrow-right"
                :disabled="item.stock <= 0"
                :loading="borrowingId === item.id"
                @click="handleBorrow(item)"
              >
                Pinjam
              </v-btn>
              <span v-else class="text-grey text-caption">—</span>
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </v-main>

    <!-- ─── Dialog Tambah / Edit Buku ─────────────────────────────────── -->
    <v-dialog
      id="dialog-book-form"
      v-model="bookDialog.show"
      max-width="560"
      persistent
    >
      <v-card>
        <v-card-title class="dialog-header pa-6 pb-4">
          <div class="d-flex align-center">
            <v-avatar
              :color="bookDialog.isEdit ? 'primary' : 'success'"
              size="42"
              class="mr-3"
            >
              <v-icon color="white" size="22">
                {{ bookDialog.isEdit ? "mdi-pencil" : "mdi-plus" }}
              </v-icon>
            </v-avatar>
            <div>
              <h3 class="dialog-title">
                {{ bookDialog.isEdit ? "Edit Buku" : "Tambah Buku Baru" }}
              </h3>
              <p class="text-body-2 text-grey">
                {{ bookDialog.isEdit ? "Perbarui informasi buku" : "Masukkan data buku baru" }}
              </p>
            </div>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-form ref="bookFormRef" @submit.prevent="submitBook">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  id="input-book-title"
                  v-model="bookForm.title"
                  label="Judul Buku"
                  prepend-inner-icon="mdi-book-outline"
                  :rules="[rules.required]"
                  :disabled="bookDialog.loading"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  id="input-book-author"
                  v-model="bookForm.author"
                  label="Pengarang"
                  prepend-inner-icon="mdi-account-edit-outline"
                  :rules="[rules.required]"
                  :disabled="bookDialog.loading"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  id="input-book-publisher"
                  v-model="bookForm.publisher"
                  label="Penerbit"
                  prepend-inner-icon="mdi-domain"
                  :rules="[rules.required]"
                  :disabled="bookDialog.loading"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  id="input-book-stock"
                  v-model="bookForm.stock"
                  label="Jumlah Stok"
                  prepend-inner-icon="mdi-counter"
                  type="number"
                  min="0"
                  :rules="[rules.required, rules.nonNegative]"
                  :disabled="bookDialog.loading"
                />
              </v-col>
            </v-row>

            <!-- Alert error dialog -->
            <v-alert
              v-if="bookDialog.error"
              type="error"
              variant="tonal"
              density="compact"
              class="mt-2"
            >
              {{ bookDialog.error }}
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            id="btn-cancel-book"
            variant="outlined"
            :disabled="bookDialog.loading"
            @click="closeBookDialog"
          >
            Batal
          </v-btn>
          <v-btn
            id="btn-submit-book"
            :color="bookDialog.isEdit ? 'primary' : 'success'"
            :loading="bookDialog.loading"
            @click="submitBook"
          >
            {{ bookDialog.isEdit ? "Simpan Perubahan" : "Tambah Buku" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Dialog Konfirmasi Hapus ────────────────────────────────────── -->
    <v-dialog
      id="dialog-confirm-delete"
      v-model="deleteDialog.show"
      max-width="420"
    >
      <v-card>
        <v-card-text class="pa-6 text-center">
          <v-avatar color="error" variant="tonal" size="64" class="mb-4">
            <v-icon color="error" size="32">mdi-delete-alert-outline</v-icon>
          </v-avatar>
          <h3 class="mb-2" style="font-size: 1.2rem">Hapus Buku?</h3>
          <p class="text-body-2 text-grey">
            Anda akan menghapus buku
            <strong>"{{ deleteDialog.book?.title }}"</strong>. Tindakan ini
            tidak dapat dibatalkan.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            id="btn-cancel-delete"
            variant="outlined"
            :disabled="deleteDialog.loading"
            @click="deleteDialog.show = false"
          >
            Batal
          </v-btn>
          <v-btn
            id="btn-confirm-delete"
            color="error"
            :loading="deleteDialog.loading"
            @click="confirmDelete"
          >
            Ya, Hapus
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Snackbar notifikasi ────────────────────────────────────────── -->
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

// ─── State Utama
const books = ref([]);
const search = ref("");
const tableLoading = ref(false);
const currentUser = ref(JSON.parse(localStorage.getItem("perpus_user")));
const userRole = ref(localStorage.getItem("perpus_role") || "ANGGOTA");
const borrowingId = ref(null); // ID buku yang sedang dalam proses peminjaman

// ─── RBAC Helper
const isAdmin = computed(() => userRole.value === "ADMIN");

// ─── Header Tabel (dinamis berdasarkan role)
const tableHeaders = computed(() => {
  const base = [
    { title: "No", key: "no", sortable: false, width: "60px" },
    { title: "Judul Buku", key: "title", sortable: true },
    { title: "Penerbit", key: "publisher", sortable: true },
    { title: "Stok", key: "stock", sortable: true, align: "center" },
    { title: "Ditambahkan", key: "createdAt", sortable: true },
    { title: "Aksi Admin", key: "actions", sortable: false, align: "center", width: "120px" },
    { title: "Peminjaman", key: "borrow", sortable: false, align: "center", width: "130px" },
  ];
  return base;
});

// ─── Statistik
const totalStock = computed(() =>
  books.value.reduce((sum, b) => sum + (b.stock || 0), 0)
);
const uniquePublishers = computed(
  () => new Set(books.value.map((b) => b.publisher)).size
);

// ─── Dialog Tambah/Edit
const bookFormRef = ref(null);

const bookDialog = reactive({
  show: false,
  isEdit: false,
  loading: false,
  error: "",
  editId: null,
});

const bookForm = reactive({
  title: "",
  author: "",
  publisher: "",
  stock: 0,
});

// ─── Dialog Hapus
const deleteDialog = reactive({
  show: false,
  loading: false,
  book: null,
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
  snackbar.icon =
    color === "success" ? "mdi-check-circle" : "mdi-alert-circle";
  snackbar.show = true;
}

// ─── Validasi
const rules = {
  required: (v) => (v !== "" && v !== null && v !== undefined) || "Wajib diisi.",
  nonNegative: (v) => parseInt(v) >= 0 || "Stok tidak boleh negatif.",
};

// ─── Helpers
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function resetBookForm() {
  bookForm.title = "";
  bookForm.author = "";
  bookForm.publisher = "";
  bookForm.stock = 0;
  bookFormRef.value?.resetValidation();
}

// ─── CRUD: Fetch Data
async function fetchBooks() {
  tableLoading.value = true;
  try {
    const { data } = await apiClient.get("/books");
    books.value = data;
  } catch {
    showSnackbar("Gagal memuat data buku.", "error");
  } finally {
    tableLoading.value = false;
  }
}

// ─── Dialog: Tambah
function openAddDialog() {
  bookDialog.isEdit = false;
  bookDialog.editId = null;
  bookDialog.error = "";
  resetBookForm();
  bookDialog.show = true;
}

// ─── Dialog: Edit
function openEditDialog(item) {
  bookDialog.isEdit = true;
  bookDialog.editId = item.id;
  bookDialog.error = "";
  bookForm.title = item.title;
  bookForm.author = item.author;
  bookForm.publisher = item.publisher;
  bookForm.stock = item.stock;
  bookDialog.show = true;
}

function closeBookDialog() {
  bookDialog.show = false;
  resetBookForm();
}

// ─── Submit: Tambah / Edit
async function submitBook() {
  const { valid } = await bookFormRef.value.validate();
  if (!valid) return;

  bookDialog.loading = true;
  bookDialog.error = "";

  try {
    if (bookDialog.isEdit) {
      await apiClient.put(`/books/${bookDialog.editId}`, { ...bookForm });
      showSnackbar("Buku berhasil diperbarui!");
    } else {
      await apiClient.post("/books", { ...bookForm });
      showSnackbar("Buku berhasil ditambahkan!");
    }
    await fetchBooks();
    closeBookDialog();
  } catch (err) {
    bookDialog.error =
      err.response?.data?.message || "Terjadi kesalahan. Coba lagi.";
  } finally {
    bookDialog.loading = false;
  }
}

// ─── Dialog: Hapus
function openDeleteDialog(item) {
  deleteDialog.book = item;
  deleteDialog.show = true;
}

async function confirmDelete() {
  deleteDialog.loading = true;
  try {
    await apiClient.delete(`/books/${deleteDialog.book.id}`);
    showSnackbar("Buku berhasil dihapus!");
    await fetchBooks();
    deleteDialog.show = false;
  } catch {
    showSnackbar("Gagal menghapus buku.", "error");
  } finally {
    deleteDialog.loading = false;
  }
}

// ─── Peminjaman Buku (Hanya Anggota)
async function handleBorrow(book) {
  borrowingId.value = book.id;
  try {
    await apiClient.post("/transactions", { bookId: book.id });
    showSnackbar(`Buku "${book.title}" berhasil dipinjam!`);
    await fetchBooks(); // refresh stok
  } catch (err) {
    showSnackbar(
      err.response?.data?.message || "Gagal memproses peminjaman.",
      "error"
    );
  } finally {
    borrowingId.value = null;
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
onMounted(fetchBooks);
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

.books-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #475569;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.books-table :deep(tr:hover td) {
  background: #f8faff !important;
}

/* ─── Dialog ─── */
.dialog-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a2e;
}

.gap-3 {
  gap: 12px;
}
.gap-1 {
  gap: 4px;
}
</style>
