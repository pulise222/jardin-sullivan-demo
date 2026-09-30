// src/components/container/Menu/MenuAdmin/MenuAdmin.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../../../features/user/userSlice';
import Logo from '../../../common/Logo';
// Los estilos (clases "pn-…") viven en src/styles/panel.css y se comparten con los otros paneles.

/*
  Las secciones del panel. Tener una lista en vez de repetir cinco <li> iguales
  hace que agregar una sección nueva sea cuestión de una línea.
  `icon` es una clase de Font Awesome.
*/
const SECTIONS = [
  { id: 'estudiantes', label: 'Estudiantes', icon: 'fa-children' },
  { id: 'personas', label: 'Personas', icon: 'fa-user-group' },
  { id: 'materias', label: 'Materias', icon: 'fa-book-open' },
  { id: 'asignaciones', label: 'Asignaciones', icon: 'fa-diagram-project' },
  { id: 'eventos', label: 'Eventos', icon: 'fa-calendar-days' },
];

/*
  Props:
    setView      → cambia la sección que se muestra
    currentView  → sección activa (para resaltarla)
    onNavigate   → se llama al elegir una sección (en celular sirve para cerrar el menú)
*/
const MenuAdmin = ({ setView, currentView, onNavigate }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user) || {};
  const persona = useSelector((state) => state.user.persona) || {};

  // Nombre a mostrar: el de la persona si existe; si no, el usuario; si no, un texto genérico
  const displayName = persona.nombre || user.username || 'Administrador';

  const logout = () => {
    // Limpiar las credenciales
    dispatch(logoutUser());
    // Redirigir al login
    navigate('/login', { replace: true });
  };

  const choose = (id) => {
    setView(id);
    onNavigate?.(); // "?." = solo llama a la función si existe
  };

  return (
    <aside className="pn-sidebar" aria-label="Menú del panel de administración">
      <div>
        <span className="pn-brand">
          <Logo tone="light" />
        </span>
      </div>

      <div>
        <p className="pn-nav-label">Gestión</p>
        <ul className="pn-nav">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                className={currentView === section.id ? 'is-active' : ''}
                aria-current={currentView === section.id ? 'page' : undefined}
                onClick={() => choose(section.id)}
              >
                <span className="pn-nav-ico" aria-hidden="true"><i className={`fas ${section.icon}`}></i></span>
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Pie del menú: quién eres y el botón de cerrar sesión */}
      <div className="pn-sidebar-foot">
        <div className="pn-user">
          <span className="pn-avatar" aria-hidden="true">{displayName.charAt(0)}</span>
          <div className="pn-user-info">
            <span className="pn-user-name">{displayName}</span>
            <span className="pn-user-role">Administrador</span>
          </div>
          <button
            type="button"
            className="pn-icon-btn"
            onClick={logout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <i className="fas fa-right-from-bracket" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default MenuAdmin;
