import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Brand from '../components/Brand';
import { API_URL, readApiResponse } from '../services/api';
import { setSpanishValidityMessage } from '../utils/formValidation';

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
    if (password.length < 8 || password.length > 128) {
      setError('La contraseña debe tener entre 8 y 128 caracteres.');
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

      await readApiResponse(response, 'No se pudo actualizar la contraseña.');

      setMessage('Tu contraseña fue actualizada correctamente.');
      setPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'No se pudo conectar con el servidor. Intenta nuevamente.'
          : requestError.message || 'No se pudo actualizar la contraseña.'
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
            onInvalid={(event) => setSpanishValidityMessage(event, 'La contraseña')}
            minLength={8}
            maxLength={128}
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
            onInvalid={(event) => setSpanishValidityMessage(event, 'La confirmación de contraseña')}
            minLength={8}
            maxLength={128}
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