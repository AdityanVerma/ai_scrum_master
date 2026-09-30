import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

// Optional cap on open database connections. The local `prisma dev` database
// drops connections when several are open at once, so set DATABASE_POOL_MAX=1
// there. Unset, the driver's default pool (10) is used.
const poolMax = Number(process.env.DATABASE_POOL_MAX) || undefined;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  max: poolMax,
});

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    // Safe by default: password hashes are left out of every TeamMember query.
    // Login and change-password ask for the field explicitly with `select`.
    omit: { teamMember: { passwordHash: true } },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
