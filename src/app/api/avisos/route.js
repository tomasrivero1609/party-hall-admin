import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail", // O usa otro servicio
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST: Manejar el envío de avisos y la subida de archivos
export async function POST(request) {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const message = formData.get("message");
    const file = formData.get("file"); // Archivo adjunto (recibo)

    // Validar los datos
    if (!email || !message) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    // Procesar el archivo adjunto (si existe)
    let attachment = null;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachment = {
        filename: file.name,
        content: buffer, // El archivo se adjunta directamente desde la memoria
      };
    }

    // Enviar el correo electrónico
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Quilmes Eventos",
      text: message,
      attachments: attachment ? [attachment] : [], // Adjuntar el archivo si existe
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}