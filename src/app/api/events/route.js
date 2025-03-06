import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Método GET: Obtener todos los eventos
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: { eventType: true, payments: true },
    });

    // Convierte las fechas a formato ISO
    const formattedEvents = events.map((event) => ({
      ...event,
      date: event.date.toISOString(), // Convierte la fecha a ISO
    }));

    return Response.json(formattedEvents);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Error fetching events' }, { status: 500 });
  }
}

// Método POST: Crear un nuevo evento
export async function POST(request) {
  try {
    const data = await request.json();

    // Validar datos básicamente
    if (!data.name || !data.date || !data.guests || !data.pricePerPlate) {
      return Response.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const guests = parseInt(data.guests);
    const pricePerPlate = parseFloat(data.pricePerPlate);

    // Validar que los valores sean números válidos
    if (isNaN(guests) || guests <= 0) {
      return Response.json({ error: 'El número de invitados debe ser un número positivo' }, { status: 400 });
    }
    if (isNaN(pricePerPlate) || pricePerPlate <= 0) {
      return Response.json({ error: 'El precio por plato debe ser un número positivo' }, { status: 400 });
    }

    // Crear el evento en la base de datos
    const event = await prisma.event.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        guests,
        pricePerPlate,
        total: guests * pricePerPlate,
        remainingBalance: guests * pricePerPlate,
        remainingPlates: guests,
        eventTypeId: parseInt(data.eventTypeId),
      },
    });

    return Response.json(event, { status: 201 });
  } catch (error) {
    console.error('Error al crear el evento:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Método DELETE: Eliminar un evento existente
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json({ error: 'ID del evento no proporcionado' }, { status: 400 });
    }

    // Eliminar el evento en la base de datos
    await prisma.event.delete({
      where: { id: parseInt(id) },
    });

    return Response.json({ message: 'Evento eliminado exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar el evento:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Método PUT: Actualizar un evento existente
export async function PUT(request) {
  try {
    const data = await request.json();

    // Validar datos básicamente
    if (!data.id || !data.name || !data.date || !data.guests || !data.pricePerPlate) {
      return Response.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const guests = parseInt(data.guests);
    const pricePerPlate = parseFloat(data.pricePerPlate);

    // Validar que los valores sean números válidos
    if (isNaN(guests) || guests <= 0) {
      return Response.json({ error: 'El número de invitados debe ser un número positivo' }, { status: 400 });
    }
    if (isNaN(pricePerPlate) || pricePerPlate <= 0) {
      return Response.json({ error: 'El precio por plato debe ser un número positivo' }, { status: 400 });
    }

    // Actualizar el evento en la base de datos
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(data.id) },
      data: {
        name: data.name,
        date: new Date(data.date),
        guests,
        pricePerPlate,
        total: guests * pricePerPlate,
        remainingBalance: guests * pricePerPlate,
        remainingPlates: guests,
        eventTypeId: parseInt(data.eventTypeId),
      },
    });

    return Response.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el evento:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}