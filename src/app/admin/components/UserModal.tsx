"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, setDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { firebaseConfig, db } from "@/firebase/config";
import toast from "react-hot-toast";
import { DBUser } from "../context/AdminContext";
import { isValidEmail } from "@/utils/validators";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  userToEdit?: DBUser | null;
}

export default function UserModal({ isOpen, onClose, onUserAdded, userToEdit }: UserModalProps) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "operator" | "normal">("operator");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(userToEdit);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || "");
      setLastname(userToEdit.lastname || "");
      setEmail(userToEdit.email || "");
      setUserRole((userToEdit.userRole as any) || "operator");
      setActive(userToEdit.active !== false);
      setPassword("");
    } else {
      setName("");
      setLastname("");
      setEmail("");
      setPassword("");
      setUserRole("operator");
      setActive(true);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      return toast.error("Por favor completa los campos requeridos.");
    }

    if (!isValidEmail(email)) {
      return toast.error("Por favor ingresa un correo electrónico válido (ejemplo@dominio.com).");
    }

    if (!isEdit && (!password.trim() || password.trim().length < 6)) {
      return toast.error("La contraseña debe tener al menos 6 caracteres.");
    }

    setSaving(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isEdit && userToEdit) {
        // Edit existing user in Firestore
        await setDoc(
          doc(db, "users", userToEdit.id),
          {
            name: name.trim(),
            lastname: lastname.trim(),
            email: cleanEmail,
            userRole,
            active,
          },
          { merge: true }
        );

        toast.success("¡Usuario actualizado exitosamente!");
        onUserAdded();
        handleResetAndClose();
      } else {
        // Create new user in Auth & Firestore
        const q = query(collection(db, "users"), where("email", "==", cleanEmail));
        const existingSnap = await getDocs(q);

        if (!existingSnap.empty) {
          toast.error(`El correo "${cleanEmail}" ya está registrado en el sistema.`);
          setSaving(false);
          return;
        }

        const tempAppName = `tempUserApp_${Date.now()}`;
        const tempApp = initializeApp(firebaseConfig, tempAppName);
        const tempAuth = getAuth(tempApp);

        const userCredential = await createUserWithEmailAndPassword(tempAuth, cleanEmail, password.trim());
        const newUid = userCredential.user.uid;

        await updateProfile(userCredential.user, {
          displayName: `${name.trim()} ${lastname.trim()}`.trim(),
        });

        await setDoc(doc(db, "users", newUid), {
          name: name.trim(),
          lastname: lastname.trim(),
          email: cleanEmail,
          userRole,
          active,
          createdAt: serverTimestamp(),
        });

        await deleteApp(tempApp);

        toast.success("¡Usuario y credenciales creadas exitosamente!");
        onUserAdded();
        handleResetAndClose();
      }
    } catch (err: any) {
      console.error("Error saving user:", err);
      if (err.code === "auth/email-already-in-use") {
        toast.error(`El correo "${cleanEmail}" ya está en uso en Firebase Auth.`);
      } else if (err.code === "auth/weak-password") {
        toast.error("La contraseña es muy débil. Debe tener al menos 6 caracteres.");
      } else {
        toast.error("Error al procesar la solicitud.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetAndClose = () => {
    setName("");
    setLastname("");
    setEmail("");
    setPassword("");
    setUserRole("operator");
    setActive(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#161616] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#006828] to-[#4ade80]" />

        <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5">
          <div>
            <span className="text-[10px] bg-[#006828]/25 text-[#4ade80] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Control de Personal
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              {isEdit ? "Editar Usuario" : "Registrar Nuevo Usuario"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit
                ? "Modifica el rol o estado de acceso del usuario."
                : "Crea las credenciales de acceso y asigna el rol correspondiente."}
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">
                Nombre(s) <span className="text-[#9B0000]">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Roberto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Apellidos</label>
              <input
                type="text"
                placeholder="Ej. Gómez"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">
                Correo Electrónico <span className="text-[#9B0000]">*</span>
              </label>
              <input
                type="email"
                placeholder="ejemplo@defpotec.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                required
                disabled={isEdit}
              />
            </div>

            {!isEdit && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">
                  Contraseña Inicial <span className="text-[#9B0000]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
                  required={!isEdit}
                  minLength={6}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">
                Rol / Nivel de Acceso <span className="text-[#9B0000]">*</span>
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828] cursor-pointer"
              >
                <option value="operator">Optometrista / Operador</option>
                <option value="admin">CEO / Administrador</option>
                <option value="normal">Usuario Autorizado</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Estado de Acceso</label>
              <select
                value={active ? "active" : "inactive"}
                onChange={(e) => setActive(e.target.value === "active")}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#006828] cursor-pointer"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo / Suspendido</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-6 py-2.5 border border-white/10 hover:border-white/20 rounded-full text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#006828] hover:bg-[#00501f] disabled:opacity-50 text-white rounded-full font-bold text-sm shadow-[0_0_15px_rgba(0,104,40,0.3)] transition-all cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEdit ? (
                "Guardar Cambios"
              ) : (
                "Guardar Usuario"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
