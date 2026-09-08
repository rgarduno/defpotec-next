"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#006828] selection:text-white relative overflow-hidden">
      <Header />

      {/* Decorative Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#006828]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#9B0000]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Snellen Eye Chart subtle background */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.025] select-none pointer-events-none scale-90">
        <span className="text-[250px] font-black font-serif">4 0 4</span>
        <span className="text-[120px] font-black font-serif tracking-[0.3em]">N O T F O U N D</span>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative z-10 my-auto">
        <div className="bg-[#161616]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 max-w-xl shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#006828] via-[#eab308] to-[#9B0000] rounded-t-3xl" />

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#006828]/20 border border-[#006828]/40 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(0,104,40,0.3)]">
            👓
          </div>

          <span className="text-xs bg-[#006828]/25 text-[#4ade80] px-3.5 py-1 rounded-full font-bold uppercase tracking-widest">
            Error 404 &middot; Fuera de Foco
          </span>

          <h1 className="text-3xl md:text-5xl font-black text-white mt-4 tracking-tight">
            Página No Encontrada
          </h1>

          <p className="text-sm md:text-base text-slate-400 mt-4 leading-relaxed">
            Parece que la dirección que buscas no existe o ha sido movida. Permítenos ajustarle el enfoque a tu navegación.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link
              href="/"
              className="w-full sm:w-auto bg-[#006828] hover:bg-[#00501f] text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(0,104,40,0.3)] text-sm cursor-pointer"
            >
              Volver al Inicio
            </Link>
            <Link
              href="/jornadas"
              className="w-full sm:w-auto border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-xl transition-all text-sm cursor-pointer"
            >
              Ver Jornadas Activas
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
