import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/redux/StoreProvider";
import Footer from "@/components/Footer";

const geistSans = { variable: "--font-geist-sans" };
const geistMono = { variable: "--font-geist-mono" };

export const metadata: Metadata = {
  title: "Defpotec MX - ¿Y tú cómo ves? ¡Con Defpotec MX hoy sí ves bien!",
  description: "Servicios optométricos de alta calidad y jornadas visuales para empresas y comunidades con Defpotec MX.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">
        <StoreProvider>
          <div className="flex-grow flex flex-col">
            {children}
          </div>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
