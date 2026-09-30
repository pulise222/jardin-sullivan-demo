// src/components/views/Auth/ResetPasswordConfirm.jsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useConfirmPasswordResetMutation } from '../../../features/user/userApi';
import './ResetPassword.css';

const ResetPasswordConfirm = () => {
  const { uid, token } = useParams();
  const nav = useNavigate();
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [confirm, { isLoading, isError }] = useConfirmPasswordResetMutation();
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pass1 !== pass2) return alert('Las contraseñas no coinciden');
    try {
      await confirm({ uid, token, new_password: pass1 }).unwrap();
      setOk(true);
      setTimeout(() => nav('/login'), 1600);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rpw-wrapper">
      <div className="rpw-card">
        <h1 className="rpw-title">Crear nueva contraseña</h1>
        {!ok ? (
          <form onSubmit={submit} className="rpw-form">
            <input className="rpw-input" type="password" placeholder="Nueva contraseña" value={pass1} onChange={(e)=>setPass1(e.target.value)} />
            <input className="rpw-input" type="password" placeholder="Confirmar contraseña" value={pass2} onChange={(e)=>setPass2(e.target.value)} />
            <button className="rpw-btn" type="submit" disabled={isLoading || !pass1 || !pass2}>
              {isLoading ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
            {isError && <div className="rpw-error">Enlace inválido o expirado.</div>}
          </form>
        ) : (
          <div className="rpw-success">¡Contraseña actualizada! Te redirigimos al login…</div>
        )}
        <div className="rpw-footer"><Link to="/login">Volver al inicio de sesión</Link></div>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
