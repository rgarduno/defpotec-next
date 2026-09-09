"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#006828] selection:text-white">
      <Header />

      <main className="flex-1 container mx-auto px-6 md:px-12 py-12 max-w-5xl">
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-[#4ade80]">Aviso de Privacidad</span>
          </div>
          <span className="text-xs bg-[#006828]/25 text-[#4ade80] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Legal & Protección de Datos
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mt-4">
            Aviso de Privacidad
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Última actualización: Septiembre de 2026 | Cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
          </p>
        </div>

        {/* Legal Body Content */}
        <div className="flex flex-col gap-8 text-slate-300 leading-relaxed text-sm md:text-base">
          
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#006828]">1.</span> Identidad y Domicilio del Responsable
            </h2>
            <p>
              <strong className="text-white">DEFPOTEC MX</strong> (en adelante, "DEFPOTEC"), con domicilio en Atenas #1 Int.1, Col. San Álvaro, Azcapotzalco, Ciudad de México, es responsable de recabar, usar, proteger y tratar sus datos personales en estricto apego a las disposiciones de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
            </p>
          </section>

          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#006828]">2.</span> Datos Personales y Sensibles Recabados
            </h2>
            <p className="mb-3">
              Para brindarle nuestros servicios de salud visual, gestión de folios de atención y agendamiento de jornadas clínicas, podemos recabar los siguientes datos:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-2 text-slate-400 pl-2">
              <li><strong className="text-slate-200">Datos de Identificación y Contacto:</strong> Nombre completo, correo electrónico, número telefónico y/o celular.</li>
              <li><strong className="text-slate-200">Datos de Ubicación:</strong> Estado, municipio o sucursal donde solicita la atención médica visual.</li>
              <li><strong className="text-slate-200">Datos Sensibles de Salud Visual:</strong> Diagnósticos optométricos, historia clínica visual y graduación óptica recomendada durante nuestras jornadas clínicas de campo.</li>
            </ul>
          </section>

          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#006828]">3.</span> Finalidades del Tratamiento de Datos
            </h2>
            <p className="mb-3">Los datos personales recabados serán utilizados para las siguientes finalidades primarias:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 text-slate-400 pl-2 mb-4">
              <li>Generación, confirmación y validación de folios de atención para jornadas de salud visual.</li>
              <li>Registro del historial óptico y seguimiento clínico del paciente.</li>
              <li>Contacto directo mediante correo electrónico o WhatsApp para recordatorios de citas.</li>
            </ul>
            <p className="text-xs text-slate-500">
              * Finalidades secundarias: Envío de boletines informativos sobre próximas jornadas visuales (si el usuario ha aceptado suscribirse voluntariamente).
            </p>
          </section>

          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#006828]">4.</span> Derechos ARCO y Revocación del Consentimiento
            </h2>
            <p className="mb-4">
              Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (<strong className="text-white">Acceso</strong>). Asimismo, es su derecho solicitar la corrección de su información (<strong className="text-white">Rectificación</strong>), que la eliminemos de nuestros registros (<strong className="text-white">Cancelación</strong>) o poner su uso a fines específicos (<strong className="text-white">Oposición</strong>).
            </p>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-xs text-slate-400 flex flex-col gap-2">
              <p><strong className="text-white">¿Cómo ejercer sus Derechos ARCO?</strong></p>
              <p>Envíe una solicitud por correo electrónico a: <a href="mailto:contacto@defpotecmx.com" className="text-[#4ade80] underline">contacto@defpotecmx.com</a> o comuníquese al teléfono <span className="text-white">55 2897 3384</span> indicando su nombre completo y el derecho que desea ejercer.</p>
            </div>
          </section>

          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-[#006828]">5.</span> Modificaciones al Aviso de Privacidad
            </h2>
            <p>
              El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales o de nuestras propias necesidades operativas. Nos comprometemos a mantenerlo informado sobre los cambios a través de nuestro sitio web en <Link href="/privacidad" className="text-[#4ade80] underline">defpotecmx.com/privacidad</Link>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
