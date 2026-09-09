"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { isValidEmail, isValidPhone } from "@/utils/validators";
import { getContactTargetEmail } from "@/config/mailConfig";

function generateFolioCode(length: number = 5): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

type DayTrip = {
  uuid: string;
  title: string;
  state: string;
  date: string;
  author: string;
  picture: string;
  status: string;
  municipality?: string;
  place?: string;
  address?: string;
  time?: string;
  endDate?: string;
  day?: number;
  month?: number;
  year?: number;
};

type FormData = {
  name: string;
  phone: string;
  email: string;
  numberOfPatients: string;
};

export default function CampaignsSection() {
  const [campaigns, setCampaigns] = useState<DayTrip[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    numberOfPatients: "1",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedFolio, setGeneratedFolio] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const q = query(
          collection(db, "dayTrip"),
          where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        const list: DayTrip[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ uuid: docSnap.id, ...docSnap.data() } as DayTrip);
        });
        setCampaigns(list);
        if (list.length > 0) {
          setSelectedCampaignId(list[0].uuid);
        }
      } catch (err) {
        console.error("Error al cargar campañas activas:", err);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !selectedCampaignId) {
      toast.error("Por favor llena todos los campos requeridos.");
      return;
    }
    if (!isValidPhone(form.phone)) {
      toast.error("El número de teléfono debe tener exactamente 10 dígitos.");
      return;
    }
    if (form.email && !isValidEmail(form.email)) {
      toast.error("Por favor ingresa un correo electrónico válido (ejemplo@dominio.com).");
      return;
    }

    const selectedJornada = campaigns.find(c => c.uuid === selectedCampaignId);
    if (!selectedJornada) {
      toast.error("Por favor selecciona una campaña disponible.");
      return;
    }

    setSubmitting(true);
    try {
      const folioCode = generateFolioCode(5);

      // 1. Guardar en appointments
      await addDoc(collection(db, "appointments"), {
        name: form.name.trim(),
        phoneNumber: form.phone.trim(),
        email: form.email.trim(),
        numberOfPatients: Number(form.numberOfPatients || 1),
        jornadaId: selectedJornada.uuid,
        jornadaTitle: selectedJornada.title || "",
        jornadaDate: selectedJornada.date || "",
        jornadaState: selectedJornada.state || "",
        status: "pending",
        folioCode,
        createdAt: serverTimestamp(),
      });

      // 2. Guardar en folios para compatibilidad con panel de administración
      await setDoc(doc(db, "folios", folioCode), {
        name: form.name.trim(),
        cellphone: form.phone.trim(),
        email: form.email.trim(),
        dayTrip: selectedJornada.uuid,
        code: folioCode,
        hour: "",
        day: typeof selectedJornada.day === "number" ? selectedJornada.day : (selectedJornada.date ? parseInt(selectedJornada.date.split(" ")[0]) || "" : ""),
        month: typeof selectedJornada.month === "number" ? selectedJornada.month : "",
        year: typeof selectedJornada.year === "number" ? selectedJornada.year : "",
        campaignTitle: selectedJornada.title || "",
        campaignDate: selectedJornada.date || "",
        active: true,
        numberOfPatients: Number(form.numberOfPatients || 1),
        createdAt: serverTimestamp(),
      });

      // 3. Notificación de correo electrónico
      await addDoc(collection(db, "mails"), {
        to: form.email.trim() || getContactTargetEmail(),
        message: {
          subject: `[Defpotec] Confirmación de Cita - Folio: ${folioCode}`,
          text: `Hola ${form.name.trim()}, tu cita para "${selectedJornada.title}" ha sido registrada. Código de Folio: ${folioCode}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
              <div style="border-bottom: 3px solid #006828; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="color: #006828; margin: 0;">DEFPOTEC MX - Confirmación de Cita</h2>
              </div>
              <p style="font-size: 15px; color: #333;">Hola <strong>${form.name.trim()}</strong>,</p>
              <p style="font-size: 14px; color: #555;">Tu cita ha sido agendada con éxito. Presenta tu código de folio al llegar a la consulta:</p>
              <div style="background-color: #f0fdf4; border: 2px dashed #006828; padding: 15px; text-align: center; border-radius: 10px; margin: 20px 0;">
                <span style="font-size: 12px; color: #666; font-weight: bold; display: block; margin-bottom: 4px;">CÓDIGO DE FOLIO</span>
                <span style="font-size: 28px; font-weight: 900; color: #006828; font-family: monospace; letter-spacing: 4px;">${folioCode}</span>
              </div>
              <p style="font-size: 14px; color: #333;"><strong>Campaña:</strong> ${selectedJornada.title}</p>
              <p style="font-size: 14px; color: #333;"><strong>Ubicación:</strong> ${selectedJornada.place || selectedJornada.state}</p>
              <p style="font-size: 14px; color: #333;"><strong>Fecha:</strong> ${selectedJornada.date}</p>
            </div>
          `,
        },
        template: {
          name: 'Folio',
          data: {
            name: form.name.trim(),
            code: folioCode,
            startDate: selectedJornada.date || "",
            endDate: selectedJornada.endDate || selectedJornada.date || "",
            address: selectedJornada.address || selectedJornada.state || "",
            place: selectedJornada.place || "",
            title: selectedJornada.title || "",
          }
        }
      });

      setGeneratedFolio(folioCode);
      setSuccess(true);
      toast.success("¡Registro exitoso! Te esperamos en la campaña.");
      setForm({ name: "", phone: "", email: "", numberOfPatients: "1" });
    } catch (error) {
      console.error("Error agendando cita desde Home:", error);
      toast.error("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCampaign = campaigns.find(c => c.uuid === selectedCampaignId);

  return (
    <section id="agendar-cita" className="w-full bg-[#0a0a0a] text-white py-24 relative overflow-hidden scroll-mt-20">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1a1a1a", color: "#fff", border: "1px solid #333" },
          success: { iconTheme: { primary: "#006828", secondary: "#fff" } },
          error: { iconTheme: { primary: "#9B0000", secondary: "#fff" } },
        }}
      />

      {/* Grid background effect */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        
        {/* Header de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#006828]/50 bg-[#006828]/20 text-[#4ade80] text-xs md:text-sm font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(0,104,40,0.3)]">
            <span>📅</span>
            <span>Agendar Examen Visual</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">
            Agenda tu Cita en 1 Minuto
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Selecciona la locación de la campaña más cercana en el formulario y completa tus datos para asegurar tu lugar sin costo de traslado.
          </p>
        </div>

        {/* Layout de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Columna Izquierda: Cronograma e info */}
          <div className="flex flex-col gap-6 justify-center">
            <p className="text-slate-400 text-lg leading-relaxed">
              Llevamos nuestras unidades de diagnóstico a diferentes locaciones. Revisa las campañas activas y asegura tu lugar con anticipación.
            </p>
            <ul className="flex flex-col gap-3 text-slate-400 text-sm">
              <li className="flex items-center gap-3"><span className="text-[#4ade80] text-xl">✔</span> Sin costo de traslado</li>
              <li className="flex items-center gap-3"><span className="text-[#4ade80] text-xl">✔</span> Equipo de optometría computarizada</li>
              <li className="flex items-center gap-3"><span className="text-[#4ade80] text-xl">✔</span> Personal calificado</li>
              <li className="flex items-center gap-3"><span className="text-[#4ade80] text-xl">✔</span> Agenda con anticipación en línea</li>
            </ul>

            {/* Tarjeta con resumen de campaña seleccionada si existe */}
            {selectedCampaign && (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4ade80]">Campaña Seleccionada</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#006828]/20 border border-[#006828]/40 text-[11px] text-[#4ade80] font-semibold">Activa</span>
                </div>
                <h4 className="text-lg font-bold text-white">{selectedCampaign.title}</h4>
                <p className="text-sm text-slate-300">📍 {selectedCampaign.place ? `${selectedCampaign.place}, ` : ""}{selectedCampaign.municipality || selectedCampaign.state}</p>
                <p className="text-xs text-slate-400">📅 {selectedCampaign.date}</p>
              </div>
            )}

            <Link
              href="/jornadas"
              className="mt-2 inline-flex items-center gap-2 px-8 py-4 bg-[#006828] hover:bg-[#00501f] text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(0,104,40,0.2)] w-max"
            >
              Ver campañas activas
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Columna Derecha: Formulario de Registro */}
          <div>
            <div className="bg-[#161616] border-t-4 border-[#006828] p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#006828]/10 blur-3xl pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-4 gap-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#006828]/20 border-2 border-[#006828] flex items-center justify-center text-3xl">
                      ✅
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">¡Registro Exitoso!</h3>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto">
                        Hemos apartado tu lugar en la campaña visual seleccionada.
                      </p>
                    </div>

                    {/* Ticket de Folio */}
                    <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-r-full bg-[#161616] border-r border-y border-white/10" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-l-full bg-[#161616] border-l border-y border-white/10" />
                      
                      <div className="bg-[#006828]/10 px-6 py-4 border-b border-dashed border-white/10 text-left">
                        <p className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest mb-1">Pase Digital</p>
                        <h4 className="text-sm font-bold text-white truncate">{selectedCampaign?.title}</h4>
                        <p className="text-xs text-slate-500">{selectedCampaign?.state}</p>
                      </div>

                      <div className="px-6 py-6 flex flex-col items-center gap-2">
                        <p className="text-xs text-slate-400 font-medium">CÓDIGO DE FOLIO</p>
                        <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 px-6 py-3 rounded-xl shadow-inner">
                          <span className="text-3xl font-black tracking-widest text-[#4ade80] font-mono select-all">
                            {generatedFolio}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedFolio);
                              toast.success("¡Código copiado al portapapeles!");
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white transition-colors"
                            title="Copiar código"
                          >
                            📋
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Presenta este código al llegar a tu consulta</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSuccess(false);
                        setGeneratedFolio("");
                      }}
                      className="mt-2 px-8 py-3 bg-[#006828] hover:bg-[#00501f] text-white rounded-full text-sm font-bold transition-colors shadow-[0_0_15px_rgba(0,104,40,0.3)]"
                    >
                      Registrar otra cita
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3 className="text-2xl font-bold mb-2">Registra tu Cita</h3>
                    <p className="text-slate-400 text-sm mb-8">Completa el formulario para asegurar tu lugar en la campaña visual seleccionada.</p>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">
                          Nombre Completo <span className="text-[#9B0000]">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="Escribe tu nombre" 
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">
                          Teléfono / WhatsApp <span className="text-[#9B0000]">*</span>
                        </label>
                        <input 
                          type="tel" 
                          placeholder="Ej. 5512345678" 
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">Correo electrónico</label>
                        <input 
                          type="email" 
                          placeholder="tu@correo.com" 
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">
                          Campaña y Ubicación <span className="text-[#9B0000]">*</span>
                        </label>
                        <select 
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all cursor-pointer"
                          value={selectedCampaignId}
                          onChange={e => setSelectedCampaignId(e.target.value)}
                          disabled={loadingCampaigns || campaigns.length === 0}
                          required
                        >
                          {loadingCampaigns ? (
                            <option value="" disabled className="text-slate-600">Cargando locaciones disponibles...</option>
                          ) : campaigns.length === 0 ? (
                            <option value="" disabled className="text-slate-600">No hay campañas activas actualmente</option>
                          ) : (
                            campaigns.map((c) => (
                              <option key={c.uuid} value={c.uuid} className="bg-[#161616] text-white py-2">
                                {c.title} — {c.municipality || c.state} ({c.date})
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">Número de personas</label>
                        <select 
                          value={form.numberOfPatients}
                          onChange={e => setForm({ ...form, numberOfPatients: e.target.value })}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n} className="bg-[#161616] text-white">
                              {n} {n === 1 ? "persona" : "personas"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button 
                        type="submit" 
                        disabled={submitting || loadingCampaigns || campaigns.length === 0}
                        className="mt-4 w-full bg-[#006828] hover:bg-[#00501f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(0,104,40,0.3)] flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            Registrando...
                          </>
                        ) : "Confirmar Registro"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
