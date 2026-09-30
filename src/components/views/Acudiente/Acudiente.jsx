// src/components/views/Acudiente/Acudiente.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../../features/user/userSlice'

import './css/Acudiente.css';
import InfoEstudiante from './InfoEstudiante';
import EventosAcudiente from './EventosAcudiente';
import PerfilAcudiente from './PerfilAcudiente';

const Acudiente = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
  // Persona logueada (acudiente)
  const persona = useSelector((s) => s.user.persona) || {};
  const nombreAcudiente = `${persona?.nombre ?? ''} ${persona?.apellido ?? ''}`.trim();

  // Menú lateral
  const [view, setView] = useState('info');

  // Render segun opción
  const renderContent = () => {
    switch (view) {
      case 'info':
        return <InfoEstudiante />;
      case 'eventos':
        return <EventosAcudiente />;
      case 'perfil':
        return <PerfilAcudiente />;
      default:
        return null;
    }
  };


    const logout = () => {
      // Limpiar las credenciales
      dispatch(logoutUser());
  
      // Redirigir al login
      navigate('/login', { replace: true });
    };
  

  return (
    <div className="acu-layout">
      {/* Sidebar */}
      <aside className="acu-sidebar">
        <div className="acu-user">
          <div className="acu-avatar">
            {/* Si más adelante guardas foto en persona, usa persona.foto_url */}
            <img src={persona.foto_url} alt="Acudiente" />
          </div>
          <div className="acu-username">Acudiente: {nombreAcudiente || '—'}</div>
        </div>

        <nav className="acu-menu">
          <button
            type="button"
            className={`acu-item ${view === 'info' ? 'active' : ''}`}
            onClick={() => setView('info')}
          >
            <span className="acu-dot" /> Info estudiante
          </button>
          <button
            type="button"
            className={`acu-item ${view === 'eventos' ? 'active' : ''}`}
            onClick={() => setView('eventos')}
          >
            <span className="acu-dot" /> Eventos
          </button>
          <button
            type="button"
            className={`acu-item ${view === 'perfil' ? 'active' : ''}`}
            onClick={() => setView('perfil')}
          >
            <span className="acu-dot" /> Perfil
          </button>
          <button className="acu-item logout" onClick={logout}>
            <span className="acu-dot" /> Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="acu-main">
        <header className="acu-breadcrumb">
          <span>Acudiente</span>
          <span className="sep">›</span>
          <span>
            {view === 'info' ? 'Información del estudiante' : view === 'eventos' ? 'Eventos' : 'Perfil'}
          </span>
        </header>

        <div className="acu-panel">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Acudiente;
