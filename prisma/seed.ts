import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Tipos de evento
  const [cumpleaños, boda] = await Promise.all([
    prisma.eventType.create({ data: { name: 'Cumpleaños', color: '#FFA07A' } }),
    prisma.eventType.create({ data: { name: 'Boda', color: '#FFD700' } }),
  ]);

  // Evento de prueba
  await prisma.event.create({
    data: {
      name: 'Evento de prueba',
      date: new Date('2025-12-31T20:00:00'),
      guests: 50,
      pricePerPlate: 25.5,
      total: 50 * 25.5,
      remainingBalance: 50 * 25.5,
      remainingPlates: 50,
      eventTypeId: cumpleaños.id,
    },
  });
}

main()
  .then(() => console.log('Datos de prueba creados'))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());