// src/routes/transactions.js
// Menangani rute Transaksi Peminjaman Buku.
// POST   /api/transactions          → Pinjam buku (semua user login)
// GET    /api/transactions          → Ambil semua transaksi (semua user login)
// PUT    /api/transactions/:id/return → Kembalikan buku (Hanya Admin)
// DELETE /api/transactions/:id      → Hapus riwayat transaksi (Hanya Admin)

import { Router } from "express";
import { authenticateToken, isAdmin } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = Router();

// Terapkan middleware autentikasi ke semua rute
router.use(authenticateToken);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transactions — Meminjam Buku
// Mengecek stok, lalu buat transaksi dan kurangi stok dalam satu Prisma Transaction
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

  if (!bookId) {
    return res.status(400).json({ message: "bookId wajib disertakan." });
  }

  try {
    // Gunakan Prisma Interactive Transaction untuk atomisitas
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data buku dan kunci untuk dicek stoknya
      const book = await tx.book.findUnique({
        where: { id: parseInt(bookId) },
      });

      if (!book) {
        throw new Error("Buku tidak ditemukan.");
      }

      if (book.stock <= 0) {
        throw new Error("Stok buku habis. Tidak dapat meminjam.");
      }

      // 2. Buat record transaksi baru
      const transaction = await tx.transaction.create({
        data: {
          userId,
          bookId: parseInt(bookId),
          status: "DIPINJAM",
        },
      });

      // 3. Kurangi stok buku sebanyak 1
      await tx.book.update({
        where: { id: parseInt(bookId) },
        data: { stock: { decrement: 1 } },
      });

      return transaction;
    });

    res.status(201).json({
      message: "Buku berhasil dipinjam!",
      transaction: result,
    });
  } catch (error) {
    // Lemparkan pesan error yang sudah kita definisikan sebagai 400
    if (
      error.message === "Buku tidak ditemukan." ||
      error.message === "Stok buku habis. Tidak dapat meminjam."
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Borrow book error:", error);
    res.status(500).json({ message: "Gagal memproses peminjaman." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transactions — Mengambil semua riwayat transaksi
// Include relasi User (username) dan Book (title)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { borrowDate: "desc" },
      include: {
        user: { select: { id: true, username: true } },
        book: { select: { id: true, title: true, author: true } },
      },
    });
    res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Gagal mengambil data transaksi." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/transactions/:id/return — Kembalikan Buku (Hanya Admin)
// Update status → 'DIKEMBALIKAN', isi returnDate, tambah stok buku
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id/return", isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil transaksi yang dimaksud
      const transaction = await tx.transaction.findUnique({
        where: { id: parseInt(id) },
      });

      if (!transaction) {
        throw new Error("Transaksi tidak ditemukan.");
      }

      if (transaction.status === "DIKEMBALIKAN") {
        throw new Error("Buku ini sudah dikembalikan sebelumnya.");
      }

      // 2. Update status transaksi
      const updated = await tx.transaction.update({
        where: { id: parseInt(id) },
        data: {
          status: "DIKEMBALIKAN",
          returnDate: new Date(),
        },
      });

      // 3. Tambah kembali stok buku
      await tx.book.update({
        where: { id: transaction.bookId },
        data: { stock: { increment: 1 } },
      });

      return updated;
    });

    res.json({
      message: "Buku berhasil dikembalikan!",
      transaction: result,
    });
  } catch (error) {
    if (
      error.message === "Transaksi tidak ditemukan." ||
      error.message === "Buku ini sudah dikembalikan sebelumnya."
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Return book error:", error);
    res.status(500).json({ message: "Gagal memproses pengembalian." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/transactions/:id — Hapus Riwayat Transaksi (Hanya Admin)
// SAFE DELETE: Jika status masih 'DIPINJAM', kembalikan dulu stok buku.
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Ambil transaksi yang akan dihapus
      const transaction = await tx.transaction.findUnique({
        where: { id: parseInt(id) },
      });

      if (!transaction) {
        throw new Error("Transaksi tidak ditemukan.");
      }

      // 2. SAFE DELETE: Jika buku belum dikembalikan, kembalikan stok dulu
      if (transaction.status === "DIPINJAM") {
        await tx.book.update({
          where: { id: transaction.bookId },
          data: { stock: { increment: 1 } },
        });
      }

      // 3. Hapus data transaksi
      await tx.transaction.delete({
        where: { id: parseInt(id) },
      });
    });

    res.json({ message: "Riwayat transaksi berhasil dihapus." });
  } catch (error) {
    if (error.message === "Transaksi tidak ditemukan.") {
      return res.status(404).json({ message: error.message });
    }
    console.error("Delete transaction error:", error);
    res.status(500).json({ message: "Gagal menghapus transaksi." });
  }
});

export default router;
