import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import LandingPage from './screens/LandingPage';

const navigationGroups = [
  {
    label: 'GENERAL',
    items: [{ to: '/dashboard', label: 'Dashboard', end: true }],
  },
  {
    label: 'OPERACIÓN',
    items: [
      { to: '/inventario', label: 'Inventario' },
      { to: '/ventas', label: 'Ventas' },
      { to: '/clientes', label: 'Clientes' },
      { to: '/compras', label: 'Compras' },
      { to: '/proveedores', label: 'Proveedores' },
    ],
  },
  {
    label: 'GESTIÓN',
    items: [
      { to: '/finanzas', label: 'Finanzas' },
      { to: '/reportes', label: 'Reportes' },
      { to: '/usuarios', label: 'Usuarios', roles: ['ADMIN', 'GERENTE'] },
      { to: '/auditoria', label: 'Auditoría', roles: ['ADMIN'] },
      { to: '/configuracion', label: 'Configuración', roles: ['ADMIN'] },
    ],
  },
];

const moduleRoutes = navigationGroups.flatMap(({ items }) => items)
  .filter(({ to }) => to !== '/dashboard')
  .map(({ to, label, roles }) => ({ path: to.slice(1), label, roles }));

const metrics = [
  { label: 'Ventas del periodo', detail: 'Sin datos conectados' },
  { label: 'Compras', detail: 'Sin datos conectados' },
  { label: 'Clientes', detail: 'Sin datos conectados' },
  { label: 'Stock bajo', detail: 'Sin datos conectados' },
];

function Dashboard() {
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESUMEN OPERATIVO</p>
          <h1>Dashboard</h1>
          <p className="page-description">Vista general de la operación de Apta Digital.</p>
        </div>
      </div>

      <section className="metric-grid" aria-label="Indicadores principales">
        {metrics.map((metric) => (
          <article className="metric-panel" key={metric.label}>
            <p className="metric-label">{metric.label}</p>
            <p className="metric-value" aria-label="Sin datos">—</p>
            <p className="metric-detail">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="content-panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Actividad reciente</h2>
              <p>Movimientos registrados en el sistema</p>
            </div>
          </div>
          <div className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">—</span>
            <h3>Sin actividad disponible</h3>
            <p>La actividad aparecerá aquí cuando los módulos estén conectados.</p>
          </div>
        </article>

        <article className="content-panel setup-panel">
          <p className="eyebrow">ESTADO DEL ERP</p>
          <h2>Información del sistema</h2>
          <p>Los indicadores se mostrarán cuando sus módulos y datos estén disponibles.</p>
          <NavLink className="text-link" to="/health">Ver estado de la API</NavLink>
        </article>
      </section>
    </div>
  );
}

function ModulePlaceholder({ title }) {
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MÓDULO</p>
          <h1>{title}</h1>
        </div>
      </div>
      <section className="content-panel module-placeholder">
        <span className="placeholder-mark" aria-hidden="true">{title.slice(0, 1)}</span>
        <h2>{title}</h2>
        <p>Este módulo se encuentra en configuración.</p>
      </section>
    </div>
  );
}

function Health() {
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SISTEMA</p>
          <h1>Estado de la API</h1>
        </div>
      </div>
      <section className="content-panel health-panel">
        <span className="status-indicator" aria-hidden="true" />
        <div>
          <h2>API disponible</h2>
          <p>El servicio responde. El estado de la base de datos se consulta en el backend.</p>
        </div>
      </section>
    </div>
  );
}

function WorkspaceLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = navigationGroups.flatMap(({ items }) => items)
    .find(({ to }) => to === location.pathname)?.label || 'Estado de la API';
  const displayName = user?.name || user?.email || 'Usuario';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand-lockup sidebar-brand" to="/dashboard" aria-label="Apta Digital, Dashboard">
          <span className="brand-mark" aria-hidden="true">AD</span>
          <span className="brand-name">Apta <strong>Digital</strong></span>
        </NavLink>

        <nav className="primary-navigation" aria-label="Navegación principal">
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.roles || item.roles.includes(user?.role)
            );
            if (visibleItems.length === 0) return null;

            return (
            <div className="navigation-group" key={group.label}>
              <p className="navigation-label">{group.label}</p>
              {visibleItems.map((item) => (
                <NavLink
                  className={({ isActive }) => `navigation-link${isActive ? ' is-active' : ''}`}
                  end={item.end}
                  key={item.to}
                  to={item.to}
                >
                  <span className="navigation-indicator" aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </div>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <NavLink className="navigation-link" to="/health">
            <span className="navigation-indicator" aria-hidden="true" />
            Estado de la API
          </NavLink>
          <span className="sidebar-version">APTA DIGITAL · LOCAL</span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Espacio de trabajo</span>
            <span className="breadcrumb-divider" aria-hidden="true">/</span>
            <strong>{currentPage}</strong>
          </div>
          <details className="account-menu">
            <summary>
              <span className="account-avatar">{initials}</span>
              <span className="account-copy">
                <strong>{displayName}</strong>
                <small>{user?.role || 'Sesión activa'}</small>
              </span>
              <span className="account-chevron" aria-hidden="true">⌄</span>
            </summary>
            <div className="account-dropdown">
              <p>Sesión iniciada como</p>
              <strong>{displayName}</strong>
              <button type="button" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </details>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, token, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user && token ? <Navigate replace to="/dashboard" /> : <Navigate replace to="/login" />
        }
      />
      <Route path="/inicio" element={<LandingPage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route element={<ProtectedRoute><WorkspaceLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="health" element={<Health />} />
        {moduleRoutes.map((module) => (
          <Route
            element={(
              <ProtectedRoute allowedRoles={module.roles}>
                <ModulePlaceholder title={module.label} />
              </ProtectedRoute>
            )}
            key={module.path}
            path={module.path}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
