"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";

type DayTrip = {
  uuid: string;
  title: string;
  state: string;
  date: string;
  author: string;
  picture: string;
  status: string;
  municipality?: string;
  place?: string;
};

export default function JornadasPage() {
  const [jornadas, setJornadas] = useState<DayTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJornadas = async () => {
      try {
        const q = query(
          collection(db, "dayTrip"),
          where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        const data: DayTrip[] = [];
        snapshot.forEach((doc) => {
          data.unshift({ uuid: doc.id, ...doc.data() } as DayTrip);
        });
        setJornadas(data);
      } catch (error) {
        console.error("Error fetching jornadas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJornadas();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      {/* Hero de la sección */}
      <div className="relative overflow-hidden py-20 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#006828]/15 rounded-full blur-[100px] pointer-events-none" />
        <p className="text-[#006828] font-bold tracking-[0.2em] uppercase text-sm mb-4">
          Revisiones Visuales Móviles
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Nuestras Próximas Campañas
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Entérate de las próximas locaciones donde instalaremos nuestras unidades de diagnóstico y agenda tu cita con anticipación.
        </p>
      </div>

      {/* Grid de Jornadas */}
      <div className="container mx-auto px-6 lg:px-16 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 h-72 animate-pulse" />
            ))}
          </div>
        ) : jornadas.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👁️</div>
            <h3 className="text-2xl font-bold text-slate-300 mb-2">No hay campañas activas</h3>
            <p className="text-slate-500">Vuelve pronto para ver las próximas jornadas de salud visual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jornadas.map((jornada, i) => (
              <motion.div
                key={jornada.uuid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/jornada/${jornada.uuid}`} className="group block">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#161616] hover:border-[#006828]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,104,40,0.15)]">
                    {/* Imagen */}
                    <div className="relative h-56 overflow-hidden bg-[#222]">
                      {jornada.picture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={jornada.picture}
                          alt={jornada.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🏥</div>
                      )}
                      
                      {/* Degradado para mejorar legibilidad */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Badge ACTIVA */}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-[#006828] text-white text-xs font-bold rounded-full shadow-[0_2px_8px_rgba(0,104,40,0.4)]">
                        Activa
                      </div>

                      {/* Municipio y Estado en la imagen */}
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/75 backdrop-blur-md text-white text-xs font-bold rounded-lg flex items-center gap-1.5 border border-white/15 shadow-lg">
                        <span>📍</span>
                        <span className="tracking-wide uppercase">{jornada.municipality || jornada.state}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-1">
                        {jornada.state} {jornada.municipality ? `· ${jornada.municipality}` : ""}
                      </p>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#4ade80] transition-colors leading-tight">
                        {jornada.title}
                      </h3>

                      {jornada.place && (
                        <p className="text-slate-400 text-xs mb-4 flex items-center gap-1">
                          <span>🏢</span>
                          <span className="truncate">{jornada.place}</span>
                        </p>
                      )}

                      <div className="flex flex-col gap-1.5 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{jornada.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs opacity-75">
                          <span>👤</span>
                          <span className="truncate">{jornada.author}</span>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-[#4ade80] text-sm font-semibold border-t border-white/5 pt-4">
                        Registrar mi lugar
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
