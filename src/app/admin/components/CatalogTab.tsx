"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, State } from "../context/AdminContext";
import ConfirmModal from "./ConfirmModal";
import { useSortableData, SortIcon } from "../../../hooks/useSortableData";

const defaultStateForm = {
  name: "",
  capital: "",
};

export default function CatalogTab() {
  const {
    statesList,
    schedules,
    subscribersList,
    selectedYear,
    handleStateSubmit,
    handleDeleteState
  } = useAdmin();

  const { items: sortedStates, requestSort, sortConfig } = useSortableData(statesList);

  const [stateForm, setStateForm] = useState(defaultStateForm);
  const [editingStateId, setEditingStateId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [stateToDelete, setStateToDelete] = useState<State | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleStateSubmit(stateForm, editingStateId);
    if (success) {
      setStateForm(defaultStateForm);
      setEditingStateId("");
    }
  };

  const openEditState = (state: State) => {
    setEditingStateId(state.id);
    setStateForm({
      name: state.name || "",
      capital: state.capital || "",
    });
  };

  const cancelEditState = () => {
    setEditingStateId("");
    setStateForm(defaultStateForm);
  };

  // Subscribers registered in selected year (or current year if no date)
  const subscribersOfYear = subscribersList.filter(sub => {
    if (sub.createdAt) {
      const date = sub.createdAt.toDate ? sub.createdAt.toDate() : new Date(sub.createdAt);
      return date.getFullYear() === selectedYear;
    }
    return selectedYear === new Date().getFullYear();
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* STATES MANAGEMENT */}
      <div className="flex flex-col gap-6">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-2">
            {editingStateId ? "Editar Estado de la República" : "Registrar Estado de la República"}
          </h3>

          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-slate-400">Nombre del Estado</label>
              <input
                type="text"
                placeholder="Ej. Puebla"
                value={stateForm.name}
                onChange={e => setStateForm({ ...stateForm, name: e.target.value })}
                className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-slate-400">Capital</label>
              <input
                type="text"
                placeholder="Ej. Puebla de Zaragoza"
                value={stateForm.capital}
                onChange={e => setStateForm({ ...stateForm, capital: e.target.value })}
                className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                required
              />
            </div>
            <div className="flex gap-2">
              {editingStateId && (
                <button
                  type="button"
                  onClick={cancelEditState}
                  className="bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-2 rounded-xl border border-white/10 transition-colors text-sm cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="bg-[#006828] hover:bg-[#00501f] text-white font-bold px-6 py-2 rounded-xl transition-colors text-sm cursor-pointer"
              >
                {editingStateId ? "Guardar" : "Registrar"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/5 bg-white/5">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Catálogo de Estados</h3>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                  <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("id")}>
                    UID <SortIcon active={sortConfig?.key === "id"} direction={sortConfig?.direction || null} />
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("name")}>
                    Nombre <SortIcon active={sortConfig?.key === "name"} direction={sortConfig?.direction || null} />
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("capital")}>
                    Capital <SortIcon active={sortConfig?.key === "capital"} direction={sortConfig?.direction || null} />
                  </th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedStates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                      No hay estados registrados.
                    </td>
                  </tr>
                ) : (
                  sortedStates.map((state) => (
                    <tr key={state.id} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                      <td className="p-4 text-xs font-mono text-slate-500 max-w-[120px] truncate">{state.id}</td>
                      <td className="p-4 font-semibold text-white">{state.name}</td>
                      <td className="p-4 text-slate-400">{state.capital}</td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openEditState(state)}
                            className="p-1.5 bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              setStateToDelete(state);
                              setIsConfirmOpen(true);
                            }}
                            className="p-1.5 bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SCHEDULES, SERVICES AND SUBSCRIBERS INFO */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
        <h3 className="text-lg font-bold text-white mb-2 border-b border-white/5 pb-2">Catálogos Auxiliares</h3>

        <div className="p-4 rounded-xl border border-white/10 bg-white/2">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">🕐 Plantillas de Horarios</h4>
          <ul className="flex flex-col gap-2 text-xs text-slate-400">
            {schedules.map(sch => (
              <li key={sch.id} className="flex justify-between border-b border-white/5 pb-1">
                <span>{sch.name}</span>
                <span className="text-[#4ade80]">Activa</span>
              </li>
            ))}
            {schedules.length === 0 && <li>Predeterminado: 10:00 Hrs. a 18:00 Hrs.</li>}
          </ul>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/2">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
            😊 Suscriptores Boletín ({subscribersOfYear.length})
          </h4>
          <div className="overflow-y-auto max-h-[150px] flex flex-col gap-1.5 mt-2">
            {subscribersList.map((sub, idx) => (
              <div key={sub.id || idx} className="flex items-center justify-between border-b border-white/5 pb-1 text-xs text-slate-400">
                <span className="truncate max-w-[200px]" title={sub.newsLetterEmail || sub.email}>
                  {sub.newsLetterEmail || sub.email || "Sin correo"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono select-all truncate max-w-[80px]">
                  {sub.id}
                </span>
              </div>
            ))}
            {subscribersList.length === 0 && (
              <p className="text-xs text-slate-500">No hay suscriptores registrados.</p>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/2">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">❓ FAQs del Sistema</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Las preguntas frecuentes mostradas en la landing page y en los formularios están ligadas a la colección <code className="bg-[#0a0a0a] px-1 py-0.5 rounded text-white font-mono">faqs</code> en Firestore. Se administran mediante la base de datos central.
          </p>
        </div>
      </div>
      <AnimatePresence>
        {isConfirmOpen && stateToDelete && (
          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => {
              setIsConfirmOpen(false);
              setStateToDelete(null);
            }}
            onConfirm={() => handleDeleteState(stateToDelete.id)}
            title="Eliminar Estado"
            message={`¿Deseas eliminar el estado "${stateToDelete.name}" del catálogo permanentemente?`}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
