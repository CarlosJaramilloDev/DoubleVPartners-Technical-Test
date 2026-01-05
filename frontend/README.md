# Frontend - DoubleV Debt Management

Aplicación React desarrollada con TypeScript y Vite para gestionar deudas entre usuarios.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Backend ejecutándose en `http://localhost:3000`

### Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con la URL de tu API
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   └── common/       # Button, Input, Card, Loading
│   ├── context/          # Context API (AuthContext)
│   ├── pages/            # Páginas de la aplicación
│   ├── services/         # Cliente API (Axios)
│   ├── styles/           # Estilos globales y variables CSS
│   ├── utils/            # Utilidades y constantes
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Punto de entrada
├── .env.example          # Ejemplo de variables de entorno
└── package.json
```

## 🎨 Paleta de Colores

La aplicación usa la paleta de colores DoubleV definida en `src/styles/variables.css`:
- **Primarios:** Púrpura (#6A1B9A)
- **Secundarios:** Cyan (#00ACC1)
- **UI:** Colores de fondo, texto, éxito, error, etc.

## 🔐 Autenticación

La autenticación se maneja mediante:
- **Context API** (`AuthContext`) para estado global
- **LocalStorage** para persistencia del token
- **ProtectedRoute** para proteger rutas privadas
- **Interceptores Axios** para agregar token a las peticiones

## 🛠️ Scripts

- `npm run dev` - Desarrollo con hot-reload
- `npm run build` - Compilar para producción
- `npm run preview` - Preview del build de producción
- `npm run lint` - Ejecutar linter

## 📦 Dependencias Principales

- **react** + **react-dom** - Framework UI
- **react-router-dom** - Enrutamiento
- **axios** - Cliente HTTP
- **react-hook-form** - Manejo de formularios
- **zod** - Validación de esquemas
- **@hookform/resolvers** - Integración Zod + React Hook Form

## 🔌 Endpoints Utilizados

- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/debts` - Listar deudas
- `POST /api/debts` - Crear deuda
- `PUT /api/debts/:id` - Editar deuda
- `DELETE /api/debts/:id` - Eliminar deuda
- `PATCH /api/debts/:id/pay` - Marcar como pagada

## 🎯 Próximos Pasos

- [ ] Implementar listado de deudas con filtros
- [ ] Formulario de creación/edición de deudas
- [ ] Vista de detalle de deuda
- [ ] Exportación de deudas (JSON/CSV)
- [ ] Estadísticas y agregaciones
- [ ] Mejoras de UX y responsive design
