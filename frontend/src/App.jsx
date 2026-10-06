import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Images, LayoutDashboard, Menu, Package, Users, UserCheck, X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import LandingPage from './screens/LandingPage';
import Brand from './components/Brand';
import { StudioDashboard, StudioModule } from './screens/StudioWorkspace';

const navigationItems = [
  { to: '/dashboard', label: 'Panel general', icon: LayoutDashboard, end: true },
  { to: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/sesiones', label: 'Sesiones', icon: CalendarDays },
  { to: '/impresiones', label: 'Impresiones', icon: Images },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/asistencia', label: 'Asistencia', icon: UserCheck },
];

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
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('foto-minerva-sidebar-collapsed') === 'true');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentPage = navigationItems.find(({ to }) => to === location.pathname)?.label || 'Estado de la API';
  const displayName = user?.name || user?.email || 'Usuario';
  const initials = displayName.slice(0, 2).toUpperCase();

  const toggleSidebar = () => {
    setCollapsed((value) => {
      localStorage.setItem('foto-minerva-sidebar-collapsed', String(!value));
      return !value;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className={`app-shell${collapsed ? ' sidebar-collapsed' : ''}${mobileMenuOpen ? ' mobile-nav-open' : ''}`}>
      {mobileMenuOpen && <button aria-label="Cerrar menú" className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)} type="button" />}
      <aside className="sidebar">
        <div className="sidebar-brand-row">
          <NavLink className="sidebar-brand" onClick={() => setMobileMenuOpen(false)} to="/dashboard" aria-label="Foto Minerva, panel general">
            <Brand compact={collapsed} />
          </NavLink>
          <button className="sidebar-toggle" type="button" onClick={toggleSidebar} aria-label={collapsed ? 'Desplegar menú' : 'Contraer menú'} title={collapsed ? 'Desplegar menú' : 'Contraer menú'}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button className="mobile-sidebar-close" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="primary-navigation" aria-label="Navegación principal">
          {navigationItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              aria-label={collapsed ? label : undefined}
              className={({ isActive }) => `navigation-link${isActive ? ' is-active' : ''}`}
              end={end}
              key={to}
              onClick={() => setMobileMenuOpen(false)}
              title={collapsed ? label : undefined}
              to={to}
            >
              <Icon aria-hidden="true" className="navigation-icon" size={18} />
              <span className="navigation-text">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink className="navigation-link" onClick={() => setMobileMenuOpen(false)} to="/health">
            <span className="navigation-icon" aria-hidden="true">•</span>
            <span className="navigation-text">Estado de la API</span>
          </NavLink>
          <span className="sidebar-version">FOTO MINERVA · LOCAL</span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-brand">
            <button
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen((open) => !open)}
              type="button"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Brand compact />
            <div className="breadcrumb">
              <span>Estudio</span>
              <span className="breadcrumb-divider" aria-hidden="true">/</span>
              <strong>{currentPage}</strong>
            </div>
          </div>
          <details className="account-menu" id="account-menu">
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
  const { status, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    let listener;
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const path = location.pathname;
      const isAuthenticatedRoot = isAuthenticated && path === '/dashboard';
      const isPublicRoot = path === '/' || path === '/inicio' || path === '/login' || path === '/register';

      if (isAuthenticatedRoot) {
        CapacitorApp.exitApp();
        return;
      }

      if (canGoBack || (!isPublicRoot && window.history.length > 1)) {
        navigate(-1);
      } else if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        CapacitorApp.exitApp();
      }
    }).then((l) => {
      listener = l;
    });

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [isAuthenticated, location, navigate]);

  if (status === 'loading') {
    return <div className="session-loading" role="status">Validando sesión...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate replace to="/dashboard" /> : <LandingPage />}
      />
      <Route
        path="/inicio"
        element={isAuthenticated ? <Navigate replace to="/dashboard" /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate replace to="/dashboard" /> : <LoginScreen />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate replace to="/dashboard" /> : <ForgotPasswordScreen />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordScreen />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate replace to="/dashboard" /> : <RegisterScreen />}
      />
      <Route element={<ProtectedRoute><WorkspaceLayout key={user?.id || user?._id} /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudioDashboard />} />
        <Route path="pedidos" element={<StudioModule module="orders" />} />
        <Route path="productos" element={<StudioModule module="products" />} />
        <Route path="sesiones" element={<StudioModule module="sessions" />} />
        <Route path="impresiones" element={<StudioModule module="prints" />} />
        <Route path="clientes" element={<StudioModule module="customers" />} />
        <Route path="asistencia" element={<StudioModule module="attendance" />} />
        <Route path="health" element={<Health />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
