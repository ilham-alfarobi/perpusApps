// server.js
// Entry point untuk aplikasi backend Express.
// Mengatur middleware global, menghubungkan semua rute, dan memulai server.

import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.js";
import bookRoutes from "./src/routes/books.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware Global 

// Mengizinkan request dari origin berbeda (frontend dev server)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    credentials: true,
  })
);

// Parsing body request sebagai JSON
app.use(express.json());

// ─── Route Utama

// Health check — untuk memverifikasi server berjalan
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Perpus API berjalan dengan baik 📚",
    version: "1.0.0",
  });
});

// Mount rute autentikasi (login, register)
app.use("/api/auth", authRoutes);

// Mount rute CRUD buku (dilindungi JWT di dalam router)
app.use("/api/books", bookRoutes);

// ─── Error Handler Global 
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Terjadi kesalahan internal server." });
});

// ─── Start Server 
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📚 Perpus API siap melayani request!`);
});
