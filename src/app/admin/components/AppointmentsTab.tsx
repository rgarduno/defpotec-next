"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "../context/AdminContext";
import ConfirmModal from "./ConfirmModal";

export default function AppointmentsTab() {
  const {
    foliosList,
    campaigns,
    selectedYear,
    handleToggleFolioActive,
    handleDeleteFolio
  } = useAdmin();

  const [folioSearch, setFolioSearch] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [folioToDelete, setFolioToDelete] = useState<any | null>(null);

  // Derived filtered lists
  const campaignsOfYear = campaigns.filter(c => c.year === selectedYear || c.endYear === selectedYear);
  const campaignIdsOfYear = new Set(campaignsOfYear.map(c => c.uuid));
  
  const foliosOfYear = foliosList.filter(f => {
    if (campaignIdsOfYear.has(f.dayTrip)) return true;
    if (f.createdAt) {
      const date = f.createdAt.toDate ? f.createdAt.toDate() : new Date(f.createdAt);
      return date.getFullYear() === selectedYear;
    }
    return false;
  });

  const filteredFolios = foliosOfYear.filter(f => 
    f.name?.toLowerCase().includes(folioSearch.toLowerCase()) || 
    f.code?.toLowerCase().includes(folioSearch.toLowerCase()) ||
    f.email?.toLowerCase().includes(folioSearch.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
      
      {/* SEARCH BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div>
          <h3 className="font-bold text-white">Buscador y Conciliador de Citas</h3>
          <p className="text-xs text-slate-400 mt-1">Busca por código de folio, nombre del paciente o correo electrónico.</p>
        </div>
        <input
          type="text"
          placeholder="Buscar folio (ej. DF98X o Laura)..."
          value={folioSearch}
          onChange={e => setFolioSearch(e.target.value)}
          className="w-full sm:w-80 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
        />
      </div>

      {/* APPOINTMENTS FOLIO LIST TABLE */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Listado General de Pacientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="p-4">Folio / Status</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Celular</th>
                <th className="p-4">ID Campaña</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFolios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                    No se encontraron citas o folios registrados.
                  </td>
                </tr>
              ) : (
                filteredFolios.map((folio) => (
                  <tr key={folio.id} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                    <td className="p-4">
                      <span className="font-mono text-base font-black text-[#4ade80] tracking-wider select-all">
                        {folio.code || folio.id}
                      </span>
                      <span className={`ml-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        folio.active 
                          ? "bg-[#006828]/20 text-[#4ade80]" 
                          : "bg-white/5 text-slate-500"
                      }`}>
                        {folio.active ? "Activo" : "Completado"}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-white">{folio.name}</td>
                    <td className="p-4 text-xs text-slate-400">{folio.email}</td>
                    <td className="p-4 text-xs text-slate-400">{folio.cellphone}</td>
                    <td className="p-4 text-xs font-mono text-slate-500 max-w-[150px] truncate" title={folio.dayTrip}>
                      {folio.dayTrip}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center items-center">
                        <button
                          onClick={() => handleToggleFolioActive(folio)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            folio.active 
                              ? "bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white" 
                              : "bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white"
                          }`}
                        >
                          {folio.active ? "Completar" : "Reactivar"}
                        </button>
                        <button
                          onClick={() => {
                            setFolioToDelete(folio);
                            setIsConfirmOpen(true);
                          }}
                          className="p-1.5 bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Eliminar permanentemente"
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

      <AnimatePresence>
        {isConfirmOpen && folioToDelete && (
          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => {
              setIsConfirmOpen(false);
              setFolioToDelete(null);
            }}
            onConfirm={() => handleDeleteFolio(folioToDelete.code || folioToDelete.id)}
            title="Eliminar Cita"
            message={`¿Estás seguro de que quieres eliminar la cita con folio ${folioToDelete.code || folioToDelete.id} a nombre de "${folioToDelete.name}" permanentemente? Esta acción no se puede deshacer.`}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
