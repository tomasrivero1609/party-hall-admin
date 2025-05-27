import "./globals.css";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react"
import Providers from "./providers"; // Importa el componente Providers

export const metadata = {
  title: "Salón de Eventos - Administración",
  description: "Sistema de administración para salón de eventos. Gestiona eventos, pagos y calendario de manera eficiente.",
  keywords: "eventos, administración, salón, pagos, calendario",
  authors: [{ name: "Salón de Eventos" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 antialiased">
        <Analytics/>
        {/* Envuelve toda la aplicación con el componente Providers */}
        <Providers>
          <div className="relative min-h-screen">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-secondary-200/30 to-primary-200/30 rounded-full blur-3xl"></div>
            </div>
            
            <Navbar />
            
            <main className="relative z-10 pt-16">
              {children}
            </main>
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'white',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
          </div>
        </Providers>
      </body>
    </html>
  );
}