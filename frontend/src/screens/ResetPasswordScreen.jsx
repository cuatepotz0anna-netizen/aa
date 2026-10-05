import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Brand from '../components/Brand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ResetPasswordScreen() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!token || !email) {
      setError('El enlace de recuperación no es válido.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || 'No se pudo actualizar la contraseña.'
        );
      }

      setMessage('Tu contraseña fue actualizada correctamente.');
      setPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      setError(
        requestError.message ||
          'No se pudo conectar con el servidor. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <form
        className="auth-card"
        onSubmit={handleSubmit}
        aria-busy={loading}
      >
        <Brand />

        <div className="auth-heading">
          <p className="eyebrow">FOTO MINERVA · GESTIÓN DEL ESTUDIO</p>
          <h1>Crear nueva contraseña</h1>
          <p>
            Ingresa una nueva contraseña para recuperar el acceso a tu cuenta.
          </p>
        </div>

        <div className="field-group">
          <label htmlFor="reset-password">Nueva contraseña</label>
          <input
            className="form-input"
            id="reset-password"
            type="password"
            autoComplete="new-password"
            placeholder="Ingresa tu nueva contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="reset-confirm-password">
            Confirmar contraseña
          </label>
          <input
            className="form-input"
            id="reset-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Repite tu nueva contraseña"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        {message ? (
          <p className="auth-link" role="status">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : null}

        <button
          className="button button-primary auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>

        <p className="auth-link">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
}