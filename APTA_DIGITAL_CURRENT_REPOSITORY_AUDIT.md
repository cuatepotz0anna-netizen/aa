# Apta Digital — Auditoría del repositorio actual

**Fecha:** 2026-09-28  
**Alcance:** Fase 0 únicamente. Se inspeccionaron frontend, backend, modelos, rutas, middleware, pruebas, documentación, manifiestos, ejemplos de entorno y configuración Git. No se leyeron los archivos `.env`; no se modificó código durante esta auditoría. Este informe refleja también los cambios locales recientes de disponibilidad degradada de API, CORS de desarrollo y mensajes de error.

## 1. Resumen ejecutivo

El repositorio es un prototipo ERP en etapa temprana, no todavía un ERP operativo. La base tecnológica React/Vite y Express/Mongoose existe; hay autenticación JWT, sesiones con refresh token persistidas, control por roles en rutas de usuarios, endpoint de salud y una interfaz inicial para login, registro y estado de la API. No existen todavía módulos funcionales de ventas, inventario, clientes, compras, finanzas ni reportes.

La conexión de desarrollo observada no alcanza MongoDB: el backend registró `querySrv ENOTFOUND` para un host Atlas de ejemplo (`cluster0.xxxxx.mongodb.net`). La API ahora puede iniciar sin MongoDB, exponer health y responder `503` a operaciones que requieren base de datos; health informa `databaseConnected: false`. Por tanto, el problema de red opaco está diagnosticado, pero el login real seguirá bloqueado hasta configurar una URI válida en `backend/.env`.

**Conclusión:** antes de construir módulos ERP o desplegar, hay que estabilizar configuración/arranque, cerrar fallos de seguridad de autenticación y tenancy, aclarar propiedad Git y hacer reproducible la suite de pruebas.

## 2. Estructura y tecnologías encontradas

```text
.git/                         raíz Git
backend/.git/                 repositorio Git anidado
backend/
  src/app.js                  Express, CORS, Helmet, limitador, middleware global
  src/server.js               arranque, Mongoose y seed inicial
  src/config/database.js      helper de conexión separado
  src/middleware/             JWT/RBAC y errores
  src/modules/auth/           rutas, controlador y sesiones
  src/modules/permissions/    modelo y seed de permisos
  src/modules/roles/          modelo y seed de roles
  src/modules/users/          modelo, controlador y rutas CRUD
  tests/                      api.test.js, auth.test.js
frontend/
  src/App.jsx                 login/register, resumen, API y layout
  src/context/AuthContext.jsx persistencia local de usuario/token
  src/components/             Brand, ProtectedRoute
  src/screens/                LoginScreen, RegisterScreen
  src/services/               api.js, authService.js
  src/modules/                vacío
  src/styles.css              CSS propio
  vite.config.js              Vite
  dist/                       salida local de build
```

- **Frontend:** React 18, React Router 6, Vite 5 y CSS plano. No se detectaron Tailwind, Styled Components ni una librería de componentes/iconos.
- **Backend:** Node.js/CommonJS, Express 4, Mongoose 8, JWT, bcryptjs, Helmet, CORS, Morgan y express-rate-limit.
- **Dependencias:** manifiestos y lockfiles separados para backend y frontend. También existe un `package-lock.json` raíz cuya tabla `packages` está vacía, pero no hay `package.json` raíz: no representa un workspace instalable.
- **Imágenes:** no se encontró archivo del logo. El frontend usa el wordmark provisional `AD`.
- **React Native:** README y arquitectura lo mencionan como posibilidad futura; no hay dependencias ni aplicación React Native en el código inspeccionado.

## 3. Arquitectura y comunicación frontend/backend

**Flujo previsto:** React/Vite → API REST Express → Mongoose → MongoDB Atlas.

**URL API:** `VITE_API_URL`, con fallback a `http://localhost:5000/api`, aparece por separado en `frontend/src/services/api.js` y `frontend/src/services/authService.js`.

**Rutas de backend encontradas:**

- Raíz: `GET /`.
- Sistema: `GET /api/health`, `GET /api/ping`, `GET /api/seed-defaults`.
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/profile`, `POST /api/auth/logout` y `/logout/all`.
- Usuarios: `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `PUT /api/users/:id`, `PATCH /api/users/:id/deactivate`.

Las rutas de auth y usuarios pasan por un control de disponibilidad de MongoDB; con DB desconectada contestan `503`. Health permanece disponible y expone el estado de conexión. En desarrollo, CORS admite `localhost:5173` y `127.0.0.1:5173`; también compara contra `CLIENT_URL`.

**Lo que consume realmente el frontend:** health, login y registro. No consume el perfil, refresh/logout server-side ni CRUD de usuarios. `apiRequest` y `fetchProfile` están exportados pero no tienen consumidores detectados. El frontend tiene únicamente rutas React de login, registro, resumen y health.

## 4. Persistencia y modelos

Modelos Mongoose encontrados: `User`, `Session`, `Role` y `Permission`.

- `User` almacena nombre, email, hash de password, rol, actividad y referencias opcionales `companyId`, `tenantId` y `branchId`.
- `Session` almacena hash del refresh token, familia, vencimiento, revocación y actividad.
- `Role` y `Permission` tienen seeds idempotentes con upsert.
- No existen modelos Company, Tenant o Branch en los módulos encontrados, aunque User los referencia.
- No hay modelos ni rutas para productos, inventario, ventas, clientes, compras, proveedores o finanzas.

La conexión se realiza en `server.js` directamente. `src/config/database.js` exporta otro helper `connectDB`, pero no se usa en el arranque actual. El seed de roles/permisos corre después de conectar. Su error queda dentro del mismo catch que la conexión, que lo registraría incorrectamente como “MongoDB connection failed”.

## 5. Autenticación y autorización

**Implementado en backend:** registro, login, JWT access/refresh, rotación de refresh tokens, hash SHA-256 de refresh tokens guardados, validación de tipo de token, revocación, perfil protegido y middleware `authorize` por roles. Las rutas de usuarios permiten `ADMIN`/`GERENTE`; desactivar exige `ADMIN`.

**Implementado en frontend:** formulario login/registro, persistencia local, guard de navegación por existencia de usuario en `localStorage` y cierre de sesión local.

**No conectado/incompleto:** el frontend guarda solo el access token; no guarda ni rota refresh token, no consulta perfil para restaurar/validar sesión y el logout no llama a la revocación backend. El guard del frontend solo organiza navegación: la autorización real debe continuar en backend.

**Roles:** el código usa `ADMIN`, `GERENTE`, `VENTAS`, `COMPRAS`, `ALMACEN`, `FINANZAS`, `RRHH`, `EMPLEADO`, distintos de los roles objetivo `ADMINISTRADOR`, `SUPERVISOR`, `USUARIO`. No existe una matriz de permisos por clave en middleware; el modelo/seed Permission no se usa para autorizar.

## 6. Validación, datos y manejo de errores

- Auth comprueba presencia de campos y normaliza email a minúsculas; User aplica campos requeridos, `unique`, lowercase, enum de rol y hashing bcrypt con coste 10.
- No se observó esquema formal de validación de requests, política de complejidad de contraseña, validación consistente de ObjectId ni límites/paginación/búsqueda en usuarios.
- `updateUser` aplica el body recibido casi íntegro (solo elimina `password`), ampliando superficie de asignación masiva.
- Los errores pasan por middleware global; en cualquier entorno distinto de `production` incluye stack en respuesta.
- Respuestas de éxito/error no son completamente uniformes entre controladores.

## 7. Seguridad y riesgos priorizados

### Críticos antes de habilitar registro público o desplegar

1. **Escalada de privilegios en registro:** `auth.controller.register` acepta `role` y `tenantId` del body y usa `ADMIN` cuando no se envía rol. Un visitante puede intentar registrarse como administrador. El backend debe asignar rol seguro del lado servidor y reservar altas privilegiadas.
2. **JWT con secreto de fallback conocido:** controlador y middleware usan `dev_secret_change_me` si falta `JWT_SECRET`. Producción debe fallar al arrancar con secreto ausente/débil; no usar fallback en producción.
3. **Ruta pública de seeds:** `GET /api/seed-defaults` muta la base de datos y no tiene autenticación ni restricción de entorno.
4. **CORS permisivo cuando falta `CLIENT_URL`:** la condición acepta cualquier origin si la variable no está configurada, incluso en producción. Hay que exigir allowlist explícita para producción.
5. **Aislamiento empresarial incompleto:** endpoints de usuarios consultan globalmente por `isActive`, no acotan por `companyId`/tenant; el registro acepta tenant del cliente. Los campos `companyId`, `tenantId`, `branchId` no forman aún un modelo de aislamiento validado.

### Importantes

- Los access tokens y el usuario se almacenan en `localStorage`, expuestos si ocurre XSS. La protección visual del frontend no sustituye `protect`/`authorize` del backend.
- `updateUser` permite actualizar campos sensibles distintos de password; necesita allowlist por operación y autorización.
- Las permissions persistidas no se aplican a rutas.
- El cierre de sesión frontend elimina storage sin revocar la sesión persistida.
- El rate limiter de auth existe y se suma al global; falta documentar comportamiento de producción y proxies confiables.
- `.env.example` contiene `JWT_SECRET=change_this_secret` y URI plantilla: deben quedar inequívocamente identificados como valores no utilizables y nunca copiarse tal cual a producción.

## 8. Entornos, Git y despliegue

- `.gitignore` raíz y `backend/.gitignore` excluyen `.env`, `.env.*` y `node_modules`, y permiten `.env.example`. No se leyó ningún secreto. Las reglas evitan nuevas inclusiones, pero no prueban por sí solas que un `.env` nunca haya sido rastreado.
- Hay `.git` en la raíz y otro `.git` dentro de `backend`; existen dos ámbitos Git anidados. Una comprobación previa de la raíz reportó el contenido del proyecto como no rastreado; el estado no se pudo volver a confirmar de forma fiable durante esta auditoría. Antes de commits/publicación se debe decidir si backend será submódulo/repositorio separado o parte del repositorio raíz y verificar ambos índices.
- `backend/package.json` tiene `dev`, `start` y `test`; frontend tiene `dev`, `build`, `preview`. No hay `package.json` raíz.
- Backend ya usa `process.env.PORT`; tras los cambios recientes inicia Express aunque Atlas falle, y health distingue liveness de conexión DB. Falta cierre graceful y una estrategia definida de readiness/reintentos.
- Frontend genera `dist`, pero no se encontró `_redirects` para fallback de `BrowserRouter` en Cloudflare Pages; los deep links requieren fallback SPA.
- No se encontraron workflows CI, configuración Render ni Cloudflare Pages.
- **Render, pendiente de validar:** root `backend`, instalación con lockfile, start `npm start`, variables `PORT` (asignada por Render), `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_ENV` y eventualmente `REFRESH_TOKEN_TTL`.
- **Cloudflare Pages, pendiente de validar:** root `frontend`, build `npm run build`, output `dist`, `VITE_API_URL` apuntando al backend Render y fallback SPA.

## 9. Pruebas y estado observado

- `backend/tests/api.test.js`: raíz, health, CORS loopback en desarrollo, auth devuelve 503 si Mongo está desconectado y ruta inexistente (5 pruebas definidas).
- `backend/tests/auth.test.js`: registro/hash, login, credenciales inválidas, JWT inválido y rotación/reuso de refresh (5 pruebas). Usa `mongodb-memory-server` y depende de descargar/iniciar un binario MongoDB.
- `docs/incidencias.md` afirma una ejecución histórica con 2 suites/8 pruebas aprobadas, pero no es evidencia reproducida en esta auditoría; el mismo documento contiene afirmaciones antiguas incompatibles con el árbol Git actual.
- Durante la sesión se observó el error de resolución Atlas del host de ejemplo. También se verificó manualmente desde navegador: `GET /api/health` devuelve 200 y `databaseConnected: false`; `POST /api/auth/login` llega al backend y devuelve 503 con explicación; frontend y CORS funcionan en `127.0.0.1:5173`.
- No se pudo confirmar aquí una ejecución Jest/build completa: las llamadas de terminal devolvieron repetidamente salida residual de descarga MongoDB. No se marca esa validación como aprobada.

## 10. Estado funcional

**Funciona o está implementado:** layout React, login/registro contra API, health, guard visual, manejo visual de errores/carga, modelos User/Role/Permission/Session, hash de contraseña, access/refresh token en backend, refresh rotativo server-side, middleware JWT/roles para rutas de usuarios, rate limits, Helmet y middleware centralizado de errores.

**Incompleto o no disponible:** login contra la base actual por URI Atlas inválida; ciclo refresh/logout desde frontend; endpoint frontend de perfil; roles objetivo; autorización granular por Permission; aislamiento empresarial; interfaces de usuarios y módulos ERP; logo oficial; despliegue/CI; validación automatizada actual reproducible.

## 11. Deuda técnica y documentación

- `README.md` y `docs/architecture/overview.md` describen auth/RBAC como futuro, aunque ya existen controladores, sesiones y rutas protegidas.
- `docs/incidencias.md` dice que no había `.git`, aunque ahora hay repositorio raíz y `.git` anidado en backend; además presenta resultados de pruebas como históricos.
- `docs/api/README.md` no enumera rutas de auth/users ni el estado degradado de MongoDB.
- `docs/auth/README.md` presenta el módulo como completo, pero frontend no integra refresh/logout/perfil y permissions no participan en autorización.
- Duplicación de URL base y de responsabilidad de conexión DB; helper `connectDB` desconectado.
- `package-lock.json` raíz vacío y sin manifiesto raíz; mantener únicamente si existe un propósito definido.
- El logo del usuario no aparece en assets; la marca actual es wordmark de texto provisional.

## 12. Prioridades recomendadas y plan adaptado

1. **Fase 0 — Auditoría:** este documento. Pausar aquí para revisión del usuario.
2. **Fase 1 — Estabilización:** sustituir placeholder Atlas por conexión válida fuera del código; verificar ejemplos/env ignore e índices Git; fail-fast de `JWT_SECRET` en producción; fijar allowlist CORS de producción; proteger/eliminar seed público; establecer health/readiness, formato de errores, startup/shutdown y comandos reproducibles; ejecutar API/auth/build desde checkout limpio.
3. **Fase 2 — Auth/RBAC:** bloquear rol y tenant desde registro público; acordar roles definitivos; aplicar permisos backend; conectar perfil, refresh rotativo y logout frontend con estrategia de almacenamiento de token; probar 401/403/rotación/reuso.
4. **Fase 3 — Empresa/tenancy:** decidir Company vs Tenant (hoy coexisten ambos conceptos en User), diseñar migración no destructiva e imponer scoping server-side antes de CRUD multiempresa.
5. **Fase 4 — UI base:** conservar identidad actual, agregar navegación basada en capacidades reales y componentes de formularios/estados; incorporar logo cuando se proporcione.
6. **Fase 5 — Dashboard:** conectar solo métricas respaldadas por endpoints reales; mantener placeholders etiquetados hasta entonces.
7. **Fases 6–11 — Dominios ERP:** inventario → ventas integradas con movimientos de stock → clientes/CRM → compras/proveedores → finanzas según requisitos → reportes con scopes y permisos. Cada dominio requiere modelo, validación, endpoint, UI y pruebas; no existe base actual para presentarlos como funcionales.
8. **Fase 12 — Seguridad/auditoría:** resolver hallazgos críticos primero; después AuditLog y revisión de secretos/dependencias.
9. **Fase 13 — Calidad:** suite estable, integración con Mongo temporal, tests de permisos/tenancy y build de producción.
10. **Fases 14–17 — Despliegue:** resolver estrategia Git raíz/anidado; documentar variables no secretas; preparar Render y Pages, incluyendo fallback SPA, CORS y URL API de producción.
11. **Fase 18 — Verificación desplegada:** checklist de Cloudflare → Render → Atlas y evidencias de login, sesión, permisos, datos y móvil.

**Siguiente paso:** revisión y aprobación de esta auditoría. No se inicia Fase 1 ni se aplican cambios adicionales hasta esa revisión.
