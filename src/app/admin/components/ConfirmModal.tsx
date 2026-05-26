"use client";

import React from "react";
import { motion } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#161616] border border-white/10 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative flex flex-col gap-5"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#9B0000]" />
        
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-4 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-white/10 hover:border-white/20 rounded-full text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-transparent"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2.5 bg-[#9B0000] hover:bg-[#800000] text-white rounded-full font-bold text-sm shadow-[0_0_15px_rgba(155,0,0,0.3)] transition-colors cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
