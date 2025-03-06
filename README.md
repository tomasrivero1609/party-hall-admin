# Party Hall Admin

Sistema de administración de eventos y pagos diseñado para gestionar eventos, tipos de eventos y pagos asociados de manera eficiente.

![Preview](https://via.placeholder.com/800x400?text=Party+Hall+Admin+Preview)  
*(Reemplaza esta URL con una captura de pantalla real de tu aplicación si deseas mostrar una vista previa.)*

## Características principales
- **Registro y gestión de eventos**: Crea, edita y elimina eventos fácilmente.
- **Tipos de eventos**: Asigna categorías a los eventos (por ejemplo, bodas, cumpleaños).
- **Pagos asociados**: Registra pagos para cada evento con validaciones robustas.
- **Filtrado dinámico**: Filtra pagos por nombre de evento o tipo de evento.
- **Interfaz moderna**: Diseño limpio y responsive con React, Next.js y Tailwind CSS.

## Tecnologías utilizadas
- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Prisma (ORM), PostgreSQL
- **Autenticación**: (Agrega aquí si usas algún sistema de autenticación, como Supabase o Auth.js)
- **Despliegue**: Vercel

## Requisitos previos
Antes de ejecutar el proyecto, asegúrate de tener instalado lo siguiente:
- [Node.js](https://nodejs.org/) (v16 o superior)
- [PostgreSQL](https://www.postgresql.org/) configurado en tu entorno local o remoto.

## Instalación y configuración
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu_usuario/party-hall-admin.git
   cd party-hall-admin
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz del proyecto y configura las variables de entorno necesarias:
   ```env
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_base_datos
   NEXTAUTH_SECRET=tu_secreto
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Ejecuta las migraciones de la base de datos:
   ```bash
   npx prisma migrate dev
   ```
5. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
6. Accede a la aplicación en tu navegador en `http://localhost:3000`

## Despliegue
El proyecto está configurado para ser desplegado en Vercel:
1. Instala la CLI de Vercel si no la tienes:
   ```bash
   npm install -g vercel
   ```
2. Ejecuta el comando para desplegar:
   ```bash
   vercel
   ```

## Contribución
Si deseas contribuir al proyecto:
1. Haz un fork del repositorio.
2. Crea una rama con tu funcionalidad o corrección de errores: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios y haz commit: `git commit -m "Descripción del cambio"`
4. Envía un pull request para su revisión.

## Licencia
Este proyecto está bajo la licencia MIT. Puedes ver el archivo [LICENSE](LICENSE) para más detalles.

---

*Si tienes alguna duda o sugerencia, no dudes en abrir un issue o contactar al equipo de desarrollo.*
