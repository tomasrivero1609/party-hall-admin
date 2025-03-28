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
          const users = [
            {
              id: 1,
              email: "ffacundonicolas@gmail.com",
              password: "eventos225",
              role: "admin", // Admin tiene acceso completo
            },
            {
              id: 2,
              email: "danielzoque50@gmail.com",
              password: "danisub123",
              role: "subadmin", // Subadmin tiene acceso limitado
            },
            {
              id: 3,
              email: "user@example.com",
              password: "password789",
              role: "user", // User tiene acceso mínimo
            },
          ];
      
          const user = users.find(
            (u) => u.email === credentials.email && u.password === credentials.password
          );
      
          if (user) {
            console.log("Usuario autenticado:", user);
            return user; // Devuelve el usuario con su rol
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
  callbacks: {
    // Agrega el campo "role" al token JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Copia el rol del usuario al token
      }
      return token;
    },
    // Agrega el campo "role" a la sesión
    async session({ session, token }) {
      session.user.role = token.role; // Copia el rol del token a la sesión
      return session;
    },
  },
};

// Exporta funciones nombradas para manejar los métodos HTTP
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);