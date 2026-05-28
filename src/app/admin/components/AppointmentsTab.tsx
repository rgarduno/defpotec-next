"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, Folio } from "../context/AdminContext";
import ConfirmModal from "./ConfirmModal";
import { useSortableData, SortIcon } from "../../../hooks/useSortableData";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  endBefore, 
  limitToLast, 
  getDocs, 
  getCountFromServer 
} from "firebase/firestore";
import { db } from "@/firebase/config";

const PAGE_SIZE = 10;

export default function AppointmentsTab() {
  const {
    selectedYear,
    handleToggleFolioActive,
    handleDeleteFolio,
    refreshTrigger
  } = useAdmin();

  const [folios, setFolios] = useState<Folio[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageDocs, setPageDocs] = useState<{ [page: number]: { first: any; last: any } }>({});
  const [folioSearch, setFolioSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [folioToDelete, setFolioToDelete] = useState<any | null>(null);

  const { items: sortedFolios, requestSort, sortConfig } = useSortableData(folios);

  // Count total folios for selected year
  const fetchCount = async () => {
    try {
      const campSnap = await getDocs(
        query(collection(db, "dayTrip"), where("year", "==", selectedYear))
      );
      const campaignIds = campSnap.docs.map(doc => doc.id);
      
      if (campaignIds.length === 0) {
        setTotalCount(0);
        return;
      }

      // Count folios belonging to those campaigns (chunked to 30)
      const q = query(
        collection(db, "folios"),
        where("dayTrip", "in", campaignIds.slice(0, 30))
      );
      const snap = await getCountFromServer(q);
      setTotalCount(snap.data().count);
    } catch (err) {
      console.error("Error counting folios:", err);
    }
  };

  // Fetch folios
  const fetchFolios = async (page: number, direction: "next" | "prev" | "init" = "init", searchStr = "") => {
    setLoading(true);
    try {
      let q;
      const foliosRef = collection(db, "folios");

      if (searchStr.trim() !== "") {
        const s = searchStr.trim();
        if (s.length === 5 || s.length === 6) {
          // Exact folio code
          q = query(foliosRef, where("code", "==", s.toUpperCase()), limit(PAGE_SIZE));
        } else if (s.includes("@")) {
          // Exact email
          q = query(foliosRef, where("email", "==", s.toLowerCase()), limit(PAGE_SIZE));
        } else {
          // Name prefix
          const formattedSearch = s.charAt(0).toUpperCase() + s.slice(1);
          q = query(
            foliosRef,
            where("name", ">=", formattedSearch),
            where("name", "<=", formattedSearch + "\uf8ff"),
            limit(PAGE_SIZE)
          );
        }

        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folio));
        setFolios(data);
        setTotalCount(data.length);
        return;
      }

      // Regular list mode
      const campSnap = await getDocs(
        query(collection(db, "dayTrip"), where("year", "==", selectedYear))
      );
      const campaignIds = campSnap.docs.map(doc => doc.id);
      
      if (campaignIds.length === 0) {
        setFolios([]);
        setTotalCount(0);
        return;
      }

      const activeCampaignIds = campaignIds.slice(0, 30);

      if (direction === "next" && pageDocs[page - 1]?.last) {
        q = query(
          foliosRef,
          where("dayTrip", "in", activeCampaignIds),
          startAfter(pageDocs[page - 1].last),
          limit(PAGE_SIZE)
        );
      } else if (direction === "prev" && pageDocs[page + 1]?.first) {
        q = query(
          foliosRef,
          where("dayTrip", "in", activeCampaignIds),
          endBefore(pageDocs[page + 1].first),
          limitToLast(PAGE_SIZE)
        );
      } else {
        q = query(
          foliosRef,
          where("dayTrip", "in", activeCampaignIds),
          limit(PAGE_SIZE)
        );
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folio));
      setFolios(data);

      if (!snap.empty) {
        setPageDocs(prev => ({
          ...prev,
          [page]: {
            first: snap.docs[0],
            last: snap.docs[snap.docs.length - 1]
          }
        }));
      }
    } catch (err) {
      console.error("Error fetching folios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSearch === "") {
      fetchCount();
    }
    fetchFolios(1, "init", activeSearch);
    setCurrentPage(1);
  }, [selectedYear, refreshTrigger, activeSearch]);

  const handleNextPage = () => {
    if (activeSearch !== "") return; // No pagination in search results
    const nextPage = currentPage + 1;
    if (nextPage <= Math.ceil(totalCount / PAGE_SIZE)) {
      fetchFolios(nextPage, "next", "");
      setCurrentPage(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (activeSearch !== "") return; // No pagination in search results
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      fetchFolios(prevPage, "prev", "");
      setCurrentPage(prevPage);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(folioSearch);
  };

  const handleClearSearch = () => {
    setFolioSearch("");
    setActiveSearch("");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
      
      {/* SEARCH BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div>
          <h3 className="font-bold text-white">Buscador y Conciliador de Citas</h3>
          <p className="text-xs text-slate-400 mt-1">Busca por código de folio, nombre del paciente o correo electrónico.</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-grow sm:flex-grow-0">
            <input
              type="text"
              placeholder="Buscar folio (ej. DF98X o Laura)..."
              value={folioSearch}
              onChange={e => setFolioSearch(e.target.value)}
              className="w-full sm:w-80 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
            />
            {folioSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
          <button 
            type="submit" 
            className="bg-[#006828] hover:bg-[#00501f] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* APPOINTMENTS FOLIO LIST TABLE */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              {activeSearch ? `Resultados de Búsqueda: "${activeSearch}"` : `Listado General de Pacientes (${selectedYear})`}
            </h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Cargando citas...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                    <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("code")}>
                      Folio / Status <SortIcon active={sortConfig?.key === "code"} direction={sortConfig?.direction || null} />
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
                    <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("dayTrip")}>
                      ID Campaña <SortIcon active={sortConfig?.key === "dayTrip"} direction={sortConfig?.direction || null} />
                    </th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFolios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                        No se encontraron citas o folios registrados.
                      </td>
                    </tr>
                  ) : (
                    sortedFolios.map((folio) => (
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
            )}
          </div>
        </div>

        {/* PAGINATION CONTROLS */}
        {!activeSearch && (
          <div className="p-4 border-t border-white/5 bg-white/2 flex items-center justify-between text-xs text-slate-400">
            <div>
              Mostrando {folios.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0} - {Math.min(currentPage * PAGE_SIZE, totalCount)} de {totalCount} citas
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white font-bold rounded-lg border border-white/10 transition-colors cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE) || loading}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white font-bold rounded-lg border border-white/10 transition-colors cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
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
