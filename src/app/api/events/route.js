import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Método GET: Verificar disponibilidad de la fecha
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date"); // Obtener la fecha desde los parámetros de la URL

    if (!date) {
      return Response.json({ error: 'La fecha es obligatoria' }, { status: 400 });
    }

    // Buscar eventos con la misma fecha
    const events = await prisma.event.findMany({
      where: {
        date: new Date(date), // Busca eventos con la misma fecha
      },
    });

    return Response.json(events); // Devuelve una lista de eventos (vacía si no hay coincidencias)
  } catch (error) {
    console.error('Error checking date availability:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Validar datos básicamente
    if (!data.name || !data.date || !data.guests || !data.pricePerPlate || !data.eventTypeId || !data.sellerId) {
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

    // Verificar si la fecha ya está ocupada
    const existingEvent = await prisma.event.findFirst({
      where: {
        date: new Date(data.date),
      },
    });

    if (existingEvent) {
      return Response.json(
        { error: `Fecha ocupada por "${existingEvent.name}"` },
        { status: 400 }
      );
    }

    // Convertir startTime y endTime en objetos Date válidos
    const startDate = new Date(data.date); // Fecha base
    const [startHours, startMinutes] = data.startTime.split(":").map(Number);
    const [endHours, endMinutes] = data.endTime.split(":").map(Number);

    const startTime = new Date(startDate);
    startTime.setHours(startHours, startMinutes, 0, 0);

    const endTime = new Date(startDate);
    endTime.setHours(endHours, endMinutes, 0, 0);

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
        sellerId: parseInt(data.sellerId),
        menu: data.menu || "",
        observations: data.observations || "",
        fileUrls: data.fileUrls || [], // Guarda las URLs de los archivos como un array
        startTime: startTime, // Usar el objeto Date válido
        endTime: endTime,     // Usar el objeto Date válido
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        familyNames: data.familyNames || "",
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