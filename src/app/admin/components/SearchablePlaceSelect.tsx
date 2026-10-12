"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Check, X, Building2, ChevronDown, Filter } from "lucide-react";
import { Contact } from "../context/AdminContext";

interface SearchablePlaceSelectProps {
  contacts: Contact[];
  selectedPlaceId: string;
  onSelect: (contactId: string) => void;
  required?: boolean;
}

// Utility to normalize string for accent-insensitive and case-insensitive search
const normalizeText = (text: string) => {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export default function SearchablePlaceSelect({
  contacts,
  selectedPlaceId,
  onSelect,
  required = false,
}: SearchablePlaceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStateFilter, setSelectedStateFilter] = useState("all");
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setSelectedStateFilter("all");
    }
  }, [isOpen]);

  // Current selected contact
  const selectedContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedPlaceId) || null;
  }, [contacts, selectedPlaceId]);

  // List of unique states for quick pill filters
  const availableStates = useMemo(() => {
    const statesMap = new Map<string, number>();
    contacts.forEach((c) => {
      const state = c.selectedState?.trim();
      if (state) {
        statesMap.set(state, (statesMap.get(state) || 0) + 1);
      }
    });

    return Array.from(statesMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [contacts]);

  // Filtered contacts based on search query & state filter
  const filteredContacts = useMemo(() => {
    const query = normalizeText(searchQuery);

    return contacts.filter((c) => {
      // 1. State filter
      if (selectedStateFilter !== "all" && c.selectedState !== selectedStateFilter) {
        return false;
      }

      // 2. Search query filter
      if (!query) return true;

      const placeNorm = normalizeText(c.place);
      const contactNameNorm = normalizeText(c.contactName);
      const municipalityNorm = normalizeText(c.selectedMunicipality);
      const stateNorm = normalizeText(c.selectedState);
      const addressNorm = normalizeText(c.address);

      return (
        placeNorm.includes(query) ||
        contactNameNorm.includes(query) ||
        municipalityNorm.includes(query) ||
        stateNorm.includes(query) ||
        addressNorm.includes(query)
      );
    });
  }, [contacts, searchQuery, selectedStateFilter]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect("");
  };

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(true)}
        className={`w-full bg-[#0a0a0a] border transition-all rounded-xl p-3 text-left cursor-pointer flex items-center justify-between gap-3 ${
          isOpen
            ? "border-[#006828] shadow-[0_0_15px_rgba(0,104,40,0.2)]"
            : selectedContact
            ? "border-white/20 hover:border-white/30"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              selectedContact
                ? "bg-[#006828]/20 text-[#006828] border border-[#006828]/40"
                : "bg-white/5 text-slate-400 border border-white/5"
            }`}
          >
            <Building2 className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            {selectedContact ? (
              <>
                <p className="text-white text-sm font-semibold truncate">
                  {selectedContact.place || selectedContact.contactName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-[#006828] shrink-0" />
                  <span className="truncate">
                    {selectedContact.selectedMunicipality ? `${selectedContact.selectedMunicipality}, ` : ""}
                    {selectedContact.selectedState || "Sin estado"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-400 text-sm">Buscar o seleccionar lugar...</p>
                <p className="text-slate-600 text-xs mt-0.5">Toca para filtrar por nombre, municipio o estado</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedContact && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
              title="Borrar selección"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#006828]" : ""
            }`}
          />
        </div>
      </div>

      {/* Hidden input to support HTML5 form required validation */}
      {required && (
        <input
          type="text"
          value={selectedPlaceId}
          onChange={() => {}}
          required={required}
          className="opacity-0 absolute pointer-events-none h-0 w-0"
          tabIndex={-1}
        />
      )}

      {/* Search & Select Overlay Modal / Bottom Sheet rendered via Portal to prevent modal clipping */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[70] flex flex-col justify-end md:justify-center items-center p-0 md:p-6 bg-black/80 backdrop-blur-sm">
                {/* Backdrop Click */}
                <div
                  className="absolute inset-0"
                  onClick={() => setIsOpen(false)}
                />

                {/* Modal Container */}
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 w-full max-w-2xl bg-[#161616] border border-white/15 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] md:max-h-[80vh] overflow-hidden"
                >
                  {/* Decorative top accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#006828]" />

                  {/* Header */}
                  <div className="p-5 pb-3 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#006828]/20 border border-[#006828]/30 flex items-center justify-center text-[#006828]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight">
                          Seleccionar Establecimiento
                        </h4>
                        <p className="text-xs text-slate-400">
                          {contacts.length} lugares registrados en el directorio
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search Bar Input */}
                  <div className="p-4 pb-2 shrink-0">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por lugar, municipio o estado (ej. Tenango, Toluca, Hotel)..."
                        className="w-full bg-[#0a0a0a] border border-white/15 focus:border-[#006828] focus:ring-1 focus:ring-[#006828] rounded-xl pl-10 pr-9 py-3 text-white placeholder-slate-500 text-sm focus:outline-none transition-all"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick State Filter Pills */}
                  {availableStates.length > 0 && (
                    <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-[#006828]" />
                        Estado:
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStateFilter("all")}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                          selectedStateFilter === "all"
                            ? "bg-[#006828] text-white shadow-[0_0_10px_rgba(0,104,40,0.4)]"
                            : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        Todos ({contacts.length})
                      </button>
                      {availableStates.map((st) => (
                        <button
                          key={st.name}
                          type="button"
                          onClick={() => setSelectedStateFilter(st.name)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                            selectedStateFilter === st.name
                              ? "bg-[#006828] text-white shadow-[0_0_10px_rgba(0,104,40,0.4)]"
                              : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {st.name} ({st.count})
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results Count Bar */}
                  <div className="px-5 py-2 bg-black/40 border-y border-white/5 flex items-center justify-between text-xs text-slate-400 shrink-0">
                    <span>
                      Mostrando <strong className="text-white">{filteredContacts.length}</strong> de{" "}
                      {contacts.length} lugares
                    </span>
                    {(searchQuery || selectedStateFilter !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedStateFilter("all");
                        }}
                        className="text-[#006828] hover:underline font-medium text-xs cursor-pointer"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>

                  {/* Scrollable List of Places */}
                  <div className="flex-1 overflow-y-auto p-3 divide-y divide-white/5">
                    {filteredContacts.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 text-slate-500 flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6" />
                        </div>
                        <p className="text-white font-medium text-sm">No se encontraron lugares</p>
                        <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                          No hay resultados para "{searchQuery}". Intenta buscar con otro término o revisa el estado seleccionado.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedStateFilter("all");
                          }}
                          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Mostrar todos los lugares
                        </button>
                      </div>
                    ) : (
                      filteredContacts.map((c) => {
                        const isSelected = c.id === selectedPlaceId;
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleSelect(c.id)}
                            className={`p-3.5 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                              isSelected
                                ? "bg-[#006828]/20 border border-[#006828]/50"
                                : "hover:bg-white/5 active:bg-white/10"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="text-white text-sm font-semibold truncate group-hover:text-[#4ade80] transition-colors">
                                  {c.place || c.contactName}
                                </h5>
                                {c.selectedState && (
                                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                                    {c.selectedState}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 truncate">
                                <MapPin className="w-3.5 h-3.5 text-[#006828] shrink-0" />
                                <span className="truncate">
                                  {c.selectedMunicipality ? `${c.selectedMunicipality}` : ""}
                                  {c.address ? ` • ${c.address}` : ""}
                                </span>
                              </div>

                              {c.schedule && (
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                  🕒 Horario: {c.schedule}
                                </p>
                              )}
                            </div>

                            <div className="shrink-0 flex items-center">
                              {isSelected ? (
                                <div className="w-7 h-7 rounded-full bg-[#006828] text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,104,40,0.5)]">
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-full border border-white/10 group-hover:border-[#006828] flex items-center justify-center text-transparent group-hover:text-[#006828] transition-colors">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer note */}
                  <div className="p-3 bg-[#0f0f0f] border-t border-white/10 text-center text-xs text-slate-500 shrink-0">
                    💡 Si el lugar no aparece en la lista, puedes registrarlo en la pestaña{" "}
                    <strong className="text-slate-400">Directorio</strong>.
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
