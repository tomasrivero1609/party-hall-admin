import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const eventTypes = await prisma.eventType.findMany();
    return Response.json(eventTypes);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Error fetching event types' }, { status: 500 });
  }
}