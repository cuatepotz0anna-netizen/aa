# API REST - ERP

## Base URL
- Desarrollo: http://localhost:5000/api

## Endpoints base
- GET /api/health
- GET /api/ping
- GET /

## Formato de respuesta
{
  "success": true,
  "data": {},
  "message": "Operación realizada correctamente"
}

## Manejo de errores
Las rutas no encontradas y los errores internos quedan centralizados en middleware global.

## Notas
La API ya está lista para crecer con módulos y autenticación en fases posteriores.
