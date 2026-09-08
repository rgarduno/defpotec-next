"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#9B0000] selection:text-white relative overflow-hidden">
      <Header />

      {/* Decorative Red Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#9B0000]/15 rounded-full blur-[140px] pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative z-10 my-auto">
        <div className="bg-[#161616]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 max-w-xl shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#9B0000] via-[#eab308] to-[#9B0000] rounded-t-3xl" />

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#9B0000]/20 border border-[#9B0000]/40 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(155,0,0,0.3)]">
            ⚠️
          </div>

          <span className="text-xs bg-[#9B0000]/25 text-[#f87171] px-3.5 py-1 rounded-full font-bold uppercase tracking-widest">
            Error del Sistema
          </span>

          <h1 className="text-3xl md:text-4xl font-black text-white mt-4 tracking-tight">
            Algo no salió como esperábamos
          </h1>

          <p className="text-sm text-slate-400 mt-4 leading-relaxed">
            Ocurrió una interrupción temporal al procesar la solicitud. Nuestro equipo técnico ha sido notificado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto bg-[#006828] hover:bg-[#00501f] text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(0,104,40,0.3)] text-sm cursor-pointer"
            >
              Reintentar Acción
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-xl transition-all text-sm cursor-pointer"
            >
              Ir al Inicio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
