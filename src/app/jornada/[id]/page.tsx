"use client";

import { use, useEffect, useState } from "react";
import { doc, getDoc, collection, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Header from "@/components/Header";

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
  maps?: string;
  endDate?: string;
};

type FormData = {
  name: string;
  phone: string;
  email: string;
  numberOfPatients: string;
};

export default function JornadaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15+: params is a Promise, must be unwrapped with React.use()
  const { id } = use(params);

  const [jornada, setJornada] = useState<DayTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedFolio, setGeneratedFolio] = useState("");
  const [form, setForm] = useState<FormData>({ name: "", phone: "", email: "", numberOfPatients: "1" });

  useEffect(() => {
    const fetchJornada = async () => {
      try {
        const docRef = doc(db, "dayTrip", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setJornada({ uuid: docSnap.id, ...docSnap.data() } as DayTrip);
        }
      } catch (error) {
        console.error("Error fetching jornada:", error);
        toast.error("Error al cargar la jornada.");
      } finally {
        setLoading(false);
      }
    };
    fetchJornada();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Por favor llena todos los campos requeridos.");
      return;
    }
    setSubmitting(true);
    try {
      const folioCode = generateFolioCode(5);

      // 1. Guardar en appointments
      await addDoc(collection(db, "appointments"), {
        name: form.name,
        phoneNumber: form.phone,
        email: form.email,
        numberOfPatients: Number(form.numberOfPatients),
        jornadaId: id,
        jornadaTitle: jornada?.title || "",
        jornadaDate: jornada?.date || "",
        jornadaState: jornada?.state || "",
        status: "pending",
        folioCode,
        createdAt: serverTimestamp(),
      });

      // 2. Guardar en folios para compatibilidad con panel de control
      await setDoc(doc(db, "folios", folioCode), {
        name: form.name,
        cellphone: form.phone,
        email: form.email,
        dayTrip: id,
        code: folioCode,
        hour: "",
        day: "",
        active: true,
        numberOfPatients: Number(form.numberOfPatients),
        createdAt: serverTimestamp(),
      });

      // 3. Registrar el mail para detonar correos automáticos con los datos de ubicación correctos
      await addDoc(collection(db, "mails"), {
        to: form.email || "contacto@defpotecmx.com",
        template: {
          name: 'Folio',
          data: {
            name: form.name,
            code: folioCode,
            startDate: jornada?.date || "",
            endDate: jornada?.endDate || jornada?.date || "",
            address: jornada?.address || jornada?.state || "",
            place: jornada?.place || "",
            title: jornada?.title || "",
          }
        }
      });

      setGeneratedFolio(folioCode);
      setSuccess(true);
      toast.success("¡Registro exitoso! Te esperamos en la campaña.");
      setForm({ name: "", phone: "", email: "", numberOfPatients: "1" });
    } catch (error) {
      console.error("Error registering appointment:", error);
      toast.error("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1a1a1a", color: "#fff", border: "1px solid #333" },
          success: { iconTheme: { primary: "#006828", secondary: "#fff" } },
          error: { iconTheme: { primary: "#9B0000", secondary: "#fff" } },
        }}
      />

      <Header />

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-[#006828] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !jornada ? (
        <div className="text-center py-32">
          <p className="text-slate-400 text-xl">No se encontró la jornada.</p>
          <Link href="/jornadas" className="mt-6 inline-block text-[#4ade80] underline">Volver a jornadas</Link>
        </div>
      ) : (
        <div className="container mx-auto px-6 lg:px-16 py-12">
          <Link 
            href="/jornadas" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-8 transition-colors"
          >
            ← Volver a todas las campañas
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Columna izquierda: Info de la jornada */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#006828]/40 bg-[#006828]/10 text-sm text-[#4ade80] mb-6">
                <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse" />
                Campaña Activa
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                {jornada.title} en {jornada.municipality || jornada.state}
              </h1>
              <p className="text-2xl text-slate-300 font-medium mb-8">
                {jornada.place ? `${jornada.place} · ` : ""}{jornada.state}
              </p>
 
              {/* Detalles */}
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Fecha</p>
                    <p className="text-white font-semibold">{jornada.date}</p>
                  </div>
                </div>
                
                {jornada.time && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-2xl">🕐</span>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Horario</p>
                      <p className="text-white font-semibold">{jornada.time}</p>
                    </div>
                  </div>
                )}
 
                {jornada.place && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Establecimiento</p>
                      <p className="text-white font-semibold">{jornada.place}</p>
                    </div>
                  </div>
                )}
 
                {jornada.address && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-2xl shrink-0 mt-0.5">📍</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Ubicación</p>
                      <p className="text-white font-semibold text-sm leading-snug break-words">{jornada.address}</p>
                      {jornada.maps && (
                        <a 
                          href={jornada.maps} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 text-xs text-[#4ade80] hover:underline font-bold mt-2"
                        >
                          🧭 Cómo llegar (Google Maps) →
                        </a>
                      )}
                    </div>
                  </div>
                )}
 
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Responsable</p>
                    <p className="text-white font-semibold">{jornada.author}</p>
                  </div>
                </div>
              </div>
 
              {/* Imagen */}
              {jornada.picture && (
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={jornada.picture} alt={jornada.title} className="w-full object-cover max-h-80 group-hover:scale-[1.02] transition-transform duration-500" />
                </div>
              )}
            </motion.div>

            {/* Columna derecha: Formulario */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-[#161616] border-t-4 border-[#006828] p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#006828]/10 blur-3xl pointer-events-none" />

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
                          Hemos apartado tu lugar en la campaña visual.
                        </p>
                      </div>

                      {/* Boleto de Folio Premium */}
                      <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-lg">
                        {/* Círculos laterales de corte de ticket */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-r-full bg-[#161616] border-r border-y border-white/10" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-l-full bg-[#161616] border-l border-y border-white/10" />
                        
                        {/* Encabezado del ticket */}
                        <div className="bg-[#006828]/10 px-6 py-4 border-b border-dashed border-white/10 text-left">
                          <p className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest mb-1">Pase Digital</p>
                          <h4 className="text-sm font-bold text-white truncate">{jornada.title}</h4>
                          <p className="text-xs text-slate-500">{jornada.state}</p>
                        </div>

                        {/* Código de Folio */}
                        <div className="px-6 py-6 flex flex-col items-center gap-2">
                          <p className="text-xs text-slate-400 font-medium">CÓDIGO DE FOLIO</p>
                          <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 px-6 py-3 rounded-xl shadow-inner relative group">
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

                      <div className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Te hemos enviado un correo electrónico de confirmación. Asegúrate de revisar tu carpeta de spam si no lo recibes en unos minutos.
                      </div>

                      <button
                        onClick={() => {
                          setSuccess(false);
                          setGeneratedFolio("");
                        }}
                        className="mt-2 px-8 py-3 bg-[#006828] hover:bg-[#00501f] text-white rounded-full text-sm font-bold transition-colors shadow-[0_0_15px_rgba(0,104,40,0.3)]"
                      >
                        Registrar otra persona
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h2 className="text-2xl font-bold mb-2">Registra tu Cita</h2>
                      <p className="text-slate-400 text-sm mb-8">
                        Completa el formulario para asegurar tu lugar en esta campaña visual.
                      </p>

                      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-300">Nombre Completo <span className="text-[#9B0000]">*</span></label>
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
                          <label className="text-sm font-medium text-slate-300">Teléfono / WhatsApp <span className="text-[#9B0000]">*</span></label>
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
                          <label className="text-sm font-medium text-slate-300">Número de pacientes</label>
                          <select
                            value={form.numberOfPatients}
                            onChange={e => setForm({ ...form, numberOfPatients: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all appearance-none"
                          >
                            {[1, 2, 3, 4, 5].map(n => (
                              <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                            ))}
                          </select>
                        </div>

                        {/* Info de la jornada dentro del form (readonly) */}
                        <div className="p-4 rounded-xl bg-[#006828]/10 border border-[#006828]/20 text-sm text-slate-300">
                          <p className="font-semibold text-[#4ade80] mb-1">{jornada.title}</p>
                          <p>📅 {jornada.date} — 📍 {jornada.state}</p>
                        </div>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="mt-2 w-full bg-[#006828] hover:bg-[#00501f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(0,104,40,0.3)] flex items-center justify-center gap-2"
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
            </motion.div>

          </div>
        </div>
      )}
    </div>
  );
}
