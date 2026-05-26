"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAdmin } from "../context/AdminContext";

export default function ProfileTab() {
  const { userProfile, updateUserProfile } = useAdmin();
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setLastname(userProfile.lastname || "");
    }
  }, [userProfile]);

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-[#006828] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateUserProfile(name, lastname);
    setIsSubmitting(false);
  };

  // Convert role to a user-friendly label
  const getFriendlyRole = (role: string) => {
    const r = role?.toLowerCase();
    if (r === "admin" || r === "operator") {
      return "Administrador";
    }
    return "Usuario Normal";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto bg-[#111] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#006828] to-[#4ade80]" />

      <div className="mb-8">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">DEFPOTEC MX</p>
        <h2 className="text-2xl font-black text-white mt-1">Configuración del Perfil</h2>
        <p className="text-xs text-slate-400 mt-1">Administra tus datos personales y credenciales de acceso.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* EMAIL (Read-Only) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Correo Electrónico</label>
          <input
            type="email"
            value={userProfile.email || ""}
            disabled
            className="w-full bg-[#0a0a0a]/50 border border-white/5 rounded-xl px-4 py-3 text-slate-500 text-sm cursor-not-allowed select-none"
          />
          <p className="text-[10px] text-slate-600">El correo electrónico no puede ser modificado ya que está vinculado a tu cuenta de acceso.</p>
        </div>

        {/* ROLE DISPLAY */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Tipo de Usuario / Rol</label>
          <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5">
            <span className="text-lg">🛡️</span>
            <div>
              <p className="text-sm font-bold text-white">
                {getFriendlyRole(userProfile.userRole)}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Rol en base de datos: {userProfile.userRole || "normal"}
              </p>
            </div>
          </div>
        </div>

        {/* NAME AND LASTNAME INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">Nombre(s) <span className="text-[#9B0000]">*</span></label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">Apellidos <span className="text-[#9B0000]">*</span></label>
            <input
              type="text"
              placeholder="Tus apellidos"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
              required
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 bg-gradient-to-r from-[#006828] to-[#00501f] text-white rounded-full font-bold text-sm shadow-[0_0_15px_rgba(0,104,40,0.3)] transition-all flex items-center gap-2 cursor-pointer ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
