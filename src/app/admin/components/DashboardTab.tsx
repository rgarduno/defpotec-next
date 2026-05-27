"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, DayTrip, DBUser } from "../context/AdminContext";
import CampaignModal from "./CampaignModal";
import PatientsModal from "./PatientsModal";
import ConfirmModal from "./ConfirmModal";
import { useSortableData, SortIcon } from "../../../hooks/useSortableData";
import { formatDateStr } from "../../../utils/dateFormatter";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getCountFromServer,
  limit 
} from "firebase/firestore";
import { db } from "@/firebase/config";

export default function DashboardTab() {
  const {
    selectedYear,
    handleToggleCampaignStatus,
    handleDeleteCampaign,
    refreshTrigger
  } = useAdmin();

  // Local state for loaded metrics and data
  const [campaigns, setCampaigns] = useState<DayTrip[]>([]);
  const [dbUsers, setDbUsers] = useState<DBUser[]>([]);
  const [foliosCount, setFoliosCount] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState<number[]>(Array(12).fill(0));
  const [loading, setLoading] = useState(true);

  // Local state for modals
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);
  const [selectedCampaignForModal, setSelectedCampaignForModal] = useState<DayTrip | null>(null);
  const [selectedCampaignForPatients, setSelectedCampaignForPatients] = useState<DayTrip | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<DayTrip | null>(null);

  // Fetch Dashboard Stats and Data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch campaigns for selected year
      const campaignsSnap = await getDocs(
        query(collection(db, "dayTrip"), where("year", "==", selectedYear))
      );
      const campaignData = campaignsSnap.docs.map(doc => ({ uuid: doc.id, ...doc.data() } as DayTrip));
      setCampaigns(campaignData);

      const campaignIds = campaignData.map(c => c.uuid);

      // 2. Fetch dbUsers (Administrators list)
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DBUser));
      setDbUsers(usersData);
      setUsersCount(usersData.length);

      // 3. Count Subscribers/Newsletters
      let subsColl = "newsletters";
      const newsSnap = await getDocs(query(collection(db, "newsletters"), limit(1)));
      if (newsSnap.empty) {
        subsColl = "subscribers";
      }
      const subsCountSnap = await getCountFromServer(collection(db, subsColl));
      setSubscribersCount(subsCountSnap.data().count);

      // 4. Load Folios Count and Monthly Distribution (Chart 1)
      if (campaignIds.length > 0) {
        const activeIds = campaignIds.slice(0, 30); // Firestore limitation of 30 in 'in' queries
        const foliosSnap = await getDocs(
          query(collection(db, "folios"), where("dayTrip", "in", activeIds))
        );
        setFoliosCount(foliosSnap.size);

        // Compute monthly distribution
        const chartData = Array(12).fill(0);
        foliosSnap.docs.forEach(docSnap => {
          const f = docSnap.data();
          const camp = campaignData.find(c => c.uuid === f.dayTrip);
          if (camp && camp.month >= 1 && camp.month <= 12) {
            chartData[camp.month - 1] += 1;
          } else if (f.createdAt) {
            const date = f.createdAt.toDate ? f.createdAt.toDate() : new Date(f.createdAt);
            const m = date.getMonth();
            if (m >= 0 && m < 12) {
              chartData[m] += 1;
            }
          }
        });
        setMonthlyData(chartData);
      } else {
        setFoliosCount(0);
        setMonthlyData(Array(12).fill(0));
      }
    } catch (err) {
      console.error("Error loading dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, refreshTrigger]);

  // Derived metrics
  const activeCampaigns = campaigns.filter(c => c.status === "active");
  const inactiveCampaigns = campaigns.filter(c => c.status === "inactive");

  const { items: sortedActiveCampaigns, requestSort: requestSortActive, sortConfig: sortConfigActive } = useSortableData(activeCampaigns);
  const { items: sortedInactiveCampaigns, requestSort: requestSortInactive, sortConfig: sortConfigInactive } = useSortableData(inactiveCampaigns);

  // Chart 2: Top States activity
  const stateCounts: { [key: string]: number } = {};
  campaigns.forEach(c => {
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
      
      {/* METRIC CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-32">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#006828]/10 rounded-full blur-xl pointer-events-none" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Jornadas Activas</p>
          <h2 className="text-3xl font-black text-[#4ade80]">{activeCampaigns.length}</h2>
          <p className="text-[10px] text-slate-500">De un total de {campaigns.length} registradas en {selectedYear}.</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-32">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Pacientes</p>
          <h2 className="text-3xl font-black text-white">{foliosCount}</h2>
          <p className="text-[10px] text-slate-500">Pases generados para las jornadas del año.</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-32">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#9B0000]/10 rounded-full blur-xl pointer-events-none" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Optometristas / Directivos</p>
          <h2 className="text-3xl font-black text-[#f87171]">{usersCount}</h2>
          <p className="text-[10px] text-slate-500">Usuarios con credenciales de acceso al sistema.</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-32">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#4ade80]/5 rounded-full blur-xl pointer-events-none" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Suscriptores Boletín</p>
          <h2 className="text-3xl font-black text-[#a7f3d0]">{subscribersCount}</h2>
          <p className="text-[10px] text-slate-500">Correos registrados para recibir información.</p>
        </div>
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart 1: Monthly distribution */}
        <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[280px]">
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-1">Distribución Mensual de Pacientes</h3>
            <p className="text-xs text-slate-500">Total de citas registradas por mes.</p>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-40 pt-6 px-4">
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
                        className="absolute bottom-[calc(100%+8px)] bg-[#1c1c1c] border border-006828/50 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-xl z-20 whitespace-nowrap"
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
                      className="w-full bg-[#006828] group-hover:bg-[#008f37] transition-colors rounded-t-lg"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                    {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Top States */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-1">Presencia en Estados</h3>
            <p className="text-xs text-slate-500">Estados con mayor número de campañas.</p>
          </div>
          
          <div className="flex flex-col gap-3 py-4 overflow-y-auto max-h-[180px]">
            {topStates.map((item, idx) => {
              const maxVal = topStates[0]?.count || 1;
              const pct = (item.count / maxVal) * 100;
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white">{item.state}</span>
                    <span className="text-slate-400">{item.count} {item.count === 1 ? "jornada" : "jornadas"}</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${pct}%` }}
                      className="bg-gradient-to-r from-[#006828] to-[#008f37] h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
            {topStates.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No hay datos de ubicación disponibles.</p>
            )}
          </div>
        </div>
      </div>

      {/* CAMPAIGNS LIST TABLES */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Jornadas de Salud Visual ({selectedYear})</h3>
            <p className="text-xs text-slate-400 mt-1">Directorio y agenda de campañas activas y concluidas.</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-[#006828] hover:bg-[#00501f] text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,104,40,0.3)] cursor-pointer"
          >
            + Crear Jornada
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando jornadas...</div>
        ) : (
          <div className="flex flex-col">
            {/* Active Campaigns */}
            <div className="p-4 bg-white/2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-[#4ade80] tracking-widest">Jornadas Activas ({activeCampaigns.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/1">
                    <th className="p-4 cursor-pointer hover:bg-white/5" onClick={() => requestSortActive("title")}>
                      Campaña / Encargado <SortIcon active={sortConfigActive?.key === "title"} direction={sortConfigActive?.direction || null} />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-white/5" onClick={() => requestSortActive("place")}>
                      Establecimiento <SortIcon active={sortConfigActive?.key === "place"} direction={sortConfigActive?.direction || null} />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-white/5" onClick={() => requestSortActive("state")}>
                      Ubicación <SortIcon active={sortConfigActive?.key === "state"} direction={sortConfigActive?.direction || null} />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-white/5" onClick={() => requestSortActive("day")}>
                      Fecha Jornada <SortIcon active={sortConfigActive?.key === "day"} direction={sortConfigActive?.direction || null} />
                    </th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedActiveCampaigns.map(c => (
                    <tr key={c.uuid} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                      <td className="p-4">
                        <p className="font-semibold text-white">{c.title}</p>
                        <p className="text-xs text-slate-500">Por: {c.author}</p>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{c.place}</td>
                      <td className="p-4 text-xs">
                        <p>{c.municipality}</p>
                        <p className="text-slate-500 font-bold uppercase text-[10px]">{c.state}</p>
                      </td>
                      <td className="p-4 text-xs font-semibold text-[#4ade80]">
                        {formatDateStr(c.date)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center items-center">
                          <button
                            onClick={() => {
                              setSelectedCampaignForPatients(c);
                              setIsPatientsModalOpen(true);
                            }}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white rounded-full transition-all border border-white/10 cursor-pointer"
                          >
                            Ver Pacientes
                          </button>
                          <button
                            onClick={() => handleToggleCampaignStatus(c)}
                            className="px-2 py-1 bg-[#9B0000]/10 hover:bg-[#9B0000] text-xs font-bold text-[#9B0000] hover:text-white rounded-full transition-all cursor-pointer"
                            title="Archivar"
                          >
                            Archivar
                          </button>
                          <button
                            onClick={() => handleEditClick(c)}
                            className="p-1 bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              setCampaignToDelete(c);
                              setIsConfirmOpen(true);
                            }}
                            className="p-1 bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {sortedActiveCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">No hay jornadas activas registradas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Inactive Campaigns */}
            <div className="p-4 bg-white/2 border-y border-white/5">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Historial / Concluidas ({inactiveCampaigns.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-500 uppercase tracking-widest bg-white/1">
                    <th className="p-4 cursor-pointer hover:bg-white/5" onClick={() => requestSortInactive("title")}>
                      Campaña <SortIcon active={sortConfigInactive?.key === "title"} direction={sortConfigInactive?.direction || null} />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-white/5" onClick={() => requestSortInactive("place")}>
                      Establecimiento <SortIcon active={sortConfigInactive?.key === "place"} direction={sortConfigInactive?.direction || null} />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-white/5" onClick={() => requestSortInactive("state")}>
                      Ubicación <SortIcon active={sortConfigInactive?.key === "state"} direction={sortConfigInactive?.direction || null} />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-white/5" onClick={() => requestSortInactive("day")}>
                      Fecha <SortIcon active={sortConfigInactive?.key === "day"} direction={sortConfigInactive?.direction || null} />
                    </th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInactiveCampaigns.map(c => (
                    <tr key={c.uuid} className="border-b border-white/5 hover:bg-white/1 text-sm text-slate-500">
                      <td className="p-4">
                        <p className="font-semibold text-slate-400">{c.title}</p>
                        <p className="text-[10px]">Por: {c.author}</p>
                      </td>
                      <td className="p-4">{c.place}</td>
                      <td className="p-4 text-xs">
                        <p>{c.municipality}</p>
                        <p className="font-bold uppercase text-[9px]">{c.state}</p>
                      </td>
                      <td className="p-4 text-xs">
                        {formatDateStr(c.date)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center items-center">
                          <button
                            onClick={() => {
                              setSelectedCampaignForPatients(c);
                              setIsPatientsModalOpen(true);
                            }}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white rounded-full transition-all border border-white/10 cursor-pointer"
                          >
                            Ver Pacientes
                          </button>
                          <button
                            onClick={() => handleToggleCampaignStatus(c)}
                            className="px-2 py-1 bg-[#006828]/10 hover:bg-[#006828] text-xs font-bold text-[#4ade80] hover:text-white rounded-full transition-all cursor-pointer"
                          >
                            Reactivar
                          </button>
                          <button
                            onClick={() => {
                              setCampaignToDelete(c);
                              setIsConfirmOpen(true);
                            }}
                            className="p-1 bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sortedInactiveCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-600">No hay jornadas archivadas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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
        {isConfirmOpen && campaignToDelete && (
          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => {
              setIsConfirmOpen(false);
              setCampaignToDelete(null);
            }}
            onConfirm={() => handleDeleteCampaign(campaignToDelete.uuid)}
            title="Eliminar Campaña"
            message={`¿Deseas eliminar la jornada "${campaignToDelete.title}" en "${campaignToDelete.place}" de manera permanente? Esta acción borrará la campaña de la base de datos.`}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
