"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAdmin, DayTrip } from "../context/AdminContext";

interface PatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: DayTrip | null;
}

export default function PatientsModal({ isOpen, onClose, campaign }: PatientsModalProps) {
  const { foliosList, handleDeleteFolio } = useAdmin();

  if (!isOpen || !campaign) return null;

  const patients = foliosList.filter(f => f.dayTrip === campaign.uuid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#161616] border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#006828]" />
        
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5 shrink-0">
          <div>
            <span className="text-[10px] bg-[#006828]/25 text-[#4ade80] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Pacientes Registrados
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {campaign.place} ({campaign.municipality}, {campaign.state})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {campaign.title} | {campaign.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {patients.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-white/10 rounded-2xl">
              No hay pacientes registrados para esta jornada aún.
            </div>
          ) : (
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                      <th className="p-4">Folio</th>
                      <th className="p-4">Paciente</th>
                      <th className="p-4">Correo</th>
                      <th className="p-4">Celular</th>
                      <th className="p-4 text-center">Pacientes</th>
                      <th className="p-4 text-center">Estado</th>
                      <th className="p-4 text-center">Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((folio) => (
                      <tr key={folio.id} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                        <td className="p-4">
                          <span className="font-mono text-base font-black text-[#4ade80] tracking-wider select-all">
                            {folio.code || folio.id}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-white">{folio.name}</td>
                        <td className="p-4 text-xs text-slate-400">{folio.email}</td>
                        <td className="p-4 text-xs text-slate-400">{folio.cellphone}</td>
                        <td className="p-4 text-center text-xs text-slate-400 font-bold">{folio.numberOfPatients || 1}</td>
                        <td className="p-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            folio.active 
                              ? "bg-[#006828]/20 text-[#4ade80]" 
                              : "bg-white/5 text-slate-500"
                          }`}>
                            {folio.active ? "Activo" : "Completado"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteFolio(folio.code || folio.id)}
                            className="p-1.5 bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Eliminar cita permanentemente"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 bg-white/2 border-t border-white/5 shrink-0 flex justify-between items-center text-xs font-semibold text-slate-400">
          <div>
            Total Pases / Registros: <span className="text-white font-bold">{patients.length}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold transition-all border border-white/10 text-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
