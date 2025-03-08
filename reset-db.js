import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    // Desactivar restricciones de clave externa temporalmente
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;

    // Truncar todas las tablas
    await prisma.$executeRaw`TRUNCATE TABLE Event;`;
    await prisma.$executeRaw`TRUNCATE TABLE Payment;`;
    await prisma.$executeRaw`TRUNCATE TABLE EventType;`;

    // Reactivar restricciones de clave externa
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;

    console.log('Base de datos vaciada correctamente.');
  } catch (error) {
    console.error('Error al vaciar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();