# Arquitectura del ERP

## Objetivo
La base del sistema ERP está diseñada para un backend modular en Node.js + Express y un frontend web en React + Vite, con capacidad de evolución a React Native en fases posteriores.

## Capa de presentación
- Frontend web inicial en React
- Rutas base para navegación
- Integración con API REST por medio de variables de entorno

## Capa de negocio
- API REST bajo Express
- Middleware global de errores y manejo seguro
- Rutas agrupadas por dominio

## Persistencia
- MongoDB como base de datos principal
- Mongoose para modelos y esquemas
- Configuración por variables de entorno

## Seguridad inicial
- CORS
- Helmet
- Rate limiting
- JWT y autenticación por roles en preparación para Fase 2

## Fase 1 concluida
- Estructura base del repositorio
- API de salud
- Frontend con navegación mínima
- Variables de entorno
- Documentación inicial
