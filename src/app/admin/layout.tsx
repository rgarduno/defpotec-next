"use client";

import React from "react";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Sidebar from "./components/Sidebar";
import Link from "next/link";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    loading,
    accessDenied,
    currentUser,
    handleLogout,
    selectedYear,
    setSelectedYear,
    campaigns
  } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#006828] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-24 h-24 rounded-full bg-[#9B0000]/25 border-2 border-[#9B0000] flex items-center justify-center text-5xl">
          🚫
        </div>
        <h1 className="text-3xl font-extrabold">Acceso Denegado</h1>
        <p className="text-slate-400 max-w-sm">
          Este panel de control es de uso exclusivo para el CEO y directivos autorizados de DEFPOTEC MX.
        </p>
        <div className="flex gap-4">
          <Link href="/" className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold transition-all border border-white/10 text-sm">
            Volver al Inicio
          </Link>
          <button onClick={handleLogout} className="px-6 py-2 bg-[#9B0000] hover:bg-[#800000] text-white rounded-full font-bold transition-all text-sm shadow-[0_0_15px_rgba(155,0,0,0.4)]">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Calculate available years for selector
  const availableYears = Array.from(new Set([
    new Date().getFullYear(),
    ...campaigns.map(c => c.year).filter(Boolean),
    ...campaigns.map(c => c.endYear).filter(Boolean)
  ])).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <Toaster position="top-right" />
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENT AREA */}
        <main className="flex-grow p-6 md:p-10 relative overflow-x-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#006828]/5 blur-[120px] pointer-events-none rounded-full" />

          {/* TOP BAR / YEAR SELECTOR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl mb-8 relative z-10">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">DEFPOTEC MX</p>
              <h1 className="text-2xl font-black text-white mt-1">Dashboard CEO</h1>
              <p className="text-xs text-slate-400 mt-1">Análisis de rendimiento y métricas para el año {selectedYear}.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-400">Año de Consulta:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#006828] cursor-pointer"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Page content */}
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
