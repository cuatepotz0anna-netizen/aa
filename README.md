# ERP Project

Este repositorio contiene la base arquitectónica de una solución ERP modular pensada para web y Android mediante React Native/Web, con backend en Node.js + Express + MongoDB Atlas y Mongoose.

## Fase 1 completada

Se preparó la infraestructura base del proyecto con:

- Backend Node.js + Express
- Mongoose y conexión configurable a MongoDB
- Estructura modular lista para crecer
- Frontend base con Vite + React
- Variables de entorno
- Documentación inicial
- Endpoints de salud y pruebas

## Estructura

- backend/: API REST y lógica de negocio
- frontend/: aplicación web base para la capa de presentación

## Requisitos principales

- Node.js 20+
- MongoDB Atlas o MongoDB local
- npm

## Configuración rápida

1. Copiar variables de entorno
   - backend/.env.example -> backend/.env
   - frontend/.env.example -> frontend/.env
2. Instalar dependencias
   - cd backend && npm install
   - cd frontend && npm install
3. Ejecutar backend
   - cd backend && npm run dev
4. Ejecutar frontend
   - cd frontend && npm run dev

## Estado

La Fase 1 quedó preparada y verificada con pruebas básicas. No se avanza automáticamente a la siguiente fase sin autorización.
