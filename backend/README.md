# Backend - DoubleV Debt Management API

API REST desarrollada con Node.js, Express y TypeScript para gestionar deudas entre usuarios.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- PostgreSQL (Supabase)
- AWS DynamoDB configurado

### Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. Configurar Prisma:
```bash
npm run generate
npm run migrate
```

4. Iniciar servidor de desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura

```
backend/
├── src/
│   ├── config/          # Configuración (DB, DynamoDB, env)
│   ├── controllers/     # Controladores de rutas
│   ├── middleware/      # Middlewares (auth, validation)
│   ├── models/          # Esquemas Prisma
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades
│   ├── validators/      # Validaciones con Zod
│   └── app.ts           # Configuración Express
├── prisma/
│   └── schema.prisma    # Esquema de base de datos
└── package.json
```

## 🔌 Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login

### Deudas
- `GET /api/debts` - Listar deudas (query: ?status=pending|paid|all)
- `GET /api/debts/:id` - Detalle de deuda
- `POST /api/debts` - Crear deuda
- `PUT /api/debts/:id` - Editar deuda
- `DELETE /api/debts/:id` - Eliminar deuda
- `PATCH /api/debts/:id/pay` - Marcar como pagada

## 🛠️ Scripts

- `npm run dev` - Desarrollo con hot-reload
- `npm run build` - Compilar TypeScript
- `npm run start` - Ejecutar producción
- `npm run migrate` - Ejecutar migraciones Prisma
- `npm run generate` - Generar cliente Prisma
- `npm run studio` - Abrir Prisma Studio

