"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";

const services = [
  {
    icon: "👁️",
    tag: "Diagnóstico",
    title: "Examen Visual Computarizado",
    description:
      "Utilizamos tecnología de punta para medir con precisión tu agudeza visual, detectar miopía, hipermetropía, astigmatismo y otras condiciones con resultados en minutos.",
    features: ["Refracción automática", "Tonometría", "Biomicroscopía"],
    color: "from-[#006828]/20 to-transparent",
    border: "border-[#006828]/30",
    accent: "#4ade80",
  },
  {
    icon: "🚌",
    tag: "Campaña Móvil",
    title: "Revisión Visual a Domicilio",
    description:
      "Llevamos nuestra unidad de diagnóstico directamente a tu empresa, escuela o comunidad. Sin costo de traslado, con todo el equipo necesario para atender a tu equipo.",
    features: ["Sin costo de traslado", "Equipo completo", "Atención en sitio"],
    color: "from-blue-900/20 to-transparent",
    border: "border-blue-500/20",
    accent: "#60a5fa",
  },
  {
    icon: "🔬",
    tag: "Especialidad",
    title: "Optometría Avanzada",
    description:
      "Nuestros especialistas en optometría realizan evaluaciones completas que van más allá de la simple lectura de letras: topografía corneal, análisis de la visión binocular y más.",
    features: ["Topografía corneal", "Visión binocular", "Salud ocular integral"],
    color: "from-purple-900/20 to-transparent",
    border: "border-purple-500/20",
    accent: "#c084fc",
  },
  {
    icon: "👓",
    tag: "Óptica",
    title: "Lentes y Armazones Premium",
    description:
      "Contamos con una amplia selección de armazones de las mejores marcas y lentes de última generación: antirreflejantes, fotocromáticos, de contacto y más.",
    features: ["Armazones de marca", "Lentes antirreflejantes", "Lentes de contacto"],
    color: "from-amber-900/20 to-transparent",
    border: "border-amber-500/20",
    accent: "#fbbf24",
  },
  {
    icon: "🏥",
    tag: "Empresarial",
    title: "Programa para Empresas",
    description:
      "Diseñamos planes de salud visual para empresas: revisiones periódicas, atención preventiva y descuentos especiales para todos los colaboradores de tu organización.",
    features: ["Planes corporativos", "Atención preventiva", "Descuentos especiales"],
    color: "from-[#006828]/20 to-transparent",
    border: "border-[#006828]/30",
    accent: "#4ade80",
  },
  {
    icon: "📅",
    tag: "Agenda",
    title: "Citas en Línea 24/7",
    description:
      "Agenda tu cita de manera sencilla desde cualquier dispositivo, en cualquier momento. Selecciona la campaña más cercana a ti y reserva tu lugar al instante.",
    features: ["Disponible 24/7", "Confirmación inmediata", "Recordatorio por WhatsApp"],
    color: "from-[#9B0000]/20 to-transparent",
    border: "border-[#9B0000]/30",
    accent: "#f87171",
  },
];

const testimonials = [
  {
    name: "Laura M.",
    role: "Directora de RRHH",
    company: "Empresa manufacturera",
    text: "Organizamos una campaña visual para nuestros 120 colaboradores. El equipo de DEFPOTEC fue increíblemente profesional, puntual y eficiente. ¡Lo recomiendo totalmente!",
    rating: 5,
    initials: "LM",
    color: "bg-[#006828]",
  },
  {
    name: "Carlos V.",
    role: "Padre de familia",
    company: "Colonia Roma, CDMX",
    text: "Detectaron que mi hijo necesitaba lentes desde la primera revisión. En otras clínicas no lo habían notado. Excelente atención y muy buenos precios.",
    rating: 5,
    initials: "CV",
    color: "bg-blue-600",
  },
  {
    name: "Sofía R.",
    role: "Coordinadora de Bienestar",
    company: "Centro educativo",
    text: "La campaña en nuestra escuela fue todo un éxito. Los niños se emocionaron y los padres quedaron muy satisfechos con los resultados y la atención del personal.",
    rating: 5,
    initials: "SR",
    color: "bg-purple-600",
  },
  {
    name: "Miguel A.",
    role: "Paciente frecuente",
    company: "Ciudad de México",
    text: "Llevo 3 años siendo paciente de DEFPOTEC. Siempre me tratan con calidad y calidez. Sus lentes son de excelente calidad y el precio es justo.",
    rating: 5,
    initials: "MA",
    color: "bg-[#9B0000]",
  },
];

const stats = [
  { value: "10+", label: "Años de experiencia" },
  { value: "5,000+", label: "Pacientes atendidos" },
  { value: "200+", label: "Campañas realizadas" },
  { value: "98%", label: "Satisfacción" },
];

export default function ServiciosPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden py-24 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#006828]/10 rounded-full blur-[120px] pointer-events-none" />
        {/* Grid bg */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <p className="text-[#006828] font-bold tracking-[0.2em] uppercase text-sm mb-4 relative z-10">
          Lo que hacemos por ti
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 relative z-10 leading-tight">
          Nuestros Servicios
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto relative z-10">
          Combinamos tecnología de vanguardia con la calidez humana para brindarte una experiencia visual de primer nivel.
        </p>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-6 lg:px-16 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
            >
              <p className="text-3xl md:text-4xl font-extrabold text-[#4ade80] mb-1">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-6 lg:px-16 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`group relative flex flex-col gap-5 p-7 rounded-2xl border ${service.border} bg-gradient-to-br ${service.color} hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,104,40,0.1)] overflow-hidden`}
            >
              {/* Tag */}
              <span
                className="inline-flex items-center w-max px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ color: service.accent, background: `${service.accent}18` }}
              >
                {service.tag}
              </span>

              {/* Icon */}
              <div className="text-5xl">{service.icon}</div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#4ade80] transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{service.description}</p>

                {/* Features */}
                <ul className="flex flex-col gap-2">
                  {service.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <span style={{ color: service.accent }}>✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="relative">
          {/* Section Title */}
          <div className="text-center mb-12">
            <p className="text-[#006828] font-bold tracking-[0.2em] uppercase text-sm mb-3">Voces de nuestros pacientes</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">¿Qué dicen de nosotros?</h2>
          </div>

          {/* Testimonials Carousel */}
          <div className="relative max-w-4xl mx-auto">
            {/* Active Testimonial */}
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#161616] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden mb-8"
            >
              {/* Quote mark */}
              <div className="absolute top-6 right-8 text-8xl text-white/5 font-serif leading-none select-none">&ldquo;</div>

              <div className="flex items-start gap-6">
                <div className={`w-14 h-14 rounded-full ${testimonials[activeTestimonial].color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {testimonials[activeTestimonial].initials}
                </div>
                <div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-slate-200 text-lg leading-relaxed mb-6 italic">
                    &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                  </p>
                  <div>
                    <p className="font-bold text-white">{testimonials[activeTestimonial].name}</p>
                    <p className="text-slate-500 text-sm">
                      {testimonials[activeTestimonial].role} · {testimonials[activeTestimonial].company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Selector pills */}
            <div className="flex justify-center gap-3">
              {testimonials.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTestimonial === i
                      ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {t.initials[0]}
                  </div>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="relative mt-24 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#006828] via-[#eab308] to-[#9B0000] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-700" />
          <div className="relative bg-[#161616] rounded-3xl p-10 md:p-16 text-center border border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#006828] via-[#eab308] to-[#9B0000] rounded-t-3xl" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para ver mejor?</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
              Agenda tu revisión visual hoy mismo o contáctanos para organizar una campaña en tu empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/jornadas"
                className="px-8 py-4 bg-[#006828] hover:bg-[#00501f] text-white font-bold rounded-full transition-colors shadow-[0_0_20px_rgba(0,104,40,0.3)]"
              >
                Ver Campañas Activas
              </Link>
              <Link
                href="/contacto"
                className="px-8 py-4 border border-white/20 hover:border-[#006828] text-white font-bold rounded-full transition-colors"
              >
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
