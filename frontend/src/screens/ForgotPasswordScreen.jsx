import { useState } from 'react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || 'No se pudo solicitar la recuperación.'
        );
      }

      setMessage(
        'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.'
      );
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
          <h1>Recuperar contraseña</h1>
          <p>
            Ingresa el correo de tu cuenta y te enviaremos las instrucciones
            para crear una nueva contraseña.
          </p>
        </div>

        <div className="field-group">
          <label htmlFor="forgot-email">Correo electrónico</label>

          <input
            className="form-input"
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="nombre@empresa.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          {loading ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              Enviando...
            </>
          ) : (
            'Enviar instrucciones'
          )}
        </button>

        <p className="auth-link">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
}