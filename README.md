# Transformando Territorios — Plataforma de Impacto y Evidencias

Plataforma integral para documentar, monitorear y visibilizar iniciativas de impacto social y comunitario en Colombia. Permite a evaluadores y cooperantes consultar indicadores de cumplimiento, mapas interactivos territoriales, historias de vida, evidencias multimedia (fotos, videos, álbumes) e informes descargables.

---

## 🚀 Inicio Rápido

### Requisitos previos
- **Node.js**: v18 o superior (probado en v24.14)
- **npm**: v9 o superior

### 1. Modo Desarrollo (Recomendado)
Ejecuta tanto el backend (puerto 4000) como el frontend con Vite (puerto 3000 con recarga automática):

```bash
npm run dev
```

- **Frontend (Vite)**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

> En desarrollo, Vite redirige automáticamente las peticiones de `/api` y `/uploads` hacia el backend en el puerto 4000.

### 2. Modo Producción
Para compilar los recursos estáticos y servir la plataforma completa desde un único servidor Express:

```bash
# Compilar el frontend a frontend/dist
npm run build

# Iniciar el servidor
npm start
```

- Aplicación disponible en: [http://localhost:4000](http://localhost:4000)

---

## 🔐 Acceso Administrativo

Para gestionar iniciativas, editar indicadores, cargar evidencias y subir archivos de portada o informes:

- **Ruta de acceso**: `/admin/login` (o botón en la barra de navegación)
- **Usuario**: `admin`
- **Contraseña**: `admin123`

---

## 📁 Estructura del Proyecto

```
Transformando_Territorios/
├── backend/
│   ├── data/
│   │   └── db.json          # Base de datos local en JSON
│   ├── uploads/             # Almacén de evidencias multimedia y documentos
│   ├── server.js            # Servidor Express (API REST y servidor de estáticos)
│   └── package.json         # Dependencias del backend
├── frontend/
│   ├── public/              # Recursos públicos estáticos (imágenes, logos)
│   ├── src/
│   │   ├── components/      # Componentes UI reutilizables (Navbar, Footer, MapView, etc.)
│   │   ├── pages/           # Vistas (Landing, Projects, ProjectDetail, Admin, etc.)
│   │   ├── context/         # AuthContext para sesión administrativa
│   │   ├── lib/             # Cliente API (Axios) y utilidades
│   │   ├── App.jsx          # Enrutamiento principal
│   │   └── index.jsx        # Punto de entrada
│   ├── vite.config.js       # Configuración de Vite con alias @ y proxy
│   ├── tailwind.config.js   # Configuración de Tailwind CSS
│   └── package.json         # Dependencias del frontend
├── package.json             # Scripts de orquestación de la raíz
└── README.md
```

---

## 📡 Endpoints Principales de la API

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|:---:|
| `GET` | `/api/health` | Estado del servidor | No |
| `POST` | `/api/auth/login` | Inicio de sesión | No |
| `GET` | `/api/auth/me` | Información del usuario actual | Sí |
| `GET` | `/api/projects` | Lista de todas las iniciativas | No |
| `GET` | `/api/projects/:slug` | Detalle completo de una iniciativa | No |
| `GET` | `/api/projects/summary` | Estadísticas agregadas de impacto | No |
| `POST` | `/api/projects` | Crear nueva iniciativa | Sí |
| `PATCH` | `/api/projects/:slug` | Actualizar iniciativa existente | Sí |
| `DELETE` | `/api/projects/:slug` | Eliminar iniciativa | Sí |
| `POST` | `/api/upload` | Subida de archivos (imágenes/documentos) | Sí |
