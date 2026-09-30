// src/components/views/Auth/ResetPasswordRequest.jsx
import React, { useState } from 'react';
import { useRequestPasswordResetMutation } from '../../../features/user/userApi';
import './ResetPassword.css';

const ResetPasswordRequest = () => {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);
  const [requestReset, { isLoading, isError }] = useRequestPasswordResetMutation();

  const submit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;

    try {
      await requestReset(value.trim()).unwrap();
      setSent(true);
    } catch (err) {
      // igualmente mostramos "enviado" para no filtrar usuarios
      setSent(true);
      console.error(err);
    }
  };

  return (
    <div className="rpw-wrapper">
      <div className="rpw-card">
        <h1 className="rpw-title">Restablecer contraseña</h1>
        <p className="rpw-desc">
          Introduce tu nombre de usuario o correo y te enviaremos instrucciones para restablecer tu contraseña.
        </p>

        {sent ? (
          <div className="rpw-success">
            Si la cuenta existe, te enviamos un correo con el enlace para restablecer tu contraseña.
          </div>
        ) : (
          <form onSubmit={submit} className="rpw-form">
            <input
              className="rpw-input"
              placeholder="Usuario o correo electrónico"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button className="rpw-btn" type="submit" disabled={isLoading || !value.trim()}>
              {isLoading ? 'Enviando…' : 'Enviar'}
            </button>
            {isError && <div className="rpw-error">Ocurrió un error. Intenta nuevamente.</div>}
          </form>
        )}

        <div className="rpw-footer">
          <a href="/login">Iniciar sesión</a> con tus credenciales
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordRequest;
