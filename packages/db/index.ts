import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Next.js w trybie dev przeładowuje moduły przy każdej zmianie kodu (hot reload).
// Bez cache w globalThis powstawałby nowy PrismaClient (i nowe połączenie do bazy)
// przy każdym przeładowaniu, aż baza odrzuciłaby połączenia ("too many clients").
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";
