"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAdmin, DayTrip } from "../context/AdminContext";

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: DayTrip | null;
}

const defaultForm = {
  title: "Jornada por la Salud",
  author: "",
  selectedPlaceId: "",
  selectedScheduleId: "",
  picture: "",
  startDateStr: "",
  endDateStr: "",
};

export default function CampaignModal({ isOpen, onClose, campaign }: CampaignModalProps) {
  const { dbUsers, contacts, schedules, handleCampaignSubmit } = useAdmin();
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (campaign) {
      const matchedPlace = contacts.find(c => c.place === campaign.place || c.contactName === campaign.place);
      const matchedSchedule = schedules.find(s => s.name === campaign.time);
      
      const startStr = campaign.year 
        ? `${campaign.year}-${String(campaign.month).padStart(2, "0")}-${String(campaign.day).padStart(2, "0")}`
        : "";
      const endStr = campaign.endYear 
        ? `${campaign.endYear}-${String(campaign.endMonth || campaign.month).padStart(2, "0")}-${String(campaign.endDay || campaign.day).padStart(2, "0")}`
        : (campaign.year ? `${campaign.year}-${String(campaign.month).padStart(2, "0")}-${String(campaign.day).padStart(2, "0")}` : "");

      setForm({
        title: campaign.title || "Jornada por la Salud",
        author: campaign.author || "",
        selectedPlaceId: matchedPlace?.id || "",
        selectedScheduleId: matchedSchedule?.id || "",
        picture: campaign.picture || "",
        startDateStr: startStr,
        endDateStr: endStr,
      });
    } else {
      setForm(defaultForm);
    }
  }, [campaign, contacts, schedules, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleCampaignSubmit(
      form,
      !!campaign,
      campaign?.uuid || ""
    );
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#161616] border border-white/10 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#006828]" />
        
        <h3 className="text-xl font-bold text-white mb-6">
          {campaign ? "Editar Datos de la Jornada" : "Crear Nueva Jornada de Salud"}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Título / Nombre de Campaña <span className="text-[#9B0000]">*</span></label>
            <input
              type="text"
              placeholder="Ej. Jornada por la Salud Visual"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Responsable (Encargado) <span className="text-[#9B0000]">*</span></label>
              <select
                value={form.author}
                onChange={e => setForm({ ...form, author: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828] appearance-none"
                required
              >
                <option value="">Selecciona encargado</option>
                {dbUsers.map(usr => (
                  <option key={usr.id} value={`${usr.name} ${usr.lastname || ""}`.trim()}>
                    {usr.name} {usr.lastname || ""} ({usr.email})
                  </option>
                ))}
                {dbUsers.length === 0 && (
                  <option value="Guillermo Alfredo Osornio García">
                    Guillermo Alfredo Osornio García (Predeterminado)
                  </option>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Establecimiento (Directorio) <span className="text-[#9B0000]">*</span></label>
              <select
                value={form.selectedPlaceId}
                onChange={e => setForm({ ...form, selectedPlaceId: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828] appearance-none"
                required
              >
                <option value="">Selecciona lugar del directorio</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.place} ({c.selectedMunicipality}, {c.selectedState})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Horario de Atención</label>
              <select
                value={form.selectedScheduleId}
                onChange={e => setForm({ ...form, selectedScheduleId: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828] appearance-none"
              >
                <option value="">Selecciona plantilla horario</option>
                {schedules.map(sch => (
                  <option key={sch.id} value={sch.id}>{sch.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">URL Imagen Banner</label>
              <input
                type="text"
                placeholder="https://..."
                value={form.picture}
                onChange={e => setForm({ ...form, picture: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Fecha de Inicio <span className="text-[#9B0000]">*</span></label>
              <input
                type="date"
                value={form.startDateStr}
                onChange={e => setForm({ ...form, startDateStr: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Fecha de Cierre <span className="text-[#9B0000]">*</span></label>
              <input
                type="date"
                value={form.endDateStr}
                onChange={e => setForm({ ...form, endDateStr: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828]"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-white/10 hover:border-white/20 rounded-full text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#006828] hover:bg-[#00501f] text-white rounded-full font-bold text-sm shadow-[0_0_15px_rgba(0,104,40,0.3)] transition-colors cursor-pointer"
            >
              {campaign ? "Guardar Cambios" : "Crear Jornada"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
