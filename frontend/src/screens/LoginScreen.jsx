import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from '../components/Brand';
import { loginRequest } from '../services/authService';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginRequest(form.email, form.password);
      setSession(
        response.data.accessToken || response.data.token,
        response.data.user,
        response.data.refreshToken
      );
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit} aria-busy={loading}>
        <Brand />
        <div className="auth-heading">
          <p className="eyebrow">FOTO MINERVA · GESTIÓN DEL ESTUDIO</p>
          <h1>Bienvenido de nuevo</h1>
          <p>Ingresa a Foto Minerva.</p>
        </div>
        <div className="field-group">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            className="form-input"
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nombre@empresa.com"
            value={form.email}
            onChange={onChange}
            required
          />
          <div className="forgot-password-row">
            <Link to="/forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="login-password">Contraseña</label>
          <div className="password-field">
            <input
              className="form-input"
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={onChange}
              required
            />
            <button
              className="visibility-toggle"
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        {error ? <p className="error-message" role="alert">{error}</p> : null}

        <button className="button button-primary auth-submit" type="submit" disabled={loading}>
          {loading ? <><span className="button-spinner" aria-hidden="true" />Ingresando...</> : 'Iniciar sesión'}
        </button>

        <p className="auth-link">
          ¿No tienes una cuenta? <Link to="/register">Crear una cuenta</Link>
        </p>
      </form>
    </div>
  );
}
