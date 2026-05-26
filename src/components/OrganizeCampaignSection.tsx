export default function OrganizeCampaignSection() {
  return (
    <section className="w-full bg-[#111111] py-20 px-6 lg:px-16 flex justify-center">
      <div className="max-w-5xl w-full relative group">
        
        {/* Glow effect behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#006828] via-[#eab308] to-[#9B0000] rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        
        {/* Main Card */}
        <div className="relative bg-[#1a1a1a] rounded-3xl p-10 md:p-16 text-center shadow-2xl flex flex-col items-center overflow-hidden">
          
          {/* Gradient Top Border line inside the card */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#006828] via-[#eab308] to-[#9B0000]" />

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl">
            ¿Quieres Organizar una Campaña Visual en tu Empresa o Escuela?
          </h2>
          
          <p className="text-slate-400 text-lg max-w-3xl mb-10 leading-relaxed">
            Llevamos nuestro equipo de optometría computarizada y personal calificado sin costo de traslado. Facilita el acceso a la salud visual a tu equipo.
          </p>
          
          <button className="px-8 py-4 bg-[#00b050] hover:bg-[#009040] text-white font-bold rounded-full transition-transform hover:scale-105 shadow-[0_0_20px_rgba(0,176,80,0.3)]">
            Solicitar Información de Campaña
          </button>
        </div>
      </div>
    </section>
  );
}
