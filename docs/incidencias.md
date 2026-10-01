# Registro único de incidencias y ejecución

## Incidencia 01 — Sesiones con refresh tokens no persistentes ni rotativos
- Evidencia y ubicación:
  - `backend/tests/auth.test.js`: la prueba de regresión del flujo `login -> refresh -> reuse` fallaba antes de la corrección.
  - `backend/src/modules/auth/auth.controller.js`: la implementación original devolvía solo `accessToken` y no almacenaba sesiones server-side.
- Impacto y prioridad:
  - Impacto alto: no había renovación segura ni revocación real, con riesgo de reutilización de tokens y sesiones inconsistentes.
  - Prioridad alta.
- Corrección:
  - Añadido `backend/src/modules/auth/session.model.js` para persistir sesiones server-side.
  - Implementado hash de refresh tokens y rotación con revocación del token anterior en `auth.controller.js`.
  - Añadido control de tipología JWT (`access`/`refresh`) y validación de usuario activo.
- Validación y resultado:
  - Comando ejecutado: `cd /d C:\proyectoanabanana\pk\backend && .\node_modules\.bin\jest.cmd --runInBand --verbose`
  - Resultado: 2 suites pasadas, 8 tests pasados, 0 fallidos.
- Estado: resuelta

## Incidencia 02 — Repositorio real y Git no estaban verificados en esta sesión
- Evidencia y ubicación:
  - `C:\proyectoanabanana\pk` contiene el checkout real del proyecto, pero no había un directorio `.git` visible ni metadatos de rama en el entorno disponible.
- Impacto y prioridad:
  - Impacto medio: no se puede crear o publicar rama/PR desde una checkout no inicializada.
  - Prioridad media.
- Corrección:
  - Se documenta la limitación real y se trabajó sobre la copia del proyecto presente en disco.
- Validación y resultado:
  - Se comprobó la ausencia de `.git` en la raíz del proyecto y la falta de Git metadata disponible.
- Estado: bloqueada por infraestructura del repositorio

## Incidencia 03 — Frontend validado con build real, pero con dependencias sin auditoría completa
- Evidencia y ubicación:
  - `frontend/package.json` y resultado real de instalación.
- Impacto y prioridad:
  - Impacto medio: la app web compila, pero la instalación reporta 4 vulnerabilidades (3 moderadas, 1 alta).
  - Prioridad media.
- Corrección:
  - Se ejecutó una instalación real y build de producción: `cd /d C:\proyectoanabanana\pk\frontend && npm install && npm run build`.
- Validación y resultado:
  - La build terminó correctamente con Vite en producción.
- Estado: pendiente de remediación de dependencias
