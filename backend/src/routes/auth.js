// src/routes/auth.js
// Menangani rute autentikasi.
// POST /api/auth/login  Untuk validasi kredensial dan mengembalikan JWT.
// POST /api/auth/register Untuk mendaftarkan user baru.

import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const router = Router();

// POST /api/auth/register
// Endpoint untuk mendaftarkan akun baru
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi." });
  }

  try {
    // Cek apakah username sudah digunakan
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: "Username sudah digunakan." });
    }

    // Hash password sebelum disimpan (saltRounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    res
      .status(201)
      .json({ message: "Registrasi berhasil.", userId: user.id });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// POST /api/auth/login
// Memvalidasi username & password, lalu mengembalikan JWT jika sukses
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi." });
  }

  try {
    // Cari user berdasarkan username
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Username atau password salah." });
    }

    // Bandingkan password yang diberikan dengan hash di database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Username atau password salah." });
    }

    // Generate JWT dengan payload berisi id dan username, berlaku 8 jam
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login berhasil.",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

export default router;
