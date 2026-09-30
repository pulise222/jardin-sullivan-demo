// src/components/views/Acudiente/Acudiente.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { logoutUser } from '../../../features/user/userSlice'
import Logo from '../../common/Logo';

// Armazón compartido de los paneles: menú lateral de vidrio que en celular se abre con un botón
import '../../../styles/panel.css';
import './css/Acudiente.css';
import InfoEstudiante from './InfoEstudiante';
import EventosAcudiente from './EventosAcudiente';
import PerfilAcudiente from './PerfilAcudiente';

// Secciones del panel (ícono = clase de Font Awesome)
const SECTIONS = [
  { id: 'info', label: 'Mis hijos', icon: 'fa-children', title: 'Información del estudiante', subtitle: 'Datos, notas y actividades de tus hijos.' },
  { id: 'eventos', label: 'Eventos', icon: 'fa-calendar-days', title: 'Eventos', subtitle: 'Lo que viene en el jardín.' },
  { id: 'perfil', label: 'Mi perfil', icon: 'fa-user', title: 'Mi perfil', subtitle: 'Tus datos personales y de acceso.' },
];

const Acudiente = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Persona logueada (acudiente)
  const persona = useSelector((s) => s.user.persona) || {};
  const nombre = persona.nombre || 'Acudiente';

  // Sección activa y estado del menú en celular
  const [view, setView] = useState('info');
  const [menuOpen, setMenuOpen] = useState(false);

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
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const choose = (id) => {
    setView(id);
    setMenuOpen(false);
  };

  const info = SECTIONS.find((s) => s.id === view);

  return (
    <div className={`pn-layout ${menuOpen ? 'is-menu-open' : ''}`} data-role="acudiente">
      <aside className="pn-sidebar" aria-label="Menú del panel de familias">
        <div>
          <span className="pn-brand"><Logo tone="light" /></span>
        </div>

        <div>
          <p className="pn-nav-label">Mi familia</p>
          <ul className="pn-nav">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={view === s.id ? 'is-active' : ''}
                  aria-current={view === s.id ? 'page' : undefined}
                  onClick={() => choose(s.id)}
                >
                  <span className="pn-nav-ico" aria-hidden="true"><i className={`fas ${s.icon}`}></i></span>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="pn-sidebar-foot">
          <div className="pn-user">
            <span className="pn-avatar" aria-hidden="true">{nombre.charAt(0)}</span>
            <div className="pn-user-info">
              <span className="pn-user-name">{nombre}</span>
              <span className="pn-user-role">Acudiente</span>
            </div>
            <button type="button" className="pn-icon-btn" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
              <i className="fas fa-right-from-bracket" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </aside>
      <div className="pn-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />

      <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontFamily: 'inherit', fontSize: '1.4rem', fontWeight: 600, borderRadius: '1.2rem' } }} />

      <main className="pn-main">
        <header className="pn-header">
          <button type="button" className="pn-menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Abrir el menú">
            <i className="fas fa-bars" aria-hidden="true"></i>
          </button>
          <div className="pn-header-text">
            <h1>{info.title}</h1>
            <p>{info.subtitle}</p>
          </div>
        </header>

        {/* acu-panel conserva los estilos propios de las pantallas internas (tarjetas, tablas, pestañas) */}
        <div key={view} className="acu-panel pn-fade">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Acudiente;
