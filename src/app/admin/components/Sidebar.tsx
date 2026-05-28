"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "../context/AdminContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, handleLogout } = useAdmin();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <aside className="w-full lg:w-64 bg-[#111] border-b lg:border-b-0 lg:border-r border-white/10 p-6 flex flex-col gap-6 shrink-0">
      <div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">DEFPOTEC MX</p>
        <h2 className="text-lg font-black text-white mt-1">Panel de Control</h2>
      </div>

      <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0">
        <Link
          href="/admin"
          className={`w-max lg:w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
            isActive("/admin")
              ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>📊</span> Panel de Control
        </Link>
        <Link
          href="/admin/directorio"
          className={`w-max lg:w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
            isActive("/admin/directorio")
              ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>📖</span> Directorio
        </Link>
        <Link
          href="/admin/catalogos"
          className={`w-max lg:w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
            isActive("/admin/catalogos")
              ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>🏥</span> Servicios y Estados
        </Link>
        <Link
          href="/admin/citas"
          className={`w-max lg:w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
            isActive("/admin/citas")
              ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>🎟️</span> Control de Citas
        </Link>
        <Link
          href="/admin/usuarios"
          className={`w-max lg:w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
            isActive("/admin/usuarios")
              ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>👥</span> Usuarios
        </Link>
        <Link
          href="/admin/perfil"
          className={`w-max lg:w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
            isActive("/admin/perfil")
              ? "bg-[#006828] text-white shadow-[0_0_15px_rgba(0,104,40,0.4)]"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>👤</span> Mi Perfil
        </Link>
      </nav>

      <div className="mt-auto hidden lg:flex flex-col gap-4 border-t border-white/5 pt-6 text-xs text-slate-500">
        <p>Conectado como:</p>
        <p className="font-semibold text-slate-300 truncate">{currentUser?.email}</p>
        <button onClick={handleLogout} className="text-[#9B0000] hover:underline font-bold text-left cursor-pointer bg-transparent border-none">
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
