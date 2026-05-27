"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, DayTrip, Folio } from "../context/AdminContext";
import ConfirmModal from "./ConfirmModal";
import { useSortableData, SortIcon } from "../../../hooks/useSortableData";
import { formatDateStr } from "../../../utils/dateFormatter";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

interface PatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: DayTrip | null;
}

export default function PatientsModal({ isOpen, onClose, campaign }: PatientsModalProps) {
  const { handleDeleteFolio, refreshTrigger } = useAdmin();
  const [patients, setPatients] = useState<Folio[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [folioToDelete, setFolioToDelete] = useState<any | null>(null);

  const { items: sortedPatients, requestSort, sortConfig } = useSortableData(patients);

  // Fetch only the patients associated with this campaign
  useEffect(() => {
    if (isOpen && campaign) {
      const loadPatients = async () => {
        setLoading(true);
        try {
          const q = query(collection(db, "folios"), where("dayTrip", "==", campaign.uuid));
          const snap = await getDocs(q);
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folio));
          setPatients(data);
        } catch (err) {
          console.error("Error loading patients for campaign:", err);
        } finally {
          setLoading(false);
        }
      };
      loadPatients();
    }
  }, [campaign, isOpen, refreshTrigger]);

  if (!isOpen || !campaign) return null;

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
              {campaign.title} | {formatDateStr(campaign.date)}
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
          {loading ? (
            <div className="text-center py-12 text-slate-400">Cargando pacientes de la jornada...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-white/10 rounded-2xl">
              No hay pacientes registrados para esta jornada aún.
            </div>
          ) : (
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                      <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("code")}>
                        Folio <SortIcon active={sortConfig?.key === "code"} direction={sortConfig?.direction || null} />
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("name")}>
                        Paciente <SortIcon active={sortConfig?.key === "name"} direction={sortConfig?.direction || null} />
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("email")}>
                        Correo <SortIcon active={sortConfig?.key === "email"} direction={sortConfig?.direction || null} />
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("cellphone")}>
                        Celular <SortIcon active={sortConfig?.key === "cellphone"} direction={sortConfig?.direction || null} />
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors text-center" onClick={() => requestSort("numberOfPatients")}>
                        Pacientes <SortIcon active={sortConfig?.key === "numberOfPatients"} direction={sortConfig?.direction || null} />
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors text-center" onClick={() => requestSort("active")}>
                        Estado <SortIcon active={sortConfig?.key === "active"} direction={sortConfig?.direction || null} />
                      </th>
                      <th className="p-4 text-center">Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPatients.map((folio) => (
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
                            onClick={() => {
                              setFolioToDelete(folio);
                              setIsConfirmOpen(true);
                            }}
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
            message={`¿Estás seguro de que quieres eliminar la cita con folio ${folioToDelete.code || folioToDelete.id} a nombre de "${folioToDelete.name}" permanentemente de esta jornada? Esta acción no se puede deshacer.`}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
