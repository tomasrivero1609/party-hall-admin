"use client";
import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const emptyForm = { name: "", phone: "", category: "" };

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    setLoading(true);
    const res = await fetch("/api/notification-recipients");
    const data = await res.json();
    setRecipients(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setEditId(null);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (recipient) => {
    setForm({ name: recipient.name, phone: recipient.phone, category: recipient.category || "" });
    setEditId(recipient.id);
    setFormError("");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFormError("");
    setEditId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.phone) {
      setFormError("Nombre y teléfono son obligatorios");
      return;
    }
    setSaving(true);
    await fetch("/api/notification-recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editId ? { ...form, id: editId } : form),
    });
    setForm(emptyForm);
    setShowModal(false);
    setSaving(false);
    setEditId(null);
    fetchRecipients();
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar destinatario?")) return;
    await fetch(`/api/notification-recipients?id=${id}`, { method: "DELETE" });
    fetchRecipients();
  };

  const filtered = recipients.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search) ||
    (r.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
            <PlusIcon className="h-4 w-4 mr-2" />
            Gestión de Destinatarios
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-display">
            Destinatarios <span className="text-gradient">WhatsApp</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4 leading-relaxed">
            Administra los contactos del personal y proveedores para notificaciones automáticas y rápidas por WhatsApp.
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 animate-slide-up">
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o categoría..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/2 shadow-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold text-lg shadow hover:from-blue-700 hover:to-blue-600 transition"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar Destinatario
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-0 overflow-x-auto animate-fade-in">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-4 px-6 text-left text-base font-semibold text-gray-700">Nombre</th>
                <th className="py-4 px-6 text-left text-base font-semibold text-gray-700">Teléfono</th>
                <th className="py-4 px-6 text-left text-base font-semibold text-gray-700">Categoría</th>
                <th className="py-4 px-6 text-center text-base font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-lg">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-500 text-lg">No hay destinatarios.</td></tr>
              ) : filtered.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                  <td className="py-4 px-6 text-base font-medium text-gray-900">{r.name}</td>
                  <td className="py-4 px-6 text-base text-gray-700">{r.phone}</td>
                  <td className="py-4 px-6 text-base text-gray-700">{r.category || <span className="text-gray-400">-</span>}</td>
                  <td className="py-4 px-6 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => openEditModal(r)}
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition shadow"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition shadow"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-200 animate-scale-in">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={handleModalClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">{editId ? "Editar Destinatario" : "Agregar Destinatario"}</h3>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nombre</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Teléfono</label>
                  <PhoneInput
                    country={'ar'}
                    value={form.phone}
                    onChange={phone => setForm(f => ({ ...f, phone }))}
                    inputStyle={{ width: '100%', height: '48px', fontSize: '1.125rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', paddingLeft: 48 }}
                    buttonStyle={{ border: '1px solid #d1d5db', borderRadius: '0.5rem 0 0 0.5rem' }}
                    containerStyle={{ width: '100%' }}
                    dropdownStyle={{ borderRadius: '0.5rem' }}
                    placeholder="Ej: 11 2345 6789"
                    enableSearch
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Categoría</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
                    placeholder="Ej: DJ, Mozo, Encargado"
                  />
                </div>
                {formError && <p className="text-red-500 text-sm mb-2">{formError}</p>}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold text-lg shadow hover:from-green-600 hover:to-green-700 transition"
                  disabled={saving}
                >
                  {editId ? "Guardar Cambios" : "Guardar"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 