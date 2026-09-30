// src/components/views/Acudiente/Acudiente.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { logoutUser } from '../../../features/user/userSlice';
import { useMisEstudiantesQuery } from '../../../features/students/studentApi';
import Logo from '../../common/Logo';

// Armazón compartido de los paneles: menú lateral de vidrio que en celular se abre con un botón
import '../../../styles/panel.css';
import './css/Acudiente.css';
import MisHijos from './MisHijos';
import Boletin from './Boletin';
import EventosAcudiente from './EventosAcudiente';
import PerfilAcudiente from './PerfilAcudiente';

// Secciones del panel (icon = clase de Font Awesome)
const SECTIONS = [
  { id: 'hijos', label: 'Mis hijos', icon: 'fa-children', title: 'Mis hijos', subtitle: 'Sus datos y las actividades que hacen en el jardín.' },
  { id: 'boletin', label: 'Boletín', icon: 'fa-file-lines', title: 'Boletín', subtitle: 'Cómo le va a tu hijo en cada trimestre.' },
  { id: 'eventos', label: 'Eventos', icon: 'fa-calendar-days', title: 'Eventos', subtitle: 'Lo que viene en el jardín.' },
  { id: 'perfil', label: 'Mi perfil', icon: 'fa-user', title: 'Mi perfil', subtitle: 'Tus datos personales y de acceso.' },
];

const Acudiente = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Persona logueada (acudiente)
  const persona = useSelector((s) => s.user.persona) || {};
  const nombre = persona.nombre || 'Acudiente';

  // Los hijos se piden UNA vez aquí y se comparten con las vistas (Mis hijos y Boletín)
  const { data: hijos = [], isLoading: cargandoHijos, isError: errorHijos } = useMisEstudiantesQuery();

  // Sección activa, hijo elegido y estado del menú en celular
  const [view, setView] = useState('hijos');
  const [hijoId, setHijoId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Al llegar la lista, se elige el primer hijo (si el elegido ya no existe, también se reemplaza)
  useEffect(() => {
    if (hijos.length && !hijos.some((h) => h.id === hijoId)) setHijoId(hijos[0].id);
  }, [hijos, hijoId]);
  const hijo = hijos.find((h) => h.id === hijoId) || null;

  const logout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const choose = (id) => {
    setView(id);
    setMenuOpen(false);
  };

  // Datos que comparten las vistas que trabajan con un hijo
  const contexto = { hijos, hijo, setHijoId, cargando: cargandoHijos, error: errorHijos };

  const renderContent = () => {
    switch (view) {
      case 'hijos':
        return <MisHijos {...contexto} irABoletin={() => choose('boletin')} />;
      case 'boletin':
        return <Boletin {...contexto} />;
      case 'eventos':
        return <EventosAcudiente />;
      case 'perfil':
        return <PerfilAcudiente />;
      default:
        return null;
    }
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

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: 'inherit', fontSize: '1.4rem', fontWeight: 600, borderRadius: '1.2rem', padding: '1.2rem 1.6rem', color: '#0f2447' },
          success: { iconTheme: { primary: '#2fb5a3', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f26b4f', secondary: '#fff' } },
        }}
      />

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

        {/* key={view}: al cambiar de sección se repite la animación de entrada */}
        <div key={view} className="pn-fade">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Acudiente;
