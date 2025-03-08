// src/app/api/payments/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Método GET: Obtener pagos
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId"); // Obtener el ID del evento como parámetro

  try {
    let payments;

    if (eventId) {
      // Si se proporciona un ID de evento, filtrar los pagos por ese evento
      payments = await prisma.payment.findMany({
        where: { eventId: parseInt(eventId) },
        include: {
          event: true, // Incluye el evento relacionado
        },
      });
    } else {
      // Si no se proporciona un ID, obtener todos los pagos
      payments = await prisma.payment.findMany({
        include: {
          event: true, // Incluye el evento relacionado
        },
      });
    }

    return Response.json(payments); // Devuelve la lista de pagos
  } catch (error) {
    console.error("Error fetching payments:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    console.log("Datos recibidos:", data); // Depuración

    // Validar datos básicamente
    if (!data.eventId || !data.amount || !data.payerName || !data.date) {
      return Response.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const amount = parseFloat(data.amount);

    // Validar que el monto sea un número positivo
    if (isNaN(amount) || amount <= 0) {
      return Response.json({ error: 'El monto debe ser un número positivo' }, { status: 400 });
    }

    // Buscar el evento correspondiente
    const event = await prisma.event.findUnique({
      where: { id: parseInt(data.eventId) },
    });

    console.log("Evento encontrado:", event); // Depuración

    if (!event) {
      return Response.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Validar que el monto no exceda el saldo restante
    if (amount > event.remainingBalance) {
      return Response.json({ error: 'El monto excede el saldo restante' }, { status: 400 });
    }

    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        amount,
        payerName: data.payerName, // Asegúrate de incluir el campo payerName
        date: data.date, // Fecha como texto
        eventId: parseInt(data.eventId),
      },
    });

    console.log("Pago creado:", payment); // Depuración

    // Actualizar el saldo restante del evento
    await prisma.event.update({
      where: { id: parseInt(data.eventId) },
      data: {
        remainingBalance: event.remainingBalance - amount,
      },
    });

    console.log("Saldo actualizado"); // Depuración

    return Response.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error al crear el pago:', error.message); // Muestra el mensaje de error específico
    return Response.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
  }
}