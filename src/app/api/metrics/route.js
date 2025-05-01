import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalEvents = await prisma.event.count();

    // Eventos agrupados por moneda
    const eventsByCurrency = await prisma.event.groupBy({
      by: ["currency"],
      _sum: {
        remainingBalance: true,
        guests: true,
      },
      _count: {
        id: true,
      },
    });

    // Pagos agrupados por moneda (usando la relación a Event)
    const payments = await prisma.payment.findMany({
      include: {
        event: {
          select: { currency: true },
        },
      },
    });

    const totalPaymentsByCurrency = payments.reduce((acc, payment) => {
      const currency = payment.event?.currency || "ARS";
      acc[currency] = (acc[currency] || 0) + payment.amount;
      return acc;
    }, {});

    // Preparar objeto de métricas por moneda
    const metricsByCurrency = {};
    for (const item of eventsByCurrency) {
      const currency = item.currency || "ARS";
      metricsByCurrency[currency] = {
        totalEvents: item._count.id,
        totalGuests: item._sum.guests || 0,
        totalPendingBalance: item._sum.remainingBalance || 0,
        totalPayments: totalPaymentsByCurrency[currency] || 0,
      };
    }

    // Total global de invitados
    const totalGuests = await prisma.event.aggregate({
      _sum: { guests: true },
    });

    return Response.json({
      totalEvents,
      totalGuests: totalGuests._sum.guests || 0,
      metricsByCurrency,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
