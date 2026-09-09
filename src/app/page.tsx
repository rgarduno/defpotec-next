"use client";

import Image from 'next/image';
import CampaignsSection from '@/components/CampaignsSection';
import OrganizeCampaignSection from '@/components/OrganizeCampaignSection';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans">
      
      <Header />

      {/* Hero Section */}
      <main className="flex-1 min-h-[85vh] flex items-center justify-center relative overflow-hidden py-24">
        {/* Background Image with optimized layout */}
        <div className="absolute inset-0 z-0 select-none">
          <Image
            src="/images/hero-campaign.jpg"
            alt="Campaña Visual Defpotec"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Gradients to merge image with dark UI and protect text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30 lg:from-black/90 lg:via-black/75 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/30" />
        </div>

        <div className="container mx-auto px-6 lg:px-16 relative z-10 w-full">
          
          {/* Left Text */}
          <div className="flex flex-col gap-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#006828]/40 bg-[#006828]/10 w-max text-sm text-[#4ade80] backdrop-blur-md">
              Salud Visual para Empresas y Comunidades
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-md">
              ¿Y tú cómo ves? <br />
              <span className="text-[#a7f3d0]">¡Con DEFPOTEC MX hoy sí ves bien!</span>
            </h2>
            
            <p className="text-lg text-slate-300 leading-relaxed mt-4 max-w-xl drop-shadow-md">
              En <strong className="text-white">DEFPOTEC MX</strong> redefinimos tu forma de ver el mundo. Inspirados en la precisión científica de los exámenes visuales, creamos soluciones oftálmicas premium con la calidez y el compromiso que mereces.
            </p>

            {/* Gran Botón de Citas directo */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
              <a
                href="#agendar-cita"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 py-4 sm:px-8 sm:py-5 text-base sm:text-lg md:text-xl font-extrabold text-white bg-[#006828] hover:bg-[#00501f] border-2 border-[#4ade80] rounded-2xl shadow-[0_0_35px_rgba(0,104,40,0.6)] transition-all transform hover:scale-[1.03] active:scale-[0.98] text-center cursor-pointer w-full sm:w-auto"
              >
                <span className="text-xl sm:text-2xl animate-bounce shrink-0">👉</span>
                <span className="tracking-wide">AGENDAR EXAMEN DE LA VISTA</span>
                <span className="text-lg sm:text-xl shrink-0">📅</span>
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* Sección de Agendar Citas en Próximas Campañas (Ubicada inmediatamente después del Hero) */}
      <CampaignsSection />

      {/* Sección CTA para Empresas */}
      <OrganizeCampaignSection />

    </div>
  );
}
