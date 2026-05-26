"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";

const values = [
  {
    icon: "🤝",
    title: "Empatía",
    description: "Entendemos las necesidades de cada paciente y ofrecemos soluciones con calidez y cercanía."
  },
  {
    icon: "🎯",
    title: "Precisión",
    description: "Utilizamos tecnología clínica avanzada para garantizar la máxima exactitud en cada diagnóstico."
  },
  {
    icon: "💎",
    title: "Transparencia",
    description: "Diagnósticos honestos, precios justos y total claridad en todo lo que hacemos."
  },
  {
    icon: "🔥",
    title: "Compromiso",
    description: "Trabajamos día a día para llevar la salud visual al alcance de todas las comunidades de México."
  }
];

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#006828]/10 rounded-full blur-[120px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        
        <p className="text-[#006828] font-bold tracking-[0.2em] uppercase text-sm mb-4 relative z-10">
          Nuestra Esencia
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 relative z-10 leading-tight">
          Acerca de Nosotros
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto relative z-10 leading-relaxed">
          En DEFPOTEC MX, creemos que una visión clara es la ventana a un mundo lleno de oportunidades. 
          Conoce más sobre nuestro propósito y compromiso social.
        </p>
      </section>

      {/* Historia & Imagen */}
      <section className="container mx-auto px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Imagen de Nosotros */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative group rounded-3xl overflow-hidden border-4 border-[#006828]/20 aspect-[4/3] bg-neutral-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/about.jpg" 
              alt="Instalaciones de DEFPOTEC" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#4ade80] mb-1">Nuestras Unidades</p>
                <h3 className="text-xl font-bold text-white">Equipadas con tecnología diagnóstica de vanguardia</h3>
              </div>
            </div>
          </motion.div>

          {/* Texto Historia */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <span className="w-fit px-4 py-1.5 rounded-full border border-[#006828]/40 bg-[#006828]/10 text-sm text-[#4ade80]">
              Nuestra Historia
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Una trayectoria dedicada al cuidado visual
            </h2>
            <p className="text-slate-400 leading-relaxed">
              DEFPOTEC MX nació con el firme compromiso de hacer que la salud visual de alta calidad sea verdaderamente accesible para todos. A lo largo de los años, nos percatamos de que gran parte de la población no tiene un acceso fácil o frecuente a revisiones de la vista profesionales, lo que impacta directamente en su calidad de vida y desempeño diario.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Con esto en mente, desarrollamos un modelo innovador de **jornadas móviles de salud visual**, llevando equipamiento clínico avanzado directamente a empresas, escuelas y comunidades de todo el país. Creemos que una visión clara no debe ser un lujo, sino un derecho fundamental que transforma vidas y abre nuevas oportunidades.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Misión & Visión */}
      <section className="bg-[#111] py-20 border-y border-white/5">
        <div className="container mx-auto px-6 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#006828]/10 blur-2xl rounded-full" />
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🚀</span> Misión
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Brindar servicios de salud visual integrales, accesibles y confiables mediante tecnología clínica de punta y profesionales comprometidos. Buscamos mejorar el bienestar de cada paciente a través de la detección oportuna de problemas refractivos y de salud ocular.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#9B0000]/10 blur-2xl rounded-full" />
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">👁️</span> Visión
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Consolidarnos como la red de atención visual móvil líder en México, reconocida por nuestro impacto social positivo, excelencia en el diagnóstico y por hacer del cuidado visual de primer nivel un estándar accesible en todo el territorio nacional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Valores */}
      <section className="container mx-auto px-6 lg:px-16 py-24">
        <div className="text-center mb-16">
          <span className="text-[#006828] font-bold tracking-[0.2em] uppercase text-sm mb-3 block">Lo que nos guía</span>
          <h2 className="text-3xl md:text-4xl font-extrabold">Nuestros Valores</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#006828]/50 hover:scale-[1.02] transition-all"
            >
              <div className="text-4xl mb-4">{val.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{val.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{val.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Equipo / Médicos */}
      <section className="bg-[#111] py-24 border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-16">
            <span className="text-[#006828] font-bold tracking-[0.2em] uppercase text-sm mb-3 block">Nuestros Profesionales</span>
            <h2 className="text-3xl md:text-4xl font-extrabold">Nuestro Equipo Médico</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mt-3">
              Conoce al profesional que cuidará de tu salud visual de manera transparente, amable y segura.
            </p>
          </div>

          <div className="flex justify-center">
            {/* Card de Guillermo Osornio */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative max-w-sm w-full group rounded-3xl overflow-hidden border border-white/10 bg-[#161616] hover:border-[#006828]/50 hover:shadow-[0_0_30px_rgba(0,104,40,0.15)] transition-all duration-300"
            >
              {/* Imagen */}
              <div className="relative h-80 overflow-hidden bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/alfredo.jpeg" 
                  alt="Lic. Guillermo Osornio" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent" />
              </div>

              {/* Contenido */}
              <div className="p-6 text-center">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#006828]/25 text-[#4ade80] uppercase tracking-wider mb-3">
                  Lic. Optometrista
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">Guillermo Osornio</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Especialista en optometría clínica y diagnóstico visual avanzado con amplia experiencia en campañas y jornadas móviles de salud visual en todo el país.
                </p>

                {/* Redes Sociales */}
                <div className="flex justify-center gap-4 border-t border-white/10 pt-4">
                  <a 
                    href="https://www.facebook.com/defpotecmx/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                    </svg>
                  </a>
                  <a 
                    href="https://www.instagram.com/defpotecmx/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-[#0a0a0a] py-24 px-6 relative">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#006828] via-[#eab308] to-[#9B0000] rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-700" />
          <div className="relative bg-[#161616] rounded-3xl p-10 md:p-16 text-center border border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#006828] via-[#eab308] to-[#9B0000] rounded-t-3xl" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Quieres organizar una campaña visual?</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
              Llevamos nuestros servicios profesionales a tu empresa, escuela o comunidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contacto"
                className="px-8 py-4 bg-[#006828] hover:bg-[#00501f] text-white font-bold rounded-full transition-colors shadow-[0_0_20px_rgba(0,104,40,0.3)]"
              >
                Organizar Campaña
              </Link>
              <Link
                href="/jornadas"
                className="px-8 py-4 border border-white/20 hover:border-[#006828] text-white font-bold rounded-full transition-colors"
              >
                Ver Campañas Activas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
