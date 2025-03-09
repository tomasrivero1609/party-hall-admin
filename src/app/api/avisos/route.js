import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

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

    // Guardar el archivo adjunto (si existe)
    let filePath = null;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      filePath = path.join(process.cwd(), "public/uploads", fileName);
      fs.writeFileSync(filePath, buffer);
    }

    // Enviar el correo electrónico
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Quilmes Eventos",
      text: message,
      attachments: filePath ? [{ filename: file.name, path: filePath }] : [],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}