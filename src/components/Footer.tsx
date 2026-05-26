"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0a0a0a] text-slate-400 border-t border-white/10 pt-16 pb-8 px-6 md:px-12 mt-auto">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        
        {/* Columna 1: Branding */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex flex-col w-max select-none">
            <div className="h-1 w-full bg-[#006828]" />
            <span className="text-xl md:text-2xl font-black tracking-widest my-0.5 text-white">DEFPOTEC MX</span>
            <div className="h-1 w-full bg-[#9B0000]" />
          </Link>
          <p className="text-sm text-slate-500 leading-relaxed mt-2">
            Llevando salud visual de alta calidad y precisión clínica directamente a tu empresa, escuela o comunidad. Tu visión es nuestra pasión.
          </p>
          {/* Social Links */}
          <div className="flex gap-3 mt-2">
            <a 
              href="https://facebook.com/defpotecmx/" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
            <a 
              href="https://instagram.com/defpotecmx/" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a 
              href="https://wa.me/5589950935" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#006828] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.453L0 24zm6.59-4.846c1.6.95 3.16 1.449 4.825 1.451 5.432.003 9.85-4.414 9.853-9.85.002-2.634-1.02-5.11-2.881-6.974-1.862-1.863-4.337-2.89-6.977-2.892-5.437 0-9.854 4.416-9.857 9.853-.001 1.73.461 3.42 1.336 4.913L1.936 21.05l5.29-1.386c.002-.001.002-.001.002-.001-.001.001-.001.001-.001.001zm13.111-7.234c-.274-.136-1.62-.8-1.87-.89-.25-.09-.43-.136-.61.136-.18.273-.705.89-.865 1.072-.16.182-.32.205-.594.069-.273-.136-1.155-.426-2.2-1.358-.812-.724-1.36-1.618-1.52-1.89-.16-.273-.017-.42.12-.557.123-.122.274-.32.41-.478.137-.158.182-.27.273-.45.09-.18.046-.34-.023-.477-.069-.136-.61-1.477-.835-2.023-.22-.527-.44-.455-.61-.464-.155-.008-.335-.01-.515-.01-.18 0-.473.068-.72.34-.247.272-.943.92-.943 2.245s.965 2.6 1.1 2.782c.137.18 1.9 2.9 4.6 4.069.642.278 1.144.444 1.534.568.646.205 1.233.176 1.697.107.518-.077 1.62-.663 1.85-1.302.23-.639.23-1.186.16-1.303-.07-.11-.256-.205-.53-.341z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Enlaces Rápidos</h4>
          <nav className="flex flex-col gap-2.5 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <Link href="/jornadas" className="hover:text-white transition-colors">Jornadas</Link>
            <Link href="/servicios" className="hover:text-white transition-colors">Servicios</Link>
            <Link href="/nosotros" className="hover:text-white transition-colors">Nosotros</Link>
            <Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link>
          </nav>
        </div>

        {/* Columna 3: Contacto Directo */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Contacto</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-base shrink-0 mt-0.5">📍</span>
              <span>Atenas #1 Int.1, Col. San Álvaro, Azcapotzalco, CDMX</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-base shrink-0">📞</span>
              <a href="tel:+525589950935" className="hover:text-white transition-colors">Oficina: 55 8995 0935</a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-base shrink-0">📱</span>
              <a href="tel:+525528973384" className="hover:text-white transition-colors">Celular: 55 2897 3384</a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-base shrink-0">✉️</span>
              <a href="mailto:contacto@defpotecmx.com" className="hover:text-white transition-colors">contacto@defpotecmx.com</a>
            </li>
          </ul>
        </div>

        {/* Columna 4: Horarios */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Horarios</h4>
          <div className="flex flex-col gap-2 text-sm text-slate-500">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Lunes - Viernes:</span>
              <span className="text-slate-300 font-medium">9:00 - 18:00</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Sábado:</span>
              <span className="text-slate-300 font-medium">10:00 - 14:00</span>
            </div>
            <div className="flex justify-between">
              <span>Domingo:</span>
              <span className="text-slate-400">Cerrado</span>
            </div>
          </div>
        </div>

      </div>

      {/* Barra Inferior */}
      <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
        <p>&copy; {currentYear} DEFPOTEC MX. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <Link href="/contacto" className="hover:text-slate-400 transition-colors">Aviso de Privacidad</Link>
          <span>&middot;</span>
          <Link href="/contacto" className="hover:text-slate-400 transition-colors">Términos y Condiciones</Link>
        </div>
      </div>
    </footer>
  );
}
