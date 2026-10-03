import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerRequest } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Brand from '../components/Brand';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const response = await registerRequest(form);
      setSession(
        response.data.accessToken || response.data.token,
        response.data.user,
        response.data.refreshToken
      );
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.message === 'User already exists'
          ? 'Ya existe una cuenta con este correo.'
          : err.message || 'No se pudo registrar el usuario'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit} aria-busy={loading}>
        <Brand />
        <div className="auth-heading">
          <p className="eyebrow">GESTIÓN EMPRESARIAL</p>
          <h1>Crea tu cuenta</h1>
          <p>Regístrate para acceder a tu espacio de trabajo.</p>
        </div>
        <div className="field-group">
          <label htmlFor="register-name">Nombre</label>
          <input
            className="form-input"
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            className="form-input"
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nombre@empresa.com"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor="register-password">Contraseña</label>
          <div className="password-field">
            <input
              className="form-input"
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Crea una contraseña"
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

        {error ? (
          <p className="error-message" role="alert">
            {error}
            {error === 'Ya existe una cuenta con este correo.' ? (
              <> <Link to="/login">Inicia sesión</Link></>
            ) : null}
          </p>
        ) : null}

        <button className="button button-primary auth-submit" type="submit" disabled={loading}>
          {loading ? <><span className="button-spinner" aria-hidden="true" />Creando cuenta...</> : 'Crear cuenta'}
        </button>

        <p className="auth-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
