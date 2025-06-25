import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const recipients = await prisma.notificationRecipient.findMany();
    return Response.json(recipients);
  } catch (error) {
    return Response.json({ error: 'Error al obtener destinatarios' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.phone) {
      return Response.json({ error: 'Nombre y teléfono son obligatorios' }, { status: 400 });
    }
    if (data.id) {
      // Actualizar existente
      const updated = await prisma.notificationRecipient.update({
        where: { id: parseInt(data.id) },
        data: {
          name: data.name,
          phone: data.phone,
          category: data.category || null,
        },
      });
      return Response.json(updated, { status: 200 });
    } else {
      // Crear nuevo
      const recipient = await prisma.notificationRecipient.create({
        data: {
          name: data.name,
          phone: data.phone,
          category: data.category || null,
        },
      });
      return Response.json(recipient, { status: 201 });
    }
  } catch (error) {
    return Response.json({ error: 'Error al crear/actualizar destinatario' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'ID requerido' }, { status: 400 });
    }
    await prisma.notificationRecipient.delete({ where: { id: parseInt(id) } });
    return Response.json({ message: 'Destinatario eliminado' });
  } catch (error) {
    return Response.json({ error: 'Error al eliminar destinatario' }, { status: 500 });
  }
} 