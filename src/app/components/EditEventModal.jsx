import React, { useState } from "react";
import supabase from "../../lib/supabaseClient"; 
import toast from "react-hot-toast";

const EditEventModal = ({ event, onClose, onUpdate }) => {
  const [editedEvent, setEditedEvent] = useState({
    guests: event.guests,
    pricePerPlate: event.pricePerPlate,
    observations: event.observations || "",
    menu: event.menu || "",
    fileUrls: event.fileUrls || [], // Inicializa con las URLs existentes
  });

  const [loading, setLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false); // Estado para el spinner de recarga

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent((prev) => ({
      ...prev,
      [name]: name === "guests" || name === "pricePerPlate" ? Number(value) : value,
    }));
  };

  const handleFileUpload = async (files) => {
    try {
      const uploadedFileUrls = []; // Array para almacenar las URLs de los archivos subidos
  
      for (const file of files) {
        // Genera un nombre único para evitar conflictos
        const uniqueFileName = `${Date.now()}-${file.name}`;
  
        // Sube el archivo al bucket de Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("eventos")
          .upload(`public/${uniqueFileName}`, file);
  
        if (uploadError) {
          console.error("Error subiendo el archivo:", uploadError.message);
          toast.error(`Error subiendo el archivo: ${file.name}`);
          continue; // Continúa con el siguiente archivo si hay un error
        }
  
        console.log("Archivo subido exitosamente:", uploadData);
  
        // Obtiene la URL pública del archivo
        const { data: publicUrlData, error: publicUrlError } = await supabase.storage
          .from("eventos")
          .getPublicUrl(`public/${uniqueFileName}`);
  
        if (publicUrlError) {
          console.error("Error obteniendo la URL pública:", publicUrlError.message);
          toast.error(`Error obteniendo la URL pública: ${file.name}`);
          continue; // Continúa con el siguiente archivo si hay un error
        }
  
        const fileUrl = publicUrlData.publicUrl;
  
        console.log("URL pública del archivo:", fileUrl);
  
        // Agrega la URL al array de URLs
        uploadedFileUrls.push(fileUrl);
      }
  
      // Actualiza el estado con las nuevas URLs
      setEditedEvent((prev) => ({
        ...prev,
        fileUrls: [...(prev.fileUrls || []), ...uploadedFileUrls], // Combina las URLs existentes con las nuevas
      }));
  
      toast.success("Archivos subidos y URLs guardadas correctamente.");
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado: " + err.message);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/abm-events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: event.id,
          guests: editedEvent.guests,
          pricePerPlate: editedEvent.pricePerPlate,
          observations: editedEvent.observations || null,
          menu: editedEvent.menu || null,
          fileUrls: editedEvent.fileUrls || [],
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        toast.success("Evento actualizado exitosamente");
  
        // Activar el spinner de recarga
        setIsReloading(true);
  
        // Recargar la página después de 2 segundos
        setTimeout(() => {
          window.location.reload(); // Recarga la página
        }, 2000); // Retraso de 2 segundos para dar tiempo a leer el mensaje
      } else {
        toast.error(`Error al actualizar el evento: ${result.error}`);
      }
    } catch (error) {
      console.error("Error al actualizar el evento:", error);
      toast.error("Ocurrió un error al intentar actualizar el evento.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Fondo desenfocado */}
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
        {/* Contenido del modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Evento</h3>
            <form>
              {/* Cantidad de invitados */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Cantidad de Invitados</label>
                <input
                  type="number"
                  name="guests"
                  value={editedEvent.guests}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Precio por plato */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Precio por Plato</label>
                <input
                  type="number"
                  name="pricePerPlate"
                  value={editedEvent.pricePerPlate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Observaciones */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea
                  name="observations"
                  value={editedEvent.observations}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Adjuntar Archivos</label>
                <input
                  type="file"
                  multiple // Permite seleccionar múltiples archivos
                  onChange={(e) => handleFileUpload(e.target.files)} // Maneja la subida de archivos
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Mostrar archivos adjuntos existentes */}
              <div className="mb-4">
                <strong>Archivos Adjuntos:</strong>
                {editedEvent.fileUrls && editedEvent.fileUrls.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {editedEvent.fileUrls.map((url, index) => {
                      const fileName = url.split("/").pop(); // Extrae el nombre del archivo desde la URL
                      const fileType = fileName.split(".").pop().toUpperCase(); // Obtiene la extensión del archivo
                      return (
                        <li key={index}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {fileName} ({fileType})
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>No hay archivos adjuntos</p>
                )}
              </div>

              {/* Menú */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Menú</label>
                <textarea
                  name="menu"
                  value={editedEvent.menu}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </form>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                loading ? "bg-gray-400" : "bg-blue-500"
              } text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
      {/* Spinner de recarga */}
      {isReloading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-800 font-medium">Recargando eventos...</p>
            </div>
        </div>
        )}
    </div>
  );
};

export default EditEventModal;