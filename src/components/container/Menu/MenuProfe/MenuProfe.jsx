// src/components/container/Menu/MenuProfe/MenuProfe.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../../../features/user/userSlice';
import Logo from '../../../common/Logo';
// Los estilos (clases "pn-…") viven en src/styles/panel.css y son los mismos del panel de administración.

/* Secciones del panel del profesor. `icon` es una clase de Font Awesome. */
const SECTIONS = [
  { id: 'inicio', label: 'Inicio', icon: 'fa-house' },
  { id: 'cursos', label: 'Mis cursos', icon: 'fa-chalkboard-user' },
  { id: 'eventos', label: 'Eventos', icon: 'fa-calendar-days' },
  { id: 'perfil', label: 'Mi perfil', icon: 'fa-user' },
];

/*
  Props:
    setView      → cambia la sección que se muestra
    currentView  → sección activa (para resaltarla)
    onNavigate   → se llama al elegir una sección (en celular cierra el menú)
*/
const MenuProfe = ({ setView, currentView, onNavigate }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.user.user) || {};
  const persona = useSelector((s) => s.user.persona) || {};
  const displayName = persona.nombre || user.username || 'Profesor';

  // Mientras se mira un curso, "Mis cursos" sigue resaltado (el detalle cuelga de esa sección)
  const activeId = currentView === 'curso-seleccionado' ? 'cursos' : currentView;

  const logout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const choose = (id) => {
    setView(id);
    onNavigate?.();
  };

  return (
    <aside className="pn-sidebar" aria-label="Menú del panel del profesor">
      <div>
        <span className="pn-brand">
          <Logo tone="light" />
        </span>
      </div>

      <div>
        <p className="pn-nav-label">Mi aula</p>
        <ul className="pn-nav">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                className={activeId === section.id ? 'is-active' : ''}
                aria-current={activeId === section.id ? 'page' : undefined}
                onClick={() => choose(section.id)}
              >
                <span className="pn-nav-ico" aria-hidden="true"><i className={`fas ${section.icon}`}></i></span>
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="pn-sidebar-foot">
        <div className="pn-user">
          <span className="pn-avatar" aria-hidden="true">{displayName.charAt(0)}</span>
          <div className="pn-user-info">
            <span className="pn-user-name">{displayName}</span>
            <span className="pn-user-role">Profesor</span>
          </div>
          <button type="button" className="pn-icon-btn" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
            <i className="fas fa-right-from-bracket" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default MenuProfe;
