"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, State, Schedule } from "../context/AdminContext";
import ConfirmModal from "./ConfirmModal";
import { useSortableData, SortIcon } from "../../../hooks/useSortableData";
import { 
  collection, 
  query, 
  limit, 
  startAfter, 
  endBefore, 
  limitToLast, 
  getDocs, 
  getCountFromServer, 
  orderBy
} from "firebase/firestore";
import { db } from "@/firebase/config";

const defaultStateForm = {
  name: "",
  capital: "",
};

const PAGE_SIZE_SUBS = 5;

export default function CatalogTab() {
  const {
    selectedYear,
    handleStateSubmit,
    handleDeleteState,
    refreshTrigger
  } = useAdmin();

  // Local state for loaded database data
  const [statesList, setStatesList] = useState<State[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subCurrentPage, setSubCurrentPage] = useState(1);
  const [subsPageDocs, setSubsPageDocs] = useState<{ [page: number]: { first: any; last: any } }>({});
  const [loading, setLoading] = useState(true);

  const { items: sortedStates, requestSort, sortConfig } = useSortableData(statesList);

  const [stateForm, setStateForm] = useState(defaultStateForm);
  const [editingStateId, setEditingStateId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [stateToDelete, setStateToDelete] = useState<State | null>(null);

  // Fetch all catalogs on demand
  const fetchCatalogs = async () => {
    setLoading(true);
    try {
      // 1. Fetch States (Fully fetched since maximum 32 Mexican states)
      const statesSnap = await getDocs(query(collection(db, "states"), orderBy("name", "asc")));
      setStatesList(statesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as State)));

      // 2. Fetch Schedules (Fully fetched since typical size < 5 templates)
      const schedulesSnap = await getDocs(collection(db, "schedules"));
      setSchedules(schedulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule)));

      // 3. Fetch Subscribers/Newsletters (Paginated)
      await fetchSubscribersPage(1, "init");
    } catch (err) {
      console.error("Error loading catalogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribersPage = async (page: number, direction: "next" | "prev" | "init" = "init") => {
    try {
      const collName = "newsLetters";
      
      // Count total subscribers
      const countSnap = await getCountFromServer(collection(db, collName));
      setSubscribersCount(countSnap.data().count);

      let q;
      const ref = collection(db, collName);

      if (direction === "next" && subsPageDocs[page - 1]?.last) {
        q = query(ref, limit(PAGE_SIZE_SUBS), startAfter(subsPageDocs[page - 1].last));
      } else if (direction === "prev" && subsPageDocs[page + 1]?.first) {
        q = query(ref, limitToLast(PAGE_SIZE_SUBS), endBefore(subsPageDocs[page + 1].first));
      } else {
        q = query(ref, limit(PAGE_SIZE_SUBS));
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubscribers(data);

      if (!snap.empty) {
        setSubsPageDocs(prev => ({
          ...prev,
          [page]: {
            first: snap.docs[0],
            last: snap.docs[snap.docs.length - 1]
          }
        }));
      }
    } catch (err) {
      console.error("Error paginating subscribers:", err);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, [refreshTrigger]);

  const handleNextSubsPage = async () => {
    const nextPage = subCurrentPage + 1;
    if (nextPage <= Math.ceil(subscribersCount / PAGE_SIZE_SUBS)) {
      await fetchSubscribersPage(nextPage, "next");
      setSubCurrentPage(nextPage);
    }
  };

  const handlePrevSubsPage = async () => {
    const prevPage = subCurrentPage - 1;
    if (prevPage >= 1) {
      await fetchSubscribersPage(prevPage, "prev");
      setSubCurrentPage(prevPage);
    }
  };

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
            {loading ? (
              <div className="p-8 text-center text-slate-400">Cargando estados...</div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      {/* SCHEDULES, SERVICES AND SUBSCRIBERS INFO */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
        <h3 className="text-lg font-bold text-white mb-2 border-b border-white/5 pb-2">Catálogos Auxiliares</h3>

        <div className="p-4 rounded-xl border border-white/10 bg-white/2">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">🕐 Plantillas de Horarios</h4>
          <ul className="flex flex-col gap-2 text-xs text-slate-400">
            {loading ? (
              <li className="text-slate-500">Cargando horarios...</li>
            ) : (
              schedules.map(sch => (
                <li key={sch.id} className="flex justify-between border-b border-white/5 pb-1">
                  <span>{sch.name}</span>
                  <span className="text-[#4ade80]">Activa</span>
                </li>
              ))
            )}
            {!loading && schedules.length === 0 && <li>Predeterminado: 10:00 Hrs. a 18:00 Hrs.</li>}
          </ul>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/2 flex flex-col justify-between min-h-[220px]">
          <div>
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              😊 Suscriptores Boletín ({subscribersCount})
            </h4>
            <div className="overflow-y-auto max-h-[150px] flex flex-col gap-1.5 mt-2">
              {loading ? (
                <p className="text-xs text-slate-500">Cargando suscriptores...</p>
              ) : (
                subscribers.map((sub, idx) => (
                  <div key={sub.id || idx} className="flex items-center justify-between border-b border-white/5 pb-1 text-xs text-slate-400">
                    <span className="truncate max-w-[200px]" title={sub.newsLetterEmail || sub.email}>
                      {sub.newsLetterEmail || sub.email || "Sin correo"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono select-all truncate max-w-[80px]">
                      {sub.id}
                    </span>
                  </div>
                ))
              )}
              {!loading && subscribers.length === 0 && (
                <p className="text-xs text-slate-500">No hay suscriptores registrados.</p>
              )}
            </div>
          </div>

          {/* SUBSCRIBERS PAGINATION CONTROLS */}
          {subscribersCount > PAGE_SIZE_SUBS && (
            <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-2 text-[10px] text-slate-500">
              <span>Pág {subCurrentPage} de {Math.ceil(subscribersCount / PAGE_SIZE_SUBS)}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={handlePrevSubsPage}
                  disabled={subCurrentPage === 1 || loading}
                  className="px-2 py-0.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white font-bold rounded cursor-pointer"
                >
                  ◀
                </button>
                <button
                  onClick={handleNextSubsPage}
                  disabled={subCurrentPage >= Math.ceil(subscribersCount / PAGE_SIZE_SUBS) || loading}
                  className="px-2 py-0.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white font-bold rounded cursor-pointer"
                >
                  ▶
                </button>
              </div>
            </div>
          )}
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
