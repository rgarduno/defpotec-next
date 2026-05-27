"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, Contact } from "../context/AdminContext";
import ConfirmModal from "./ConfirmModal";
import { useSortableData, SortIcon } from "../../../hooks/useSortableData";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  endBefore, 
  limitToLast, 
  getDocs, 
  getCountFromServer 
} from "firebase/firestore";
import { db } from "@/firebase/config";

const defaultContactForm = {
  contactName: "",
  place: "",
  telephone: "",
  cellphone: "",
  schedule: "",
  maps: "",
  selectedState: "",
  selectedMunicipality: "",
  price: "",
  address: "",
  notes: "",
};

const PAGE_SIZE = 10;

export default function DirectoryTab() {
  const { handleContactSubmit, handleDeleteContact, refreshTrigger } = useAdmin();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageDocs, setPageDocs] = useState<{ [page: number]: { first: any; last: any } }>({});

  const { items: sortedContacts, requestSort, sortConfig } = useSortableData(contacts);

  const [contactForm, setContactForm] = useState(defaultContactForm);
  const [editingContactId, setEditingContactId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Count total contacts
  const fetchCount = async () => {
    try {
      const snap = await getCountFromServer(collection(db, "contacts"));
      setTotalCount(snap.data().count);
    } catch (err) {
      console.error("Error counting contacts:", err);
    }
  };

  // Fetch page data
  const fetchContacts = async (page: number, direction: "next" | "prev" | "init" = "init") => {
    setLoading(true);
    try {
      let q;
      const contactsRef = collection(db, "contacts");

      if (direction === "next" && pageDocs[page - 1]?.last) {
        q = query(
          contactsRef,
          orderBy("place", "asc"),
          startAfter(pageDocs[page - 1].last),
          limit(PAGE_SIZE)
        );
      } else if (direction === "prev" && pageDocs[page + 1]?.first) {
        q = query(
          contactsRef,
          orderBy("place", "asc"),
          endBefore(pageDocs[page + 1].first),
          limitToLast(PAGE_SIZE)
        );
      } else {
        q = query(
          contactsRef,
          orderBy("place", "asc"),
          limit(PAGE_SIZE)
        );
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
      setContacts(data);

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
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    fetchContacts(1, "init");
    setCurrentPage(1);
  }, [refreshTrigger]);

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= Math.ceil(totalCount / PAGE_SIZE)) {
      fetchContacts(nextPage, "next");
      setCurrentPage(nextPage);
    }
  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      fetchContacts(prevPage, "prev");
      setCurrentPage(prevPage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleContactSubmit(contactForm, editingContactId);
    if (success) {
      setContactForm(defaultContactForm);
      setEditingContactId("");
    }
  };

  const openEditContact = (contact: Contact) => {
    setEditingContactId(contact.id);
    setContactForm({
      contactName: contact.contactName || "",
      place: contact.place || "",
      telephone: contact.telephone || "",
      cellphone: contact.cellphone || "",
      schedule: contact.schedule || "",
      maps: contact.maps || "",
      selectedState: contact.selectedState || "",
      selectedMunicipality: contact.selectedMunicipality || "",
      price: contact.price || "249",
      address: contact.address || "",
      notes: contact.notes || "",
    });
  };

  const cancelEditContact = () => {
    setEditingContactId("");
    setContactForm(defaultContactForm);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* CREATE CONTACT FORM */}
      <div className="lg:col-span-1 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl h-max">
        <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-2">
          {editingContactId ? "Editar Sucursal / Lugar" : "Crear Sucursal / Lugar"}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Nombre del Contacto <span className="text-[#9B0000]">*</span></label>
            <input
              type="text"
              placeholder="Nombre responsable"
              value={contactForm.contactName}
              onChange={e => setContactForm({ ...contactForm, contactName: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Nombre del Establecimiento <span className="text-[#9B0000]">*</span></label>
            <input
              type="text"
              placeholder="Ej. Hotel Jardín, Plaza Central"
              value={contactForm.place}
              onChange={e => setContactForm({ ...contactForm, place: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Teléfono</label>
              <input
                type="text"
                placeholder="Oficina"
                value={contactForm.telephone}
                onChange={e => setContactForm({ ...contactForm, telephone: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Celular</label>
              <input
                type="text"
                placeholder="WhatsApp"
                value={contactForm.cellphone}
                onChange={e => setContactForm({ ...contactForm, cellphone: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Estado <span className="text-[#9B0000]">*</span></label>
              <input
                type="text"
                placeholder="Ej. Puebla, Hidalgo"
                value={contactForm.selectedState}
                onChange={e => setContactForm({ ...contactForm, selectedState: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Municipio <span className="text-[#9B0000]">*</span></label>
              <input
                type="text"
                placeholder="Ej. Huasca, Pahuatlán"
                value={contactForm.selectedMunicipality}
                onChange={e => setContactForm({ ...contactForm, selectedMunicipality: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Dirección Física <span className="text-[#9B0000]">*</span></label>
            <input
              type="text"
              placeholder="Calle, Número, Colonia, CP"
              value={contactForm.address}
              onChange={e => setContactForm({ ...contactForm, address: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Link de Google Maps</label>
            <input
              type="text"
              placeholder="https://maps.google.com/..."
              value={contactForm.maps}
              onChange={e => setContactForm({ ...contactForm, maps: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Horario de Atención</label>
              <input
                type="text"
                placeholder="Ej. 10AM a 6PM"
                value={contactForm.schedule}
                onChange={e => setContactForm({ ...contactForm, schedule: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Precio Base ($)</label>
              <input
                type="text"
                placeholder="Ej. 249"
                value={contactForm.price}
                onChange={e => setContactForm({ ...contactForm, price: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#006828]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Notas Adicionales</label>
            <textarea
              rows={2}
              placeholder="Observaciones..."
              value={contactForm.notes}
              onChange={e => setContactForm({ ...contactForm, notes: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828] resize-none"
            />
          </div>

          <div className="flex gap-3 mt-2">
            {editingContactId && (
              <button
                type="button"
                onClick={cancelEditContact}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-colors text-sm cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="flex-grow bg-[#006828] hover:bg-[#00501f] text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(0,104,40,0.3)] cursor-pointer"
            >
              {editingContactId ? "Guardar Cambios" : "Crear Contacto"}
            </button>
          </div>
        </form>
      </div>

      {/* LIST OF CONTACTS */}
      <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-white/5 bg-white/5">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Lugares Registrados (Directorio)</h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Cargando directorio...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                    <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("place")}>
                      Establecimiento / Contacto <SortIcon active={sortConfig?.key === "place"} direction={sortConfig?.direction || null} />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("selectedState")}>
                      Ubicación <SortIcon active={sortConfig?.key === "selectedState"} direction={sortConfig?.direction || null} />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("telephone")}>
                      Contacto / Tel <SortIcon active={sortConfig?.key === "telephone"} direction={sortConfig?.direction || null} />
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("address")}>
                      Dirección <SortIcon active={sortConfig?.key === "address"} direction={sortConfig?.direction || null} />
                    </th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedContacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                        No hay contactos en el directorio aún.
                      </td>
                    </tr>
                  ) : (
                    sortedContacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                        <td className="p-4">
                          <p className="font-semibold text-white">{contact.place}</p>
                          <p className="text-xs text-slate-500">{contact.contactName}</p>
                        </td>
                        <td className="p-4 text-xs">
                          {contact.selectedMunicipality}, {contact.selectedState}
                        </td>
                        <td className="p-4 text-xs">
                          <p>{contact.cellphone || contact.telephone || "S/T"}</p>
                          <p className="text-[10px] text-slate-500">{contact.schedule}</p>
                        </td>
                        <td className="p-4 text-xs text-slate-400 max-w-xs truncate" title={contact.address}>
                          {contact.address}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => openEditContact(contact)}
                              className="p-1.5 bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                setContactToDelete(contact);
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

        {/* PAGINATION CONTROLS */}
        <div className="p-4 border-t border-white/5 bg-white/2 flex items-center justify-between text-xs text-slate-400">
          <div>
            Mostrando {contacts.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0} - {Math.min(currentPage * PAGE_SIZE, totalCount)} de {totalCount} sucursales
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
      </div>
      <AnimatePresence>
        {isConfirmOpen && contactToDelete && (
          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => {
              setIsConfirmOpen(false);
              setContactToDelete(null);
            }}
            onConfirm={() => handleDeleteContact(contactToDelete.id)}
            title="Eliminar Contacto"
            message={`¿Deseas eliminar el establecimiento "${contactToDelete.place || contactToDelete.contactName}" del directorio permanentemente?`}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
