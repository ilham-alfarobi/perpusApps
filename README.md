# PerpusApp — Sistem Pendataan Buku Perpustakaan

Aplikasi full-stack untuk manajemen koleksi buku perpustakaan.

Nama: Muhammad Ilham 'Aziiz Alfarobi
NIM : 220101027
Kelas: SI 22A1

## Struktur Proyek

```
perpusApp/
├── backend/     # Express + Prisma + MySQL API
└── frontend/    # Vite + Vue 3 + Vuetify 3 SPA
```

---

## API Endpoints

| Metode |       Endpoint       | Operasi          |
| ------ | :------------------: | ---------------- |
| POST   | `/api/auth/register` | Daftar akun baru |
| POST   |  `/api/auth/login`   | Login dapat JWT  |
| GET    |     `/api/books`     | Ambil semua buku |
| POST   |     `/api/books`     | Tambah buku      |
| PUT    |   `/api/books/:id`   | Update buku      |
| DELETE |   `/api/books/:id`   | Hapus buku       |

## Keamanan

- Password di-hash dengan **bcrypt** (10 salt rounds)
- Autentikasi via **JWT** (kedaluwarsa 8 jam)
- Semua CRUD endpoint dilindungi middleware JWT
- CORS dikonfigurasi hanya untuk origin frontend
