"use client"; // Asegúrate de que el archivo esté marcado como un componente del lado del cliente

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { 
  EnvelopeIcon, 
  PaperClipIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserIcon
} from "@heroicons/react/24/outline";

const AvisosPageContent = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [eventInfo, setEventInfo] = useState(null);

  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  const emailFromParams = searchParams.get("email");

  // Cargar información del evento
  useEffect(() => {
    const fetchEventInfo = async () => {
      if (eventId) {
        try {
          const response = await fetch(`/api/event-list`);
          if (response.ok) {
            const events = await response.json();
            const event = events.find(e => e.id === parseInt(eventId));
            setEventInfo(event);
          }
        } catch (error) {
          console.error("Error fetching event info:", error);
        }
      }
    };

    fetchEventInfo();
  }, [eventId]);

  // Prellenar el correo electrónico si está presente en los parámetros
  useEffect(() => {
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [emailFromParams]);

  // Plantillas de mensaje predefinidas
  const messageTemplates = [
    {
      title: "Recordatorio de Pago",
      content: `Estimado/a cliente,

Esperamos que se encuentre bien. Le escribimos para recordarle sobre el pago pendiente de su evento.

Detalles del evento:
- Nombre: ${eventInfo?.name || '[Nombre del evento]'}
- Fecha: ${eventInfo?.date || '[Fecha del evento]'}
- Saldo pendiente: ${eventInfo?.remainingBalance || '[Monto]'}

Agradecemos su pronta atención a este asunto.

Saludos cordiales,
Equipo de Gestión de Eventos`
    },
    {
      title: "Confirmación de Evento",
      content: `Estimado/a cliente,

Nos complace confirmar los detalles de su próximo evento:

- Evento: ${eventInfo?.name || '[Nombre del evento]'}
- Fecha: ${eventInfo?.date || '[Fecha del evento]'}
- Invitados: ${eventInfo?.guests || '[Número de invitados]'}
- Ubicación: ${eventInfo?.address || '[Dirección]'}

Si tiene alguna pregunta, no dude en contactarnos.

Saludos cordiales,
Equipo de Gestión de Eventos`
    },
    {
      title: "Mensaje Personalizado",
      content: ""
    }
  ];

  const handleTemplateSelect = (template) => {
    setMessage(template.content);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("message", message);
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/avisos", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Aviso enviado con éxito.");
        setMessage("");
        setFile(null);
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(data.error || "Ocurrió un error al enviar el aviso.");
      }
    } catch (error) {
      setErrorMessage("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMessage("El archivo no puede ser mayor a 10MB");
        return;
      }
      setFile(selectedFile);
      setErrorMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Comunicación con Cliente
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
            Enviar{" "}
            <span className="text-gradient">Aviso</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Comunícate de manera profesional con tus clientes mediante avisos personalizados.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Información del Evento */}
          {eventInfo && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Información del Evento
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Nombre:</span>
                    <p className="text-gray-600 mt-1">{eventInfo.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fecha:</span>
                    <p className="text-gray-600 mt-1">{eventInfo.date}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Invitados:</span>
                    <p className="text-gray-600 mt-1">{eventInfo.guests}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Saldo Pendiente:</span>
                    <p className="text-gray-600 mt-1 font-semibold">${eventInfo.remainingBalance?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Plantillas de Mensaje */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plantillas</h3>
                <div className="space-y-2">
                  {messageTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    >
                      <span className="text-sm font-medium text-gray-700">{template.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Formulario Principal */}
          <div className={`${eventInfo ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Alerts */}
              {successMessage && (
                <div className="p-4 bg-green-50 border-l-4 border-green-400 animate-slide-up">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                    <p className="text-green-800 font-medium">{successMessage}</p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 animate-slide-up">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
                    <p className="text-red-800 font-medium">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-2" />
                    Correo Electrónico del Cliente
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input w-full"
                    placeholder="cliente@ejemplo.com"
                    required
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <DocumentTextIcon className="h-4 w-4 inline mr-2" />
                    Mensaje
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="8"
                    className="form-input w-full resize-none"
                    placeholder="Escriba su mensaje aquí..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {message.length} caracteres
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <PaperClipIcon className="h-4 w-4 inline mr-2" />
                    Adjuntar Documento (Opcional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                    >
                      <div className="text-center">
                        <PaperClipIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {file ? file.name : "Haz clic para seleccionar un archivo"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                  {file && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-blue-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                  <Link href="/eventsdetails" className="flex-1">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Volver a Eventos
                    </button>
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={loading || !email || !message}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Enviar Aviso
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Envolver el contenido en un Suspense Boundary
const AvisosPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <AvisosPageContent />
    </Suspense>
  );
};

export default AvisosPage;