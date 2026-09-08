"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin, DBUser } from "../context/AdminContext";
import { useSortableData, SortIcon } from "../../../hooks/useSortableData";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import UserModal from "./UserModal";

export default function UsersTab() {
  const { currentUser } = useAdmin();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<DBUser | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<DBUser | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DBUser));
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (targetUser: DBUser) => {
    // Double safeguard against self-deletion or master admin deletion
    const isSelf = targetUser.email?.toLowerCase() === currentUser?.email?.toLowerCase();
    const isMasterAdmin = ["lx.garduno@gmail.com", "alosgar@gmail.com"].includes(targetUser.email?.toLowerCase() || "");

    if (isSelf || isMasterAdmin) {
      return toast.error("No puedes eliminar tu propia cuenta ni administradores maestros.");
    }

    try {
      // 1. Call server API route to delete from Firebase Auth & Firestore Admin
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUser.id, email: targetUser.email }),
      });

      const data = await res.json();

      // 2. Fallback client Firestore deletion
      try {
        await deleteDoc(doc(db, "users", targetUser.id));
      } catch (e) {
        // Document might already be deleted
      }

      if (data.deletedFromAuth) {
        toast.success("¡Usuario eliminado al 100% de Firebase Auth y Base de Datos!");
      } else {
        toast.success("Usuario eliminado correctamente.");
      }
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Error al eliminar el usuario.");
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const fullName = `${user.name || ""} ${user.lastname || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const { items: sortedUsers, requestSort, sortConfig } = useSortableData(filteredUsers);

  // Helper to format role
  const getFriendlyRole = (role?: string) => {
    const r = role?.toLowerCase();
    if (r === "admin") return "CEO / Administrador";
    if (r === "operator") return "Optometrista / Operador";
    return "Usuario Autorizado";
  };

  // Helper to get initials
  const getInitials = (name: string, lastname?: string) => {
    const n = name ? name.charAt(0) : "";
    const l = lastname ? lastname.charAt(0) : "";
    return (n + l).toUpperCase() || "U";
  };

  // Helper to format creation date
  const formatCreatedDate = (createdAt?: any) => {
    if (!createdAt) return "—";
    try {
      let d: Date;
      if (createdAt?.toDate && typeof createdAt.toDate === "function") {
        d = createdAt.toDate();
      } else if (createdAt?.seconds) {
        d = new Date(createdAt.seconds * 1000);
      } else {
        d = new Date(createdAt);
      }
      if (isNaN(d.getTime())) return "—";
      
      return d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "—";
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
      
      {/* SEARCH BAR & ADD USER BUTTON */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div>
          <h3 className="font-bold text-white">Directorio de Usuarios</h3>
          <p className="text-xs text-slate-400 mt-1">Busca y administra el personal con acceso de control al panel.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto relative">
            <input
              type="text"
              placeholder="Buscar usuario por nombre o correo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#006828]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setUserToEdit(null);
              setIsUserModalOpen(true);
            }}
            className="bg-[#006828] hover:bg-[#00501f] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(0,104,40,0.3)] cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Registrar Usuario
          </button>
        </div>
      </div>

      {/* USERS LIST TABLE */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">
            Personal Registrado ({filteredUsers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#006828] border-t-transparent rounded-full animate-spin" />
              <span>Cargando directorio de usuarios...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest bg-white/2">
                  <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("name")}>
                    Usuario <SortIcon active={sortConfig?.key === "name"} direction={sortConfig?.direction || null} />
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("email")}>
                    Correo Electrónico <SortIcon active={sortConfig?.key === "email"} direction={sortConfig?.direction || null} />
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("userRole")}>
                    Rol / Acceso <SortIcon active={sortConfig?.key === "userRole"} direction={sortConfig?.direction || null} />
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort("createdAt")}>
                    Fecha de Registro <SortIcon active={sortConfig?.key === "createdAt"} direction={sortConfig?.direction || null} />
                  </th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                      No se encontraron usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((user) => {
                    const isSelf = user.email?.toLowerCase() === currentUser?.email?.toLowerCase();
                    const isMasterAdmin = ["lx.garduno@gmail.com", "alosgar@gmail.com"].includes(user.email?.toLowerCase() || "");
                    const isSelfOrMasterAdmin = isSelf || isMasterAdmin;

                    return (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/2 text-sm text-slate-300">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Profile Circle Avatar */}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#006828] to-[#008f37] flex items-center justify-center text-white text-xs font-bold shadow-inner">
                              {getInitials(user.name, user.lastname)}
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                {user.name} {user.lastname || ""}
                              </p>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {user.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-mono text-slate-400 select-all">{user.email}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            user.userRole?.toLowerCase() === "admin"
                              ? "bg-[#006828]/25 text-[#4ade80]"
                              : "bg-white/5 text-slate-400"
                          }`}>
                            {getFriendlyRole(user.userRole)}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-400 font-mono">
                          {formatCreatedDate(user.createdAt)}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            user.active !== false 
                              ? "bg-[#006828]/20 text-[#4ade80]" 
                              : "bg-white/5 text-slate-500"
                          }`}>
                            {user.active !== false ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setUserToEdit(user);
                                setIsUserModalOpen(true);
                              }}
                              className="p-1.5 bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              title="Editar usuario"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            {!isSelfOrMasterAdmin ? (
                              <button
                                onClick={() => {
                                  setUserToDelete(user);
                                  setIsConfirmOpen(true);
                                }}
                                className="p-1.5 bg-[#9B0000]/10 hover:bg-[#9B0000] text-[#9B0000] hover:text-white rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                                title="Eliminar usuario"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                disabled
                                className="p-1.5 bg-white/5 text-slate-600 rounded-lg cursor-not-allowed inline-flex items-center justify-center opacity-40"
                                title="No puedes eliminar tu propia cuenta ni administradores principales"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isConfirmOpen && userToDelete && (
          <ConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => {
              setIsConfirmOpen(false);
              setUserToDelete(null);
            }}
            onConfirm={() => handleDeleteUser(userToDelete)}
            title="Eliminar Usuario"
            message={`¿Deseas eliminar al usuario "${userToDelete.name} ${userToDelete.lastname || ""}" (${userToDelete.email}) permanentemente?`}
          />
        )}
      </AnimatePresence>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setUserToEdit(null);
        }}
        onUserAdded={fetchUsers}
        userToEdit={userToEdit}
      />
    </motion.div>
  );
}

