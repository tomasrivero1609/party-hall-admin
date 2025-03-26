// src/app/api/abm-events/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Método GET: Obtener todos los eventos o filtrar por fecha si se proporciona
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date"); // Obtener la fecha desde los parámetros de la URL

    let events;

    if (date) {
      // Si se proporciona una fecha, filtrar eventos por esa fecha
      events = await prisma.event.findMany({
        where: {
          date: new Date(date), // Busca eventos con la misma fecha
        },
      });
    } else {
      // Si no se proporciona una fecha, devolver todos los eventos
      events = await prisma.event.findMany();
    }

    return Response.json(events); // Devuelve una lista de eventos
  } catch (error) {
    console.error('Error fetching events:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Método POST: Crear un nuevo evento
export async function POST(request) {
  try {
    const data = await request.json();

    // Validar datos básicamente
    if (!data.name || !data.date || !data.guests || !data.pricePerPlate || !data.eventTypeId) {
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
        date: new Date(data.date), // Busca eventos con la misma fecha
      },
    });

    if (existingEvent) {
      return Response.json(
        { error: `Fecha ocupada por "${existingEvent.name}"` },
        { status: 400 }
      );
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
  
      // Primero, eliminar los pagos relacionados con el evento
      await prisma.payment.deleteMany({
        where: { eventId: parseInt(id) },
      });
  
      // Luego, eliminar el evento en la base de datos
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

    // Validar campos obligatorios
    if (!data.id || !data.guests || !data.pricePerPlate) {
      return Response.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const guests = parseInt(data.guests);
    const pricePerPlate = parseFloat(data.pricePerPlate);

    // Validar que los valores sean números válidos
    if (isNaN(guests) || guests <= 0) {
      return Response.json({ error: "El número de invitados debe ser un número positivo" }, { status: 400 });
    }
    if (isNaN(pricePerPlate) || pricePerPlate <= 0) {
      return Response.json({ error: "El precio por plato debe ser un número positivo" }, { status: 400 });
    }

    // Actualizar el evento en la base de datos
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(data.id) },
      data: {
        guests,
        pricePerPlate,
        total: guests * pricePerPlate, // Recalcular el total
        remainingBalance: guests * pricePerPlate, // Ajustar saldo restante
        remainingPlates: guests, // Ajustar platos restantes
        observations: data.observations || null, // Actualizar observaciones
        menu: data.menu || null, // Actualizar menú
      },
    });

    return Response.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el evento:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}