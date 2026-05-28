"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAdmin, DBUser } from "../context/AdminContext";
import { useSortableData, SortIcon } from "../../../hooks/useSortableData";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function UsersTab() {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
      
      {/* SEARCH BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div>
          <h3 className="font-bold text-white">Directorio de Usuarios</h3>
          <p className="text-xs text-slate-400 mt-1">Busca y administra el personal con acceso de control al panel.</p>
        </div>
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
                  <th className="p-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                      No se encontraron usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((user) => (
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
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.active !== false 
                            ? "bg-[#006828]/20 text-[#4ade80]" 
                            : "bg-white/5 text-slate-500"
                        }`}>
                          {user.active !== false ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}
