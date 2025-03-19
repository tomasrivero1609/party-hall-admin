import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Método GET: Obtener todos los eventos
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        eventType: true,
        seller: true, // Incluye el vendedor
      },
    });

    // Formatear las fechas como YYYY-MM-DD
    const formattedEvents = events.map((event) => ({
      ...event,
      date: event.date.toISOString().split("T")[0], // Extrae solo la parte de la fecha (YYYY-MM-DD)
    }));

    return Response.json(formattedEvents); // Devuelve la lista de eventos
  } catch (error) {
    console.error("Error fetching events:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}