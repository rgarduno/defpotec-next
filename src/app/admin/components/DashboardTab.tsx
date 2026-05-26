"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, DayTrip } from "../context/AdminContext";
import CampaignModal from "./CampaignModal";
import PatientsModal from "./PatientsModal";
import ConfirmModal from "./ConfirmModal";
import { useSortableData, SortIcon } from "../../../hooks/useSortableData";

export default function DashboardTab() {
  const {
    campaigns,
    dbUsers,
    foliosList,
    subscribersList,
    selectedYear,
    handleToggleCampaignStatus,
    handleDeleteCampaign
  } = useAdmin();

  // Local state for modals
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);
  const [selectedCampaignForModal, setSelectedCampaignForModal] = useState<DayTrip | null>(null);
  const [selectedCampaignForPatients, setSelectedCampaignForPatients] = useState<DayTrip | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<DayTrip | null>(null);

  // Derived metrics
  const activeCampaigns = campaigns.filter(
    c => c.status === "active" && (c.year === selectedYear || c.endYear === selectedYear)
  );
  const inactiveCampaigns = campaigns.filter(
    c => c.status === "inactive" && (c.year === selectedYear || c.endYear === selectedYear)
  );

  const { items: sortedActiveCampaigns, requestSort: requestSortActive, sortConfig: sortConfigActive } = useSortableData(activeCampaigns);
  const { items: sortedInactiveCampaigns, requestSort: requestSortInactive, sortConfig: sortConfigInactive } = useSortableData(inactiveCampaigns);

  const campaignsOfYear = campaigns.filter(
    c => c.year === selectedYear || c.endYear === selectedYear
  );
  const campaignIdsOfYear = new Set(campaignsOfYear.map(c => c.uuid));

  const foliosOfYear = foliosList.filter(f => {
    if (campaignIdsOfYear.has(f.dayTrip)) return true;
    if (f.createdAt) {
      const date = f.createdAt.toDate ? f.createdAt.toDate() : new Date(f.createdAt);
      return date.getFullYear() === selectedYear;
    }
    return false;
  });

  const subscribersOfYear = subscribersList.filter(sub => {
    if (sub.createdAt) {
      const date = sub.createdAt.toDate ? sub.createdAt.toDate() : new Date(sub.createdAt);
      return date.getFullYear() === selectedYear;
    }
    return selectedYear === new Date().getFullYear();
  });

  // Chart 1: Monthly Folios count
  const monthlyData = Array(12).fill(0);
  foliosOfYear.forEach(f => {
    const camp = campaigns.find(c => c.uuid === f.dayTrip);
    if (camp && camp.month >= 1 && camp.month <= 12) {
      monthlyData[camp.month - 1] += 1;
    } else if (f.createdAt) {
      const date = f.createdAt.toDate ? f.createdAt.toDate() : new Date(f.createdAt);
      const m = date.getMonth();
      if (m >= 0 && m < 12) {
        monthlyData[m] += 1;
      }
    }
  });

  // Chart 2: Top States activity
  const stateCounts: { [key: string]: number } = {};
  campaignsOfYear.forEach(c => {
    if (c.state) {
      stateCounts[c.state] = (stateCounts[c.state] || 0) + 1;
    }
  });
  const topStates = Object.entries(stateCounts)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);

  const handleEditClick = (campaign: DayTrip) => {
    setSelectedCampaignForModal(campaign);
    setIsCampaignModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedCampaignForModal(null);
    setIsCampaignModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
      
      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Jornadas Activas</p>
          <p className="text-3xl font-black text-[#4ade80]">{activeCampaigns.length}</p>
          <div className="absolute bottom-2 right-4 text-3xl opacity-10">👁️</div>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Jornadas Inactivas</p>
          <p className="text-3xl font-black text-slate-400">{inactiveCampaigns.length}</p>
          <div className="absolute bottom-2 right-4 text-3xl opacity-10">💬</div>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Folios</p>
          <p className="text-3xl font-black text-[#60a5fa]">{foliosOfYear.length}</p>
          <div className="absolute bottom-2 right-4 text-3xl opacity-10">🛍️</div>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Usuarios</p>
          <p className="text-3xl font-black text-[#f43f5e]">{dbUsers.length}</p>
          <div className="absolute bottom-2 right-4 text-3xl opacity-10">❤️</div>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Suscriptores</p>
          <p className="text-3xl font-black text-[#10b981]">{subscribersOfYear.length}</p>
          <div className="absolute bottom-2 right-4 text-3xl opacity-10">😊</div>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Servicios</p>
          <p className="text-3xl font-black text-[#f59e0b]">3</p>
          <div className="absolute bottom-2 right-4 text-3xl opacity-10">🚚</div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Monthly Folios count */}
        <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-white text-base">Citas Agendadas por Mes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Volumen mensual de folios registrados en el año {selectedYear}.</p>
          </div>
          
          <div className="relative w-full h-[220px] bg-[#0a0a0a] rounded-xl p-4 border border-white/5 flex flex-col justify-between">
            {/* Grid Lines & Bars */}
            <div className="relative flex-grow flex items-end justify-between h-[160px] px-2 pt-4">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                <div className="w-full border-t border-dashed border-white" />
                <div className="w-full border-t border-dashed border-white" />
                <div className="w-full border-t border-dashed border-white" />
                <div className="w-full border-t border-dashed border-white" />
              </div>
              
              {monthlyData.map((val, idx) => {
                const maxMonthlyVal = Math.max(...monthlyData, 5);
                const pctHeight = (val / maxMonthlyVal) * 100;
                return (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center gap-1 group relative flex-1"
                    onMouseEnter={() => setHoveredMonth(idx)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Hover Tooltip */}
                    <AnimatePresence>
                      {hoveredMonth === idx && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute bottom-[calc(100%+8px)] bg-[#1c1c1c] border border-[#006828]/50 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-xl z-20 whitespace-nowrap"
                        >
                          {val} {val === 1 ? "cita" : "citas"}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bar */}
                    <div className="w-6 sm:w-8 bg-white/5 rounded-t-lg overflow-hidden h-[120px] flex items-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${pctHeight}%` }}
                        transition={{ type: "spring", stiffness: 60, delay: idx * 0.02 }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#006828] to-[#4ade80] group-hover:brightness-110 shadow-[0_0_10px_rgba(74,222,128,0.1)] transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between px-2 pt-2 border-t border-white/5 text-[9px] sm:text-[10px] text-slate-500 font-semibold select-none">
              {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((lbl, idx) => (
                <span key={idx} className="flex-1 text-center truncate">{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Top States activity */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-white text-base">Actividad por Estado</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribución de campañas por región en el año {selectedYear}.</p>
          </div>
          
          <div className="flex flex-col gap-4 flex-grow justify-center">
            {topStates.slice(0, 4).map(({ state, count }) => {
              const totalCamps = campaignsOfYear.length || 1;
              const percentage = Math.round((count / totalCamps) * 100);
              return (
                <div key={state} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300 truncate max-w-[120px]" title={state}>{state}</span>
                    <span className="text-slate-400 font-mono font-bold">{count} {count === 1 ? "campaña" : "campañas"} ({percentage}%)</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#006828] to-[#4ade80] rounded-full shadow-[0_0_8px_rgba(74,222,128,0.15)]"
                    />
                  </div>
                </div>
              );
            })}

            {topStates.length === 0 && (
              <div className="h-[180px] border border-dashed border-white/5 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                Sin datos geográficos en este año.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ACTION HEADER */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold">Administración de Jornadas</h2>
        <button
          onClick={handleCreateClick}
          className="px-6 py-2.5 bg-[#006828] hover:bg-[#00501f] text-white rounded-full font-bold text-sm shadow-[0_0_15px_rgba(0,104,40,0.3)] transition-colors cursor-pointer"
        >
          Crear Jornada
        </button>
      </div>

      {/* ACTIVE CAMPAIGNS TABLE */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Jornadas Activas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSortActive("state")}>
                  Municipio / Estado <SortIcon active={sortConfigActive?.key === "state"} direction={sortConfigActive?.direction || null} />
                </th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSortActive("place")}>
                  Establecimiento <SortIcon active={sortConfigActive?.key === "place"} direction={sortConfigActive?.direction || null} />
                </th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSortActive("date")}>
                  Fecha <SortIcon active={sortConfigActive?.key === "date"} direction={sortConfigActive?.direction || null} />
                </th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSortActive("author")}>
                  Responsable <SortIcon active={sortConfigActive?.key === "author"} direction={sortConfigActive?.direction || null} />
                </th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSortActive("time")}>
                  Horario <SortIcon active={sortConfigActive?.key === "time"} direction={sortConfigActive?.direction || null} />
                </th>
                <th className="p-4 text-center">Pacientes</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedActiveCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                    No hay campañas activas registradas.
                  </td>
                </tr>
              ) : (
                sortedActiveCampaigns.map((camp) => (
                  <tr key={camp.uuid} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                    <td className="p-4 font-semibold text-white">
                      {camp.municipality || "N/A"}, {camp.state}
                    </td>
                    <td className="p-4">{camp.place || "N/A"}</td>
                    <td className="p-4 text-xs">{camp.date}</td>
                    <td className="p-4 text-xs text-slate-400">{camp.author}</td>
                    <td className="p-4 text-xs text-slate-400">{camp.time}</td>
                    <td className="p-4 text-center text-xs font-bold text-[#4ade80]">
                      👥 {foliosList.filter(f => f.dayTrip === camp.uuid).reduce((sum, f) => sum + (f.numberOfPatients || 1), 0)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedCampaignForPatients(camp);
                            setIsPatientsModalOpen(true);
                          }}
                          className="p-1.5 bg-white/5 hover:bg-[#006828] rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Ver pacientes"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEditClick(camp)}
                          className="p-1.5 bg-white/5 hover:bg-[#006828] rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleCampaignStatus(camp)}
                          className="p-1.5 bg-[#9B0000]/10 hover:bg-[#9B0000] rounded-lg text-[#9B0000] hover:text-white transition-colors text-xs font-semibold px-2.5 py-1 cursor-pointer"
                        >
                          Desactivar
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

      {/* INACTIVE CAMPAIGNS TABLE */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Historial de Jornadas Inactivas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSortInactive("state")}>
                  Municipio / Estado <SortIcon active={sortConfigInactive?.key === "state"} direction={sortConfigInactive?.direction || null} />
                </th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSortInactive("place")}>
                  Establecimiento <SortIcon active={sortConfigInactive?.key === "place"} direction={sortConfigInactive?.direction || null} />
                </th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSortInactive("date")}>
                  Fecha <SortIcon active={sortConfigInactive?.key === "date"} direction={sortConfigInactive?.direction || null} />
                </th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSortInactive("author")}>
                  Responsable <SortIcon active={sortConfigInactive?.key === "author"} direction={sortConfigInactive?.direction || null} />
                </th>
                <th className="p-4 text-center">Pacientes</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedInactiveCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                    No hay campañas inactivas en el historial.
                  </td>
                </tr>
              ) : (
                sortedInactiveCampaigns.map((camp) => (
                  <tr key={camp.uuid} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-400">
                    <td className="p-4">
                      {camp.municipality || "N/A"}, {camp.state}
                    </td>
                    <td className="p-4">{camp.place || "N/A"}</td>
                    <td className="p-4 text-xs">{camp.date}</td>
                    <td className="p-4 text-xs">{camp.author}</td>
                    <td className="p-4 text-center text-xs font-bold text-slate-400">
                      👥 {foliosList.filter(f => f.dayTrip === camp.uuid).reduce((sum, f) => sum + (f.numberOfPatients || 1), 0)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedCampaignForPatients(camp);
                            setIsPatientsModalOpen(true);
                          }}
                          className="p-1.5 bg-white/5 hover:bg-[#006828] rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Ver pacientes"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEditClick(camp)}
                          className="p-1.5 bg-white/5 hover:bg-[#006828] rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleCampaignStatus(camp)}
                          className="p-1.5 bg-[#006828]/20 hover:bg-[#006828] rounded-lg text-[#4ade80] hover:text-white transition-colors text-xs font-semibold px-2.5 py-1 cursor-pointer"
                        >
                          Activar
                        </button>
                        <button
                          onClick={() => {
                            setCampaignToDelete(camp);
                            setIsConfirmOpen(true);
                          }}
                          className="p-1.5 bg-white/5 hover:bg-[#9B0000] rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
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

      {/* Modals rendering inside tab */}
      <AnimatePresence>
        {isCampaignModalOpen && (
          <CampaignModal
            isOpen={isCampaignModalOpen}
            onClose={() => {
              setIsCampaignModalOpen(false);
              setSelectedCampaignForModal(null);
            }}
            campaign={selectedCampaignForModal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPatientsModalOpen && selectedCampaignForPatients && (
          <PatientsModal
            isOpen={isPatientsModalOpen}
            onClose={() => {
              setIsPatientsModalOpen(false);
              setSelectedCampaignForPatients(null);
            }}
            campaign={selectedCampaignForPatients}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && campaignToDelete && (
          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => {
              setIsConfirmOpen(false);
              setCampaignToDelete(null);
            }}
            onConfirm={() => handleDeleteCampaign(campaignToDelete.uuid)}
            title="Eliminar Jornada"
            message={`¿Estás seguro de que quieres eliminar la campaña "${campaignToDelete.place || campaignToDelete.title}" permanentemente? Esta acción no se puede deshacer.`}
          />
        )}
      </AnimatePresence>
      
    </motion.div>
  );
}
