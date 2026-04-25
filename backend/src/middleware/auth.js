// src/middleware/auth.js
// Middleware autentikasi & otorisasi JWT.
// - authenticateToken: Memverifikasi token Bearer pada header 'Authorization'.
// - isAdmin: Mengecek apakah pengguna yang sudah login memiliki role 'ADMIN'.

import jwt from "jsonwebtoken";

// ─── Middleware: Verifikasi Token JWT ─────────────────────────────────────────
export function authenticateToken(req, res, next) {
  // Format header: "Authorization: Bearer <token>"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Token tidak ditemukan." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token tidak valid atau sudah kedaluwarsa." });
    }
    // Lampirkan data user (dari payload JWT) ke request
    req.user = user;
    next();
  });
}

// ─── Middleware: Cek Role Admin ───────────────────────────────────────────────
// Harus digunakan SETELAH authenticateToken, karena bergantung pada req.user
export function isAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({
      message: "Akses ditolak. Hanya Admin yang dapat melakukan aksi ini.",
    });
  }
  next();
}
