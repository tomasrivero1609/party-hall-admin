"use client"; // Asegúrate de que el archivo esté marcado como un componente del lado del cliente

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const AvisosPageContent = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Obtener los parámetros de la URL
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  const emailFromParams = searchParams.get("email");

  // Prellenar el correo electrónico si está presente en los parámetros
  useEffect(() => {
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [emailFromParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

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
        setEmail("");
        setMessage("");
        setFile(null);
      } else {
        setErrorMessage(data.error || "Ocurrió un error al enviar el aviso.");
      }
    } catch (error) {
      setErrorMessage("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-900">Enviar Aviso</h2>

        {successMessage && (
          <div className="p-4 text-green-800 bg-green-100 border border-green-400 rounded-md text-center">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 text-red-800 bg-red-100 border border-red-400 rounded-md text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Adjuntar Documento</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 w-full text-sm text-gray-500 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
          </div>
          <div className="flex justify-between mt-4">
          <Link href={`/eventsdetails`}>
            <button
              className="w-auto py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
            >
              Volver
            </button>
          </Link>
            <button
              type="submit"
              disabled={loading}
              className={`w-auto py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Enviando..." : "Enviar Aviso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Envolver el contenido en un Suspense Boundary
const AvisosPage = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AvisosPageContent />
    </Suspense>
  );
};

export default AvisosPage;