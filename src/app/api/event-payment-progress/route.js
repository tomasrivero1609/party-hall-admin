import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID de evento requerido" }, { status: 400 });
  }

  const eventId = parseInt(id);

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        payments: true,
      },
    });

    if (!event) {
      return Response.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const totalPaid = event.payments.reduce((sum, p) => sum + p.amount, 0);
    const eventTotal = event.total || 1;

    return Response.json({ totalPaid, eventTotal }, { status: 200 });
  } catch (error) {
    console.error("Error en progreso de pago:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
