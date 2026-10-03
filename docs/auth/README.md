# Módulo de autenticación

## Objetivo
Gestionar registro, login, refresh, logout y protección de rutas con JWT, almacenamiento persistente de sesiones y control por roles.

## Auditoria Paso 2: estado inicial

Esta seccion documenta el comportamiento encontrado antes de los cambios del Paso 2.

### Roles y permisos actuales

- `User.role` acepta `ADMIN`, `GERENTE`, `VENTAS`, `COMPRAS`, `ALMACEN`, `FINANZAS`, `RRHH` y `EMPLEADO`; su valor predeterminado en el modelo es `EMPLEADO`.
- El seed de roles crea esos mismos ocho nombres. `roleId` es opcional y referencia `Role`.
- `Permission` y su seed contienen `users.read`, `users.write`, `users.delete`, `auth.login` y `dashboard.read`, pero ninguna ruta consulta esos permisos. La autorizacion existente compara `req.user.role` con una lista de roles permitidos.
- Los nombres objetivo `ADMINISTRADOR`, `SUPERVISOR` y `USUARIO` no existen en el enum actual. No se deben escribir en usuarios sin una migracion deliberada.

### Rutas y controles actuales

| Ruta | Control encontrado antes de los cambios |
| --- | --- |
| `GET /api/health`, `GET /api/ping` | Publicas |
| `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh` | Publicas; requieren MongoDB disponible |
| `GET /api/auth/profile`, `POST /api/auth/logout`, `POST /api/auth/logout/all` | JWT y usuario activo; no requieren rol |
| Rutas definidas en `modules/users/user.routes.js` | No estaban montadas en el router principal; el modulo declara `ADMIN`/`GERENTE` para listar/leer/crear/editar y solo `ADMIN` para desactivar |

Las rutas operativas del frontend (`dashboard`, inventario, ventas y otras) son placeholders protegidos visualmente, sin endpoints de dominio conectados. No hay rutas de roles, permisos ni configuracion administrativa implementadas.

### Flujo de autenticacion actual

- Registro y login crean un access JWT y un refresh JWT; el refresh se guarda en `Session` como hash SHA-256 y se rota al refrescar.
- El access token contiene `sub`, `email`, `role`, `tenantId` y `type: access`; no contiene la contrasena. El refresh token lleva `type: refresh` y no contiene la contrasena.
- El middleware verifica firma y expiracion, consulta el usuario en MongoDB y rechaza usuarios inexistentes o inactivos. Antes de los cambios aceptaba tokens firmados sin claim `type`.
- `password` es `select: false` y el hook `pre('save')` la hashea con bcryptjs (coste 10). Auth serializa un objeto publico; el CRUD de usuarios excluye `password` de las respuestas.
- El registro publico aceptaba `role` y `tenantId` del request y usaba `ADMIN` como rol predeterminado. Esto permitia solicitar privilegios elevados y no coincidía con el rol básico del modelo.
- El frontend persiste usuario y access token en `localStorage`; el guard solo comprueba que haya usuario almacenado. No consulta `/profile`, no integra la rotacion del refresh ni revoca la sesion backend al cerrar sesion. No hay autorizacion por rol en la navegacion.

## Matriz RBAC propuesta para las rutas existentes

La equivalencia es solo de autorizacion; conserva los valores almacenados y no migra usuarios. Las capacidades se limitan a autenticacion y al CRUD de usuarios ya implementado. No se asignan permisos ficticios a los placeholders del ERP.

| Rol objetivo | Rol legacy asociado | Capacidades propuestas en rutas existentes |
| --- | --- | --- |
| ADMINISTRADOR | `ADMIN` | Perfil y sesiones propias; listar, consultar, crear, editar y desactivar usuarios; asignar roles existentes. No hay endpoints implementados para roles, permisos o configuracion general. |
| SUPERVISOR | `GERENTE` | Perfil y sesiones propias; listar/consultar usuarios; crear usuarios solo con rol base `EMPLEADO`; editar solo nombre y correo. Sin desactivar ni asignar/promover roles. |
| USUARIO | `EMPLEADO` | Perfil y sesiones propias; sin acceso a gestion de usuarios. No hay endpoints operativos de dominio conectados. |

`VENTAS`, `COMPRAS`, `ALMACEN`, `FINANZAS` y `RRHH` se conservan como roles legacy, pero quedan fuera de esta matriz hasta que existan rutas de modulo que definan y prueben su alcance. `GERENTE` accede a datos de usuarios globales porque el modelo de tenancy no tiene alcance implementado; ese riesgo queda pendiente y no se resuelve en el Paso 2.

## Paso 2: implementacion y verificacion

- El registro publico asigna siempre `EMPLEADO`; ignora `role` y `tenantId` recibidos. No modifica ni migra usuarios existentes.
- El access JWT contiene solo `sub`, `type` y expiracion; el middleware requiere `type: access`, `sub`, firma HS256 valida y expiracion valida. La autorizacion lee el rol y estado actuales del usuario desde MongoDB; los claims `role` enviados dentro del token no conceden privilegios.
- El backend requiere `JWT_SECRET` exclusivamente desde el entorno en todos los ambientes y falla al cargar la configuracion si falta. En produccion tambien exige una longitud minima de 32 bytes. No existe fallback codificado.
- El router principal monta ahora `/api/users`. Lectura requiere `ADMIN` o `GERENTE`; `ADMIN` puede asignar roles en altas/ediciones; `GERENTE` solo puede crear `EMPLEADO`, editar nombre/correo y no puede asignar ambito organizacional ni desactivar usuarios. `PATCH /api/users/:id/deactivate` requiere `ADMIN`.
- Los datos de usuario siguen serializandose sin contraseña. La prueba verifica almacenamiento bcrypt y que las respuestas de registro/login y listado no exponen el hash.
- El frontend persiste access y refresh tokens en `localStorage`, revalida el access token con `/api/auth/profile` al restaurar sesion y usa `/api/auth/refresh` si el access token ya no es valido. Si la restauracion falla, limpia la sesion local. Al cerrar sesion envia el refresh token a `/api/auth/logout` y elimina las credenciales locales incluso si falla la solicitud.
- Las pantallas de usuarios se muestran a `ADMIN`/`GERENTE`; auditoria y configuracion solo a `ADMIN`. Son placeholders, no CRUD/interfaz de auditoria/configuracion. Estos guards son de UX; el backend sigue siendo la barrera de seguridad.
- Validacion automatizada: `npm test` en backend, 2 suites y 24 pruebas aprobadas; `npm run build` en frontend, correcto.
- Verificacion navegador: `/login` renderiza. No se observaron errores JavaScript; React Router emitio avisos de compatibilidad futura.
- Verificacion runtime local: `/api/health` respondio 200 con `databaseConnected: true`. No se leyo `.env`, no se expusieron secretos ni se creo/eliminó un usuario real.

### Riesgos pendientes

- `ADMINISTRADOR`, `SUPERVISOR` y `USUARIO` siguen siendo nombres objetivo documentados, no valores del enum. La equivalencia actual es `ADMIN`, `GERENTE` y `EMPLEADO`; cualquier migracion de nombres requiere plan de compatibilidad con los datos existentes.
- El modelo/seed `Permission` no participa en autorizacion; el RBAC implementado es por rol en las rutas de usuarios.
- `GERENTE` puede consultar/listar usuarios globalmente. No hay aislamiento por empresa/tenant en las rutas y no se incorporo en este paso.
- Los access y refresh tokens se almacenan en `localStorage`, con riesgo ante XSS. Una mitigacion con cookies `HttpOnly` requiere un cambio de arquitectura y queda pendiente.
- No hay endpoints reales de roles, permisos, auditoria, configuracion o modulos operativos. Los enlaces visibles no implican que esas capacidades estén implementadas.
- La conectividad con MongoDB Atlas debe verificarse en cada entorno de despliegue; la comprobacion local no garantiza la configuracion del entorno remoto.

## Funciones
- Registro de usuarios
- Inicio de sesión con access + refresh tokens
- Rotación de refresh tokens
- Revocación de sesión y cierre de sesiones del usuario
- Perfil del usuario autenticado
- Validación de JWT
- Control por roles legacy en rutas de usuarios; el catálogo declarativo de permisos no está conectado

## Base de datos
- users
- roles
- permissions
- sessions

## Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/profile
- POST /api/auth/logout
- POST /api/auth/logout/all

## Observaciones de seguridad
- Los refresh tokens se guardan con hash SHA-256 en la colección de sesiones.
- La rotación reemplaza el refresh token activo y marca el anterior como revocado.
- Si se reutiliza un refresh token revocado, la sesión familiar queda invalidada.
- Los access tokens expiran según JWT_EXPIRES_IN y los refresh tokens según REFRESH_TOKEN_TTL.

## Permisos

Roles legacy admitidos por el modelo (no son permisos declarativos):

- ADMIN
- GERENTE
- VENTAS
- COMPRAS
- ALMACEN
- FINANZAS
- RRHH
- EMPLEADO

## Dependencias
- Express
- JWT
- bcryptjs
- Mongoose

## Pruebas
- Registro válido
- Login válido
- Login inválido
- Refresh con rotación
- Reutilización de refresh revocado
- Token inválido
