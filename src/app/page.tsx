"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import CampaignsSection from '@/components/CampaignsSection';
import OrganizeCampaignSection from '@/components/OrganizeCampaignSection';
import Header from '@/components/Header';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseenter", () => setIsHovered(true));
      card.addEventListener("mouseleave", () => setIsHovered(false));
    }

    return () => {
      if (card) {
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("mouseenter", () => setIsHovered(true));
        card.removeEventListener("mouseleave", () => setIsHovered(false));
      }
    };
  }, []);

  const maskSize = isHovered ? 120 : 0;

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans">
      
      <Header />

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-[20%] w-[40%] h-[40%] bg-[#006828]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 py-12">
          
          {/* Left Text */}
          <div className="flex flex-col gap-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#006828]/40 bg-[#006828]/10 w-max text-sm text-[#4ade80]">
              Visión 20/20 al alcance de tus ojos
            </div>
            
            <h2 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Claridad <br />
              <span className="text-[#a7f3d0]">Absoluta</span> para tu Vida
            </h2>
            
            <p className="text-lg text-slate-400 leading-relaxed mt-4">
              En <strong className="text-white">DEFPOTEC MX</strong> redefinimos tu forma de ver el mundo. Inspirados en la precisión científica de los exámenes visuales, creamos soluciones oftálmicas premium con la calidez y el compromiso que mereces.
            </p>
          </div>

          {/* Right Interactive Card */}
          <div className="flex justify-center lg:justify-end">
            <div 
              ref={cardRef}
              className="relative w-full max-w-md aspect-[4/3] bg-white rounded-3xl overflow-hidden shadow-2xl cursor-crosshair border-4 border-[#006828]/20"
            >
              {/* Top/Bottom colored bars inside card to match logo vibe */}
              <div className="absolute top-4 left-4 right-4 h-1.5 bg-[#006828] z-0 rounded-full" />
              <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-[#9B0000] z-0 rounded-full" />

              {/* LAYER 1: Crisp Snellen Chart (Realista) */}
              <div className="absolute inset-0 flex flex-col items-center justify-start pt-6 pb-4 z-0 select-none bg-[#fdfbf7]">
                
                {/* Header de la cartulina */}
                <div className="w-full flex justify-between px-6 mb-2 opacity-40">
                  <span className="text-[10px] font-bold text-black">SNELLEN EYE CHART</span>
                  <span className="text-[10px] font-bold text-black">3m - 10 ft</span>
                </div>

                {/* Lineas del Snellen */}
                <div className="flex flex-col items-center w-full px-4 gap-1.5 flex-1 justify-center">
                  {/* Line 1 */}
                  <div className="flex justify-between w-full items-center">
                    <span className="text-[10px] text-gray-400 w-8">1</span>
                    <span className="text-[4.5rem] leading-none font-serif font-black text-black">E</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">20/200</span>
                  </div>
                  {/* Line 2 */}
                  <div className="flex justify-between w-full items-center">
                    <span className="text-[10px] text-gray-400 w-8">2</span>
                    <span className="text-[3rem] leading-none font-serif font-black text-black tracking-[0.2em]">F P</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">20/100</span>
                  </div>
                  {/* Line 3 */}
                  <div className="flex justify-between w-full items-center">
                    <span className="text-[10px] text-gray-400 w-8">3</span>
                    <span className="text-[2.2rem] leading-none font-serif font-black text-black tracking-[0.4em]">T O Z</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">20/70</span>
                  </div>
                  {/* Line 4 */}
                  <div className="flex justify-between w-full items-center">
                    <span className="text-[10px] text-gray-400 w-8">4</span>
                    <span className="text-[1.8rem] leading-none font-serif font-black text-black tracking-[0.5em]">L P E D</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">20/50</span>
                  </div>
                  {/* Line 5 */}
                  <div className="flex justify-between w-full items-center">
                    <span className="text-[10px] text-gray-400 w-8">5</span>
                    <span className="text-[1.4rem] leading-none font-serif font-black text-black tracking-[0.6em]">P E C F D</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">20/40</span>
                  </div>
                  {/* Line 6 */}
                  <div className="flex justify-between w-full items-center">
                    <span className="text-[10px] text-gray-400 w-8">6</span>
                    <span className="text-[1.2rem] leading-none font-serif font-black text-black tracking-[0.6em]">E D F C Z P</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">20/30</span>
                  </div>
                  {/* Line 7 */}
                  <div className="flex justify-between w-full items-center">
                    <span className="text-[10px] text-gray-400 w-8">7</span>
                    <span className="text-[1rem] leading-none font-serif font-black text-black tracking-[0.7em]">F E L O P Z D</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">20/25</span>
                  </div>
                  
                  {/* Linea Verde de Marca */}
                  <div className="w-full h-[2px] bg-[#006828] my-0.5 opacity-80" />
                  
                  {/* Line 8 - DEFPOTEC (La línea 20/20) */}
                  <div className="flex justify-between w-full items-center relative">
                    <span className="text-[10px] font-bold text-[#9B0000] w-8">8</span>
                    <span className="text-[14px] leading-none font-serif font-black text-[#006828] tracking-[0.8em] ml-2">D E F P O T E C</span>
                    <span className="text-[10px] font-bold text-[#9B0000] w-8 text-right">20/20</span>
                  </div>

                  {/* Linea Roja de Marca */}
                  <div className="w-full h-[2px] bg-[#9B0000] my-0.5 opacity-80" />

                  {/* Line 9 */}
                  <div className="flex justify-between w-full items-center">
                    <span className="text-[10px] text-gray-400 w-8">9</span>
                    <span className="text-[10px] leading-none font-serif font-black text-black tracking-[0.9em] ml-1">L E F O D P C T</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">20/15</span>
                  </div>
                </div>
              </div>

              {/* LAYER 2: Frosted Glass Overlay */}
              <motion.div 
                className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[8px]"
                animate={{
                  WebkitMaskImage: `radial-gradient(${maskSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, transparent 100%, black 100%)`,
                  maskImage: `radial-gradient(${maskSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, transparent 100%, black 100%)`,
                } as any}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
              />

              {/* LENS BORDER */}
              <motion.div 
                className="absolute z-20 pointer-events-none rounded-full border-2 border-[#006828]/50 shadow-[inset_0_0_15px_rgba(0,104,40,0.3),0_0_15px_rgba(0,104,40,0.3)] bg-[#4ade80]/5 backdrop-brightness-110"
                animate={{
                  x: mousePosition.x - maskSize,
                  y: mousePosition.y - maskSize,
                  width: maskSize * 2,
                  height: maskSize * 2,
                  opacity: isHovered ? 1 : 0
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
              />

              {/* Instructivo sobre la tarjeta si no está siendo hovereada */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                animate={{ opacity: isHovered ? 0 : 1 }}
              >
                <div className="px-4 py-2 bg-black/80 backdrop-blur-md rounded-full text-sm font-medium text-white shadow-xl flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  Pasa el cursor aquí
                </div>
              </motion.div>
            </div>
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
