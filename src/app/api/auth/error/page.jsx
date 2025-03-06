export default function AuthErrorPage() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Autenticación</h1>
          <p className="text-gray-700">
            Ocurrió un error durante el proceso de autenticación. Por favor, inténtalo nuevamente.
          </p>
        </div>
      </div>
    );
  }