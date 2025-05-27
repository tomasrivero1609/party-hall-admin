import React, { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient"; 
import toast from "react-hot-toast";
import { 
  XMarkIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PaperClipIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline";

const EditEventModal = ({ event, onClose, onUpdate }) => {
  const [editedEvent, setEditedEvent] = useState({
    guests: event.guests,
    pricePerPlate: event.pricePerPlate,
    observations: event.observations || "",
    menu: event.menu || "",
    fileUrls: event.fileUrls || [],
  });

  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [errors, setErrors] = useState({});

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!editedEvent.guests || editedEvent.guests < 1) {
      newErrors.guests = "La cantidad de invitados debe ser mayor a 0";
    }
    
    if (!editedEvent.pricePerPlate || editedEvent.pricePerPlate < 0) {
      newErrors.pricePerPlate = "El precio por plato debe ser mayor o igual a 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent((prev) => ({
      ...prev,
      [name]: name === "guests" || name === "pricePerPlate" ? Number(value) : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploadingFiles(true);
    try {
      const uploadedFileUrls = [];
  
      for (const file of files) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`El archivo ${file.name} es demasiado grande (máx. 10MB)`);
          continue;
        }

        const uniqueFileName = `${Date.now()}-${file.name}`;
  
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("eventos")
          .upload(`public/${uniqueFileName}`, file);
  
        if (uploadError) {
          console.error("Error subiendo el archivo:", uploadError.message);
          toast.error(`Error subiendo el archivo: ${file.name}`);
          continue;
        }
  
        const { data: publicUrlData, error: publicUrlError } = await supabase.storage
          .from("eventos")
          .getPublicUrl(`public/${uniqueFileName}`);
  
        if (publicUrlError) {
          console.error("Error obteniendo la URL pública:", publicUrlError.message);
          toast.error(`Error obteniendo la URL pública: ${file.name}`);
          continue;
        }
  
        uploadedFileUrls.push(publicUrlData.publicUrl);
      }
  
      setEditedEvent((prev) => ({
        ...prev,
        fileUrls: [...(prev.fileUrls || []), ...uploadedFileUrls],
      }));
  
      toast.success(`${uploadedFileUrls.length} archivo(s) subido(s) correctamente`);
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado: " + err.message);
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeFile = (indexToRemove) => {
    setEditedEvent(prev => ({
      ...prev,
      fileUrls: prev.fileUrls.filter((_, index) => index !== indexToRemove)
    }));
    toast.success("Archivo eliminado");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

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
        
        // Update the parent component
        if (onUpdate) {
          onUpdate({
            ...event,
            ...editedEvent,
            total: editedEvent.guests * editedEvent.pricePerPlate
          });
        }
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1000);
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
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md transition-all duration-300" 
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl transform transition-all max-w-3xl w-full max-h-[85vh] overflow-hidden z-10 animate-scale-in my-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-1 break-words">
                    Editar Evento
                  </h3>
                  <p className="text-blue-100 text-sm break-words">
                    {event.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="modal-close-button w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-4"
                title="Cerrar modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-180px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guests */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <UserGroupIcon className="h-4 w-4 inline mr-2" />
                  Cantidad de Invitados
                </label>
                <input
                  type="number"
                  name="guests"
                  value={editedEvent.guests}
                  onChange={handleChange}
                  min="1"
                  className={`form-input w-full ${errors.guests ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Ej: 50"
                />
                {errors.guests && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.guests}
                  </p>
                )}
              </div>

              {/* Price per plate */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CurrencyDollarIcon className="h-4 w-4 inline mr-2" />
                  Precio por Plato
                </label>
                <input
                  type="number"
                  name="pricePerPlate"
                  value={editedEvent.pricePerPlate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`form-input w-full ${errors.pricePerPlate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Ej: 25.50"
                />
                {errors.pricePerPlate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    {errors.pricePerPlate}
                  </p>
                )}
              </div>
            </div>

            {/* Total calculation display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Total del Evento:</span>
                <span className="text-lg font-bold text-blue-900">
                  ${(editedEvent.guests * editedEvent.pricePerPlate).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Observations */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DocumentTextIcon className="h-4 w-4 inline mr-2" />
                Observaciones
              </label>
              <textarea
                name="observations"
                value={editedEvent.observations}
                onChange={handleChange}
                rows="3"
                className="form-input w-full resize-none"
                placeholder="Observaciones adicionales sobre el evento..."
              />
            </div>

            {/* Menu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DocumentTextIcon className="h-4 w-4 inline mr-2" />
                Menú
              </label>
              <textarea
                name="menu"
                value={editedEvent.menu}
                onChange={handleChange}
                rows="4"
                className="form-input w-full resize-none"
                placeholder="Describe el menú del evento..."
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <PaperClipIcon className="h-4 w-4 inline mr-2" />
                Archivos Adjuntos
              </label>
              
              {/* Upload Area */}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload-edit"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  disabled={uploadingFiles}
                />
                <label
                  htmlFor="file-upload-edit"
                  className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${
                    uploadingFiles 
                      ? 'border-blue-300 bg-blue-50 cursor-not-allowed' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-center">
                    {uploadingFiles ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-blue-600 font-medium">Subiendo archivos...</p>
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Haz clic para seleccionar archivos
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, DOCX, JPG, PNG, TXT (máx. 10MB cada uno)
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Existing Files */}
              {editedEvent.fileUrls && editedEvent.fileUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Archivos actuales:</h4>
                  <div className="space-y-2">
                    {editedEvent.fileUrls.map((url, index) => {
                      const fileName = url.split("/").pop();
                      const fileType = fileName.split(".").pop()?.toUpperCase() || "FILE";
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <PaperClipIcon className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{fileName}</p>
                              <p className="text-xs text-gray-500">{fileType}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Ver
                            </a>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Eliminar archivo"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              Editando evento del {new Date(event.date).toLocaleDateString("es-AR")}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center justify-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || uploadingFiles}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;