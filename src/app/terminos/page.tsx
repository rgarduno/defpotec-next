"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#006828] selection:text-white">
      <Header />

      <main className="flex-1 container mx-auto px-6 md:px-12 py-12 max-w-5xl">
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-[#4ade80]">Términos y Condiciones</span>
          </div>
          <span className="text-xs bg-[#006828]/25 text-[#4ade80] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Condiciones del Servicio
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mt-4">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Vigentes a partir de Septiembre de 2026 | Reglamentación de uso de plataforma y emisión de folios para jornadas de salud visual.
          </p>
        </div>

        {/* Legal Body Content */}
        <div className="flex flex-col gap-8 text-slate-300 leading-relaxed text-sm md:text-base">
          
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#006828]">1.</span> Aceptación de los Términos
            </h2>
            <p>
              Al acceder, navegar o utilizar este sitio web y agendar folios para nuestras jornadas de salud visual, usted acepta cumplir y quedar sujeto a los presentes Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, le solicitamos abstenerse de utilizar nuestros servicios en línea.
            </p>
          </section>

          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#006828]">2.</span> Servicio de Jornadas de Salud Visual y Folios
            </h2>
            <p className="mb-3">
              DEFPOTEC MX provee servicios optométricos y de diagnóstico visual mediante jornadas comunitarias e institucionales. La emisión de folios a través del portal otorga al usuario:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-2 text-slate-400 pl-2">
              <li>El derecho a recibir atención optométrica previa comprobación del código de folio generado.</li>
              <li>Un horario o turno preferencial según la disponibilidad de la sede de atención.</li>
              <li>Acceso al diagnóstico técnico visual realizado por personal capacitado u optometristas calificados.</li>
            </ul>
          </section>

          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#006828]">3.</span> Responsabilidad del Usuario al Agendar
            </h2>
            <p className="mb-3">El usuario se compromete a:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 text-slate-400 pl-2">
              <li>Proporcionar información verídica y exacta (nombre, teléfono y correo electrónico de contacto).</li>
              <li>Presentarse en la sede de la jornada seleccionada en la fecha y rango de horario acordados.</li>
              <li>Respetar las indicaciones sanitarias y operativas del equipo técnico durante el examen optométrico.</li>
            </ul>
          </section>

          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#006828]">4.</span> Propiedad Intelectual
            </h2>
            <p>
              Todo el contenido presente en esta plataforma, incluyendo logotipos, textos, gráficos, interfaces y software es propiedad exclusiva de DEFPOTEC MX y se encuentra protegido por las leyes de propiedad industrial e intelectual aplicables en México.
            </p>
          </section>

          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#006828]">5.</span> Contacto y Atención al Cliente
            </h2>
            <p className="mb-4">
              Para cualquier duda, aclaración o consulta referente a nuestras políticas o servicios de salud visual, por favor comuníquese a través de nuestros canales oficiales:
            </p>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-xs text-slate-400 flex flex-col gap-2">
              <p><strong className="text-white">Atención Telefónica / WhatsApp:</strong> 55 2897 3384</p>
              <p><strong className="text-white">Correo Electrónico:</strong> <a href="mailto:contacto@defpotecmx.com" className="text-[#4ade80] underline">contacto@defpotecmx.com</a></p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
