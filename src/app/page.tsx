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
              Visión 20/20 al alcance de tus ojos
            </div>
            
            <h2 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-md">
              Claridad <br />
              <span className="text-[#a7f3d0]">Absoluta</span> para tu Vida
            </h2>
            
            <p className="text-lg text-slate-300 leading-relaxed mt-4 max-w-xl drop-shadow-md">
              En <strong className="text-white">DEFPOTEC MX</strong> redefinimos tu forma de ver el mundo. Inspirados en la precisión científica de los exámenes visuales, creamos soluciones oftálmicas premium con la calidez y el compromiso que mereces.
            </p>
          </div>

        </div>
      </main>

      {/* Sección CTA para Empresas / Escuelas */}
      <OrganizeCampaignSection />

      {/* Sección de Próximas Campañas */}
      <CampaignsSection />

    </div>
  );
}
