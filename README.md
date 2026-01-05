# DoubleV Technical Test - Debt Management System

Sistema de gestión de deudas entre amigos desarrollado como prueba técnica.

## 📁 Estructura del Proyecto

```
double-v-technical-pr/
├── backend/          # API REST en Node.js + Express
└── frontend/         # Aplicación React + TypeScript + Vite
```

## 🚀 Inicio Rápido

### Backend

```bash
cd backend
npm install
npm run dev
```

Ver [Backend README](./backend/README.md) para instrucciones detalladas.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Ver [Frontend README](./frontend/README.md) para instrucciones detalladas.

## 🛠️ Stack Tecnológico

- **Backend:** Node.js, Express, Prisma, PostgreSQL (Supabase), DynamoDB
- **Frontend:** React, TypeScript, Vite, React Router, Axios

## 💡 Decisiones Técnicas

### Lenguajes

- **Node.js + TypeScript (Backend):** Elección basada en experiencia previa y comodidad de desarrollo. TypeScript proporciona tipado estático que ayuda a prevenir errores y mejora la mantenibilidad del código.
- **React + TypeScript (Frontend):** Seleccionado por familiaridad con el ecosistema React y la necesidad de una interfaz interactiva y reactiva.

### Librerías Principales

Las librerías fueron seleccionadas mediante investigación y sugerencias de herramientas de desarrollo asistido:

**Backend:**
- **Express:** Framework minimalista y flexible para APIs REST
- **Prisma:** ORM moderno con tipado fuerte y migraciones automáticas
- **Zod:** Validación de esquemas con TypeScript-first approach
- **Winston:** Sistema de logging estructurado y configurable
- **JWT (jsonwebtoken):** Autenticación stateless estándar
- **DynamoDB (AWS SDK):** Caché de alta disponibilidad para mejorar rendimiento

**Frontend:**
- **Vite:** Build tool rápido con HMR (Hot Module Replacement) excelente
- **React Router:** Enrutamiento declarativo para SPA
- **React Hook Form + Zod:** Validación de formularios eficiente y type-safe
- **Axios:** Cliente HTTP con interceptores para manejo de tokens

