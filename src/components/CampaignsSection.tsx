import Link from 'next/link';

export default function CampaignsSection() {
  return (
    <section className="w-full bg-[#0a0a0a] text-white py-24 relative overflow-hidden">
      {/* Grid background effect */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        
        {/* Header de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[#006828] font-bold tracking-[0.2em] uppercase text-sm mb-4">Revisiones visuales móviles</p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Nuestras Próximas Campañas</h2>
          <p className="text-slate-400 text-lg">
            Entérate de las próximas locaciones donde instalaremos nuestras unidades de diagnóstico y agenda tu cita con anticipación.
          </p>
        </div>

        {/* Layout de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Columna Izquierda: Cronograma */}
          <div className="flex flex-col gap-6 justify-center">
            <p className="text-slate-400 text-lg leading-relaxed">
              Llevamos nuestras unidades de diagnóstico a diferentes locaciones. Revisa las campañas activas y asegura tu lugar con anticipación.
            </p>
            <ul className="flex flex-col gap-3 text-slate-400 text-sm">
              <li className="flex items-center gap-3"><span className="text-[#4ade80] text-xl">✔</span> Sin costo de traslado</li>
              <li className="flex items-center gap-3"><span className="text-[#4ade80] text-xl">✔</span> Equipo de optometría computarizada</li>
              <li className="flex items-center gap-3"><span className="text-[#4ade80] text-xl">✔</span> Personal calificado</li>
              <li className="flex items-center gap-3"><span className="text-[#4ade80] text-xl">✔</span> Agenda con anticipación en línea</li>
            </ul>
            <Link
              href="/jornadas"
              className="mt-4 inline-flex items-center gap-2 px-8 py-4 bg-[#006828] hover:bg-[#00501f] text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(0,104,40,0.2)] w-max"
            >
              Ver campañas activas
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Columna Derecha: Formulario de Registro */}
          <div>
            <div className="bg-[#161616] border-t-4 border-[#006828] p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
              {/* Subtle green glow inside card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#006828]/10 blur-3xl pointer-events-none" />
              
              <h3 className="text-2xl font-bold mb-2">Registra tu Cita</h3>
              <p className="text-slate-400 text-sm mb-8">Completa el formulario para asegurar tu lugar en la campaña visual seleccionada.</p>
              
              <form className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="Escribe tu nombre" 
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">Teléfono / WhatsApp</label>
                  <input 
                    type="tel" 
                    placeholder="Ej. 5512345678" 
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">Campaña y Ubicación</label>
                  <select 
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#006828] focus:ring-1 focus:ring-[#006828] transition-all appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled className="text-slate-600">Cargando locaciones disponibles...</option>
                    {/* Opciones se llenarán dinámicamente con Firebase luego */}
                  </select>
                </div>

                <button 
                  type="button" 
                  className="mt-4 w-full bg-[#006828] hover:bg-[#00501f] text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(0,104,40,0.3)]"
                >
                  Confirmar Registro
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
