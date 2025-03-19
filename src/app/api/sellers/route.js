import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sellers = await prisma.seller.findMany();
    return Response.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}