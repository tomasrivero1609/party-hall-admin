"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FaEnvelope, FaLock } from "react-icons/fa"; // Íconos para correo y contraseña

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Estado para mostrar errores
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar la carga

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar errores previos
    setError("");
    setIsLoading(true);

    try {
      // Intenta iniciar sesión
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.");
      } else {
        window.location.href = "/"; // Redirige al usuario a la página principal
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Por favor, inténtalo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-16 bg-gray-100">
      {/* Contenedor principal */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6 text-center">
        {/* Foto/Logo */}
        <div className="mb-4">
          <img
            src="/logo_quilmes.png" // Reemplaza esto con la ruta de tu imagen
            alt="Logo"
            className="w-24 h-24 mx-auto rounded-full object-cover"
          />
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de correo electrónico */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
                placeholder="ejemplo@correo.com"
                required
                aria-label="Correo Electrónico"
              />
            </div>
          </div>

          {/* Campo de contraseña */}
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Contraseña
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
                placeholder="********"
                required
                aria-label="Contraseña"
              />
            </div>
          </div>

          {/* Mensaje de error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Botón de inicio de sesión */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition duration-300 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 hover:scale-105 transform"
            }`}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}