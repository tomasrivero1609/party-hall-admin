import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Método GET: Obtener métricas
export async function GET() {
  try {
    // Total de eventos
    const totalEvents = await prisma.event.count();

    // Saldo total pendiente
    const totalPendingBalance = await prisma.event.aggregate({
      _sum: {
        remainingBalance: true,
      },
    });

    // Número total de invitados
    const totalGuests = await prisma.event.aggregate({
      _sum: {
        guests: true,
      },
    });

    // Eventos por tipo (primera consulta: agrupar por eventTypeId)
    const eventsByTypeRaw = await prisma.event.groupBy({
      by: ["eventTypeId"],
      _count: {
        id: true,
      },
    });

    // Obtener los nombres de los tipos de eventos (segunda consulta)
    const eventTypeIds = eventsByTypeRaw.map((item) => item.eventTypeId);
    const eventTypes = await prisma.eventType.findMany({
      where: {
        id: {
          in: eventTypeIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Combinar los resultados de ambas consultas
    const eventsByType = eventsByTypeRaw.map((item) => {
      const eventType = eventTypes.find((type) => type.id === item.eventTypeId);
      return {
        type: eventType?.name || "Sin tipo",
        count: item._count.id,
      };
    });

    // Pagos totales realizados
    const totalPayments = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
    });

    return Response.json({
      totalEvents,
      totalPendingBalance: totalPendingBalance._sum.remainingBalance || 0,
      totalGuests: totalGuests._sum.guests || 0,
      eventsByType,
      totalPayments: totalPayments._sum.amount || 0,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}