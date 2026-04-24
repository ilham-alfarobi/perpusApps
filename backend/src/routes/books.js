// src/routes/books.js
// Menangani rute CRUD untuk data buku.
// Semua rute dilindungi oleh middleware authenticateToken.
// GET    /api/books       Untuk mengambil semua data buku
// POST   /api/books       Untuk menambah buku baru
// PUT    /api/books/:id   Untuk update data buku berdasarkan ID
// DELETE /api/books/:id   Untuk menghapus buku berdasarkan ID

import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = Router();

// Terapkan middleware autentikasi ke semua rute di file ini
router.use(authenticateToken);

// GET /api/books — Mengambil seluruh daftar buku, diurutkan terbaru
router.get("/", async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(books);
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ message: "Gagal mengambil data buku." });
  }
});

// POST /api/books — Menambahkan buku baru ke database
router.post("/", async (req, res) => {
  const { title, author, publisher, stock } = req.body;

  if (!title || !author || !publisher) {
    return res
      .status(400)
      .json({ message: "Judul, pengarang, dan penerbit wajib diisi." });
  }

  try {
    const book = await prisma.book.create({
      data: {
        title,
        author,
        publisher,
        stock: parseInt(stock) || 0,
      },
    });
    res.status(201).json(book);
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({ message: "Gagal menambahkan buku." });
  }
});

// PUT /api/books/:id — Mengupdate data buku berdasarkan ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, publisher, stock } = req.body;

  try {
    const book = await prisma.book.update({
      where: { id: parseInt(id) },
      data: {
        title,
        author,
        publisher,
        stock: parseInt(stock) || 0,
      },
    });
    res.json(book);
  } catch (error) {
    // Prisma error P2025 = record tidak ditemukan
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Buku tidak ditemukan." });
    }
    console.error("Update book error:", error);
    res.status(500).json({ message: "Gagal mengupdate buku." });
  }
});

// DELETE /api/books/:id — Menghapus buku berdasarkan ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.book.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Buku berhasil dihapus." });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Buku tidak ditemukan." });
    }
    console.error("Delete book error:", error);
    res.status(500).json({ message: "Gagal menghapus buku." });
  }
});

export default router;
