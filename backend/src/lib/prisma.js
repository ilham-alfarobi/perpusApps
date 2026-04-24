// src/lib/prisma.js
// Singleton instance Prisma Client.
// Mencegah pembuatan koneksi database yang berlebihan saat hot-reload di development.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
