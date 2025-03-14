import "./globals.css";
import Navbar from "./components/Navbar";
import { Analytics } from "@vercel/analytics/react"
import Providers from "./providers"; // Importa el componente Providers

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">
      <Analytics/>
        {/* Envuelve toda la aplicación con el componente Providers */}
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}