"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import { exportToCsvData } from "@/utils/exportToCsv";

export type MailItem = {
  id: string;
  to: string;
  message?: {
    subject?: string;
    text?: string;
    html?: string;
  };
  template?: {
    name?: string;
    data?: {
      userName?: string;
      userMail?: string;
      category?: string;
      subject?: string;
      description?: string;
      name?: string;
      code?: string;
      title?: string;
      startDate?: string;
      address?: string;
    };
  };
  delivery?: {
    state?: "SUCCESS" | "ERROR" | "PENDING" | "PROCESSING" | string;
    error?: string;
    attempts?: number;
    startTime?: any;
    endTime?: any;
  };
  createdAt?: any;
};

export default function MailsTab() {
  const [mails, setMails] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "contact" | "folio" | "error">("all");
  
  // Selected mail for detail view modal
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
  
  // Delete confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [mailToDelete, setMailToDelete] = useState<MailItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Listen to real-time updates on `mails` collection
    const q = query(collection(db, "mails"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: MailItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as MailItem);
        });
        
        // Sort descending by creation date / ID
        list.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          if (timeA !== timeB) return timeB - timeA;
          return b.id.localeCompare(a.id);
        });

        setMails(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error cargando mensajes en vivo:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtering
  const filteredMails = mails.filter((mail) => {
    const isContact = mail.template?.name === "Contact" || mail.message?.subject?.includes("Contacto");
    const isFolio = mail.template?.name === "Folio" || mail.message?.subject?.includes("Folio");
    const isError = mail.delivery?.state === "ERROR";

    if (filterCategory === "contact" && !isContact) return false;
    if (filterCategory === "folio" && !isFolio) return false;
    if (filterCategory === "error" && !isError) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const senderName = (mail.template?.data?.userName || mail.template?.data?.name || "").toLowerCase();
    const senderMail = (mail.template?.data?.userMail || mail.to || "").toLowerCase();
    const subject = (mail.message?.subject || mail.template?.data?.subject || "").toLowerCase();
    const desc = (mail.template?.data?.description || mail.message?.text || "").toLowerCase();

    return (
      senderName.includes(term) ||
      senderMail.includes(term) ||
      subject.includes(term) ||
      desc.includes(term)
    );
  });

  const handleDeleteClick = (mail: MailItem) => {
    setMailToDelete(mail);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mailToDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "mails", mailToDelete.id));
      toast.success("Mensaje eliminado de la base de datos.");
      setIsConfirmOpen(false);
      setMailToDelete(null);
      if (selectedMail?.id === mailToDelete.id) {
        setSelectedMail(null);
      }
    } catch (err) {
      console.error("Error al eliminar mensaje:", err);
      toast.error("Ocurrió un error al eliminar el mensaje.");
    } finally {
      setDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (mails.length === 0) {
      toast.error("No hay mensajes para exportar.");
      return;
    }
    const dataToExport = filteredMails.map((m) => {
      const senderName = m.template?.data?.userName || m.template?.data?.name || "N/A";
      const senderEmail = m.template?.data?.userMail || m.to || "N/A";
      const subject = m.message?.subject || m.template?.data?.subject || "N/A";
      const category = m.template?.data?.category || m.template?.name || "Contacto";
      const description = m.template?.data?.description || m.message?.text || "";
      const status = m.delivery?.state || "PENDING";
      const date = m.createdAt?.seconds 
        ? new Date(m.createdAt.seconds * 1000).toLocaleString("es-MX") 
        : "N/A";

      return {
        ID: m.id,
        "Fecha": date,
        "Tipo": category,
        "Remitente": senderName,
        "Correo Remitente": senderEmail,
        "Destinatario": m.to,
        "Asunto": subject,
        "Estado Envío": status,
        "Detalle Error": m.delivery?.error || "",
        "Mensaje": description.replace(/[\r\n]+/g, " "),
      };
    });

    exportToCsvData(dataToExport, `mensajes_defpotec_${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("Exportación CSV generada con éxito.");
  };

  // Count metrics
  const totalCount = mails.length;
  const contactCount = mails.filter(m => m.template?.name === "Contact" || m.message?.subject?.includes("Contacto")).length;
  const folioCount = mails.filter(m => m.template?.name === "Folio" || m.message?.subject?.includes("Folio")).length;
  const errorCount = mails.filter(m => m.delivery?.state === "ERROR").length;

  return (
    <div className="flex flex-col gap-8">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1a1a1a", color: "#fff", border: "1px solid #333" },
          success: { iconTheme: { primary: "#006828", secondary: "#fff" } },
          error: { iconTheme: { primary: "#9B0000", secondary: "#fff" } },
        }}
      />

      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>✉️</span> Mensajes y Notificaciones
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Bandeja de mensajes de contacto y notificaciones enviadas a pacientes.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 rounded-xl bg-[#006828] hover:bg-[#00501f] text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(0,104,40,0.3)] flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <span>📥</span> Exportar CSV
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterCategory("all")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === "all" ? "bg-[#006828]/20 border-[#006828]" : "bg-[#111] border-white/10 hover:border-white/20"
          }`}
        >
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Mensajes</p>
          <p className="text-3xl font-black text-white mt-1">{totalCount}</p>
        </div>

        <div 
          onClick={() => setFilterCategory("contact")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === "contact" ? "bg-[#006828]/20 border-[#006828]" : "bg-[#111] border-white/10 hover:border-white/20"
          }`}
        >
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Formularios de Contacto</p>
          <p className="text-3xl font-black text-[#4ade80] mt-1">{contactCount}</p>
        </div>

        <div 
          onClick={() => setFilterCategory("folio")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === "folio" ? "bg-[#006828]/20 border-[#006828]" : "bg-[#111] border-white/10 hover:border-white/20"
          }`}
        >
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Folios de Citas</p>
          <p className="text-3xl font-black text-blue-400 mt-1">{folioCount}</p>
        </div>

        <div 
          onClick={() => setFilterCategory("error")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === "error" ? "bg-[#9B0000]/20 border-[#9B0000]" : "bg-[#111] border-white/10 hover:border-white/20"
          }`}
        >
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Errores de Envío</p>
          <p className="text-3xl font-black text-[#ef4444] mt-1">{errorCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#111] p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === "all" ? "bg-white text-black" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setFilterCategory("contact")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === "contact" ? "bg-[#006828] text-white" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Contacto ({contactCount})
          </button>
          <button
            onClick={() => setFilterCategory("folio")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === "folio" ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Folios ({folioCount})
          </button>
          <button
            onClick={() => setFilterCategory("error")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterCategory === "error" ? "bg-[#9B0000] text-white" : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            Errores ({errorCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre, correo, asunto o mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#006828]"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#006828] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Cargando mensajes en tiempo real...</p>
          </div>
        ) : filteredMails.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <h3 className="text-lg font-bold text-white">No se encontraron mensajes</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              {searchTerm 
                ? "No hay resultados que coincidan con los criterios de búsqueda."
                : "Aún no hay mensajes recibidos en esta categoría."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#161616] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Remitente / Usuario</th>
                  <th className="p-4">Asunto / Categoría</th>
                  <th className="p-4">Destinatario</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMails.map((mail) => {
                  const senderName = mail.template?.data?.userName || mail.template?.data?.name || "Usuario Web";
                  const senderEmail = mail.template?.data?.userMail || mail.to || "N/A";
                  const subject = mail.message?.subject || mail.template?.data?.subject || (mail.template?.name === "Folio" ? `Folio: ${mail.template?.data?.code}` : "Contacto");
                  const category = mail.template?.data?.category || mail.template?.name || "Contacto";
                  const state = mail.delivery?.state || "PENDING";
                  
                  const formattedDate = mail.createdAt?.seconds
                    ? new Date(mail.createdAt.seconds * 1000).toLocaleString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Reciente";

                  return (
                    <tr 
                      key={mail.id} 
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => setSelectedMail(mail)}
                    >
                      <td className="p-4 whitespace-nowrap">
                        {state === "SUCCESS" ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#006828]/20 border border-[#006828]/40 text-[#4ade80] text-[11px] font-bold inline-flex items-center gap-1">
                            <span>✓</span> Entregado
                          </span>
                        ) : state === "ERROR" ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#9B0000]/20 border border-[#9B0000]/40 text-[#ef4444] text-[11px] font-bold inline-flex items-center gap-1" title={mail.delivery?.error}>
                            <span>⚠️</span> Error SMTP
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold inline-flex items-center gap-1">
                            <span>⏳</span> Procesando
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-medium text-white">
                        <p className="font-bold">{senderName}</p>
                        <p className="text-[11px] text-slate-500">{senderEmail}</p>
                      </td>

                      <td className="p-4 max-w-xs truncate">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-400 font-semibold mr-2 uppercase">
                          {category}
                        </span>
                        <span className="text-slate-200">{subject}</span>
                      </td>

                      <td className="p-4 text-slate-400 text-[11px] font-mono">
                        {mail.to}
                      </td>

                      <td className="p-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {formattedDate}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedMail(mail)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white transition-colors"
                            title="Ver detalle del mensaje"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDeleteClick(mail)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-[#9B0000] text-slate-400 hover:text-white transition-colors"
                            title="Eliminar mensaje"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalle de Mensaje */}
      <AnimatePresence>
        {selectedMail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161616] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Encabezado Modal */}
              <div className="p-6 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✉️</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Detalles del Mensaje</h3>
                    <p className="text-xs text-slate-500">ID: {selectedMail.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMail(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Contenido Modal */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-slate-300">
                {/* Status alert if error */}
                {selectedMail.delivery?.state === "ERROR" && (
                  <div className="p-4 rounded-xl bg-[#9B0000]/10 border border-[#9B0000]/30 text-red-200 space-y-1">
                    <p className="font-bold flex items-center gap-1 text-sm text-[#ef4444]">
                      <span>⚠️</span> Error en el Servidor SMTP de Firebase:
                    </p>
                    <p className="font-mono text-[11px] bg-black/40 p-2.5 rounded-lg border border-red-500/20 text-red-300 break-all select-all">
                      {selectedMail.delivery.error}
                    </p>
                  </div>
                )}

                {/* Grid datos clave */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0a0a0a] p-4 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Remitente:</span>
                    <p className="text-white font-bold text-sm mt-0.5">
                      {selectedMail.template?.data?.userName || selectedMail.template?.data?.name || "Usuario Web"}
                    </p>
                    <p className="text-slate-400">{selectedMail.template?.data?.userMail || "Sin correo especificado"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Destinatario (to):</span>
                    <p className="text-white font-mono text-sm mt-0.5">{selectedMail.to}</p>
                    <p className="text-slate-400">Categoría: {selectedMail.template?.data?.category || selectedMail.template?.name || "Contacto"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Asunto:</span>
                    <p className="text-white font-semibold mt-0.5">
                      {selectedMail.message?.subject || selectedMail.template?.data?.subject || "Sin asunto"}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Estado de Envío:</span>
                    <p className="mt-0.5 font-bold">
                      {selectedMail.delivery?.state === "SUCCESS" && <span className="text-[#4ade80]">✓ Entregado</span>}
                      {selectedMail.delivery?.state === "ERROR" && <span className="text-[#ef4444]">⚠️ Falló (Error SMTP)</span>}
                      {(!selectedMail.delivery?.state || selectedMail.delivery?.state === "PENDING") && <span className="text-amber-400">⏳ En Espera / Procesando</span>}
                    </p>
                  </div>
                </div>

                {/* Mensaje principal */}
                <div>
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">Contenido del Mensaje:</h4>
                  <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/10 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedMail.template?.data?.description || selectedMail.message?.text || "Sin contenido de texto registrado."}
                  </div>
                </div>

                {/* Si es folio, muestra datos adicionales */}
                {selectedMail.template?.data?.code && (
                  <div className="p-4 rounded-2xl bg-[#006828]/10 border border-[#006828]/30 space-y-1">
                    <p className="text-[#4ade80] font-bold text-xs uppercase tracking-wider">Datos de Cita Registrada</p>
                    <p className="text-white text-sm"><strong>Folio:</strong> <span className="font-mono text-[#4ade80] font-bold">{selectedMail.template.data.code}</span></p>
                    <p className="text-slate-300"><strong>Campaña:</strong> {selectedMail.template.data.title}</p>
                    <p className="text-slate-300"><strong>Fecha / Ubicación:</strong> {selectedMail.template.data.startDate} — {selectedMail.template.data.address}</p>
                  </div>
                )}
              </div>

              {/* Pie del modal */}
              <div className="p-4 bg-[#0a0a0a] border-t border-white/10 flex justify-between items-center">
                <button
                  onClick={() => handleDeleteClick(selectedMail)}
                  className="px-4 py-2 rounded-xl bg-[#9B0000]/20 hover:bg-[#9B0000] text-red-200 hover:text-white font-bold transition-all text-xs flex items-center gap-1.5"
                >
                  <span>🗑️</span> Eliminar Mensaje
                </button>

                <button
                  onClick={() => setSelectedMail(null)}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-xs"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Eliminar Mensaje"
        message={`¿Estás seguro de que deseas eliminar permanentemente el mensaje de "${mailToDelete?.template?.data?.userName || mailToDelete?.template?.data?.name || mailToDelete?.to}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsConfirmOpen(false);
          setMailToDelete(null);
        }}
      />
    </div>
  );
}
