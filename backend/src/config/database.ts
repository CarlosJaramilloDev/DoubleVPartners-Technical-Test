import { PrismaClient } from '@prisma/client';

// Singleton pattern para evitar múltiples instancias
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Manejar desconexión al cerrar la aplicación
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

