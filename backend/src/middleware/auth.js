// src/middleware/auth.js
// Middleware autentikasi JWT.
// Memverifikasi token Bearer pada header 'Authorization' sebelum request
// diteruskan ke route handler yang dilindungi.

import jwt from "jsonwebtoken";

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
