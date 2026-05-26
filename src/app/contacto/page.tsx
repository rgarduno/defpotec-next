"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Header from "@/components/Header";

type FormData = {
  name: string;
  email: string;
  category: string;
  subject: string;
  description: string;
};

const contactCards = [
  {
    icon: "📞",
    title: "Teléfono",
    subtitle: "Contáctanos 24/7",
    lines: ["Oficina: 55 8995 0935", "Celular: 55 2897 3384"],
    href: "tel:+5589950935",
    color: "from-[#006828]/20 to-[#006828]/5",
    border: "border-[#006828]/30",
  },
  {
    icon: "✉️",
    title: "Correo Electrónico",
    subtitle: "Respuesta en 24 hrs",
    lines: ["contacto@defpotecmx.com"],
    href: "mailto:contacto@defpotecmx.com",
    color: "from-blue-900/20 to-blue-900/5",
    border: "border-blue-500/20",
  },
  {
    icon: "📍",
    title: "Matriz",
    subtitle: "Visítanos en persona",
    lines: ["Atenas #1 Int.1, Col. San Álvaro", "Azcapotzalco, CDMX"],
    href: "https://maps.google.com/?q=Atenas+1+San+Alvaro+Azcapotzalco+CDMX",
    color: "from-[#9B0000]/20 to-[#9B0000]/5",
    border: "border-[#9B0000]/30",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    category: "",
    subject: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject) {
      toast.error("Por favor llena los campos requeridos.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "mails"), {
        to: "contacto@defpotecmx.com",
        template: {
          name: 'Contact',
          data: {
            userName: form.name,
            userMail: form.email,
            category: form.category || "Duda general",
            subject: form.subject,
            description: form.description,
            acceptTermsAndConditions: true
          }
        }
      });
      setSuccess(true);
      toast.success("¡Mensaje enviado! Te contactaremos pronto.");
      setForm({ name: "", email: "", category: "", subject: "", description: "" });
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1a1a1a", color: "#fff", border: "1px solid #333" },
          success: { iconTheme: { primary: "#006828", secondary: "#fff" } },
          error: { iconTheme: { primary: "#9B0000", secondary: "#fff" } },
        }}
      />

      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden py-20 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#006828]/10 rounded-full blur-[100px] pointer-events-none" />
        <p className="text-[#006828] font-bold tracking-[0.2em] uppercase text-sm mb-4">Estamos aquí para ti</p>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Contáctanos</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Nuestro equipo está listo para resolver todas tus dudas sobre servicios, campañas y citas.
        </p>
      </div>

      <div className="container mx-auto px-6 lg:px-16 pb-24 flex flex-col gap-16">

        {/* Cards de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactCards.map((card, i) => (
            <motion.a
              key={i}
              href={card.href}
              target={card.title === "Matriz" ? "_blank" : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`group flex flex-col gap-4 p-6 rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} hover:scale-[1.02] transition-transform`}
            >
              <div className="text-4xl">{card.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                <p className="text-slate-500 text-sm mb-3">{card.subtitle}</p>
                {card.lines.map((line, j) => (
                  <p key={j} className="text-slate-300 text-sm">{line}</p>
                ))}
              </div>
              <div className="mt-auto flex items-center gap-1 text-sm text-[#4ade80] opacity-0 group-hover:opacity-100 transition-opacity">
                Abrir
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Formulario + Mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Formulario */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-[#161616] border-t-4 border-[#006828] p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#006828]/10 blur-3xl pointer-events-none" />

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-10 gap-5"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#006828]/20 border-2 border-[#006828] flex items-center justify-center text-4xl">
                      ✅
                    </div>
                    <h3 className="text-2xl font-bold">¡Mensaje recibido!</h3>
                    <p className="text-slate-400 max-w-xs">
                      Gracias por contactarnos. Nuestro equipo te responderá a la brevedad a <strong className="text-white">{form.email}</strong>.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="mt-2 px-6 py-2 border border-white/20 rounded-full text-sm text-slate-300 hover:border-[#006828] hover:text-white transition-colors"
                    >
                      Enviar otro mensaje
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-2xl font-bold mb-2">¡Estamos para servirte!</h2>
                    <p className="text-slate-400 text-sm mb-8">Completa el formulario y te contactaremos a la brevedad.</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-300">Tu nombre <span className="text-[#9B0000]">*</span></label>
                          <input
                            type="text"
                            placeholder="Nombre completo"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-300">Correo electrónico <span className="text-[#9B0000]">*</span></label>
                          <input
                            type="email"
                            placeholder="tu@correo.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">Razón / Categoría</label>
                        <select
                          value={form.category}
                          onChange={e => setForm({ ...form, category: e.target.value })}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all appearance-none"
                        >
                          <option value="">Elige la mejor opción</option>
                          <option value="Duda">Duda general</option>
                          <option value="Cotizacion">Cotización</option>
                          <option value="Servicio">Servicio</option>
                          <option value="Pagos">Pagos</option>
                          <option value="Campaña">Organizar Campaña</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">Asunto <span className="text-[#9B0000]">*</span></label>
                        <input
                          type="text"
                          placeholder="¿En qué te podemos ayudar?"
                          value={form.subject}
                          onChange={e => setForm({ ...form, subject: e.target.value })}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">Comentarios</label>
                        <textarea
                          rows={4}
                          placeholder="Agrega tus comentarios..."
                          value={form.description}
                          onChange={e => setForm({ ...form, description: e.target.value })}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="mt-2 w-full bg-[#006828] hover:bg-[#00501f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(0,104,40,0.3)] flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                            Enviando...
                          </>
                        ) : "Enviar Mensaje"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Mapa + WhatsApp CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* Mapa */}
            <div className="rounded-2xl overflow-hidden border border-white/10 h-72">
              <iframe
                title="Defpotec MX Ubicación"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3761.9!2d-99.1827!3d19.4893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAtenas+1+San+Alvaro+Azcapotzalco!5e0!3m2!1ses!2smx!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/5589950935?text=Hola%20Defpotec%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 p-6 rounded-2xl bg-[#006828]/10 border border-[#006828]/30 hover:bg-[#006828]/20 transition-colors group"
            >
              <div className="w-14 h-14 rounded-full bg-[#25D366]/20 flex items-center justify-center text-3xl shrink-0">
                💬
              </div>
              <div>
                <p className="font-bold text-white text-lg">Escríbenos por WhatsApp</p>
                <p className="text-slate-400 text-sm">Respuesta inmediata · 55 8995 0935</p>
              </div>
              <svg className="ml-auto text-[#4ade80] opacity-0 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

            {/* Horario */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                🕐 Horario de atención
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Lunes – Viernes</span>
                  <span className="text-white font-medium">9:00 – 18:00</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sábado</span>
                  <span className="text-white font-medium">10:00 – 14:00</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Domingo</span>
                  <span>Cerrado</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
