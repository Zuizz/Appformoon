import { PrismaClient } from '@prisma/client';

/**
 * Singleton instance of PrismaClient.
 * Caches on globalThis in development mode to prevent multiple client instances
 * during hot module replacement.
 */
const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
