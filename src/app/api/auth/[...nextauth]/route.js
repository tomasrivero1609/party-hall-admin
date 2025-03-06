import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Credenciales recibidas:", credentials);

          // Simula una base de datos de usuarios
          const user = { id: 1, email: "admin@example.com", password: "password123" };

          if (
            credentials.email === user.email &&
            credentials.password === user.password
          ) {
            console.log("Usuario autenticado:", user);
            return user;
          } else {
            console.error("Credenciales inválidas");
            return null;
          }
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // Página personalizada para iniciar sesión
    error: "/auth/error", // Página personalizada para errores
  },
  session: {
    strategy: "jwt", // Usa JSON Web Tokens para manejar sesiones
  },
  secret: process.env.NEXTAUTH_SECRET, // Clave secreta para firmar tokens
};

// Exporta funciones nombradas para manejar los métodos HTTP
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);