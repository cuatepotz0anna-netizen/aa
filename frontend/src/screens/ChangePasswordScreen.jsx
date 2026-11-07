import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePasswordRequest } from '../services/authService';
import { setSpanishValidityMessage } from '../utils/formValidation';

export default function ChangePasswordScreen() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    event.currentTarget.setCustomValidity('');
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const response = await changePasswordRequest(
        token,
        form.currentPassword,
        form.newPassword
      );
      setMessage(response.message || 'La contraseña se actualizó correctamente.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (requestError) {
      setError(requestError.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="studio-page">
      <div className="studio-page-heading">
        <div>
          <p className="studio-eyebrow">CUENTA · SEGURIDAD</p>
          <h1>Cambiar contraseña</h1>
          <p className="studio-description">Confirma tu contraseña actual y elige una nueva de 8 a 128 caracteres.</p>
        </div>
      </div>
      <section className="studio-form-panel">
        <form className="studio-form" onSubmit={handleSubmit}>
          <div className="studio-form-grid">
            <label className="studio-field studio-field-wide">
              <span>Contraseña actual</span>
              <input
                autoComplete="current-password"
                name="currentPassword"
                onChange={update}
                onInvalid={(event) => setSpanishValidityMessage(event, 'La contraseña actual')}
                required
                type="password"
                value={form.currentPassword}
              />
            </label>
            <label className="studio-field">
              <span>Nueva contraseña</span>
              <input
                autoComplete="new-password"
                maxLength={128}
                minLength={8}
                name="newPassword"
                onChange={update}
                onInvalid={(event) => setSpanishValidityMessage(event, 'La nueva contraseña')}
                required
                type="password"
                value={form.newPassword}
              />
            </label>
            <label className="studio-field">
              <span>Confirmar nueva contraseña</span>
              <input
                autoComplete="new-password"
                maxLength={128}
                minLength={8}
                name="confirmPassword"
                onChange={update}
                onInvalid={(event) => setSpanishValidityMessage(event, 'La confirmación de contraseña')}
                required
                type="password"
                value={form.confirmPassword}
              />
            </label>
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
          {message && <p className="auth-link" role="status">{message}</p>}
          <div className="studio-form-actions">
            <Link className="studio-button studio-button-secondary" to="/dashboard">Volver</Link>
            <button className="studio-button studio-button-primary" disabled={loading} type="submit">
              {loading ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
