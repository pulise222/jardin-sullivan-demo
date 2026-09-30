import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { filterByNameStudents } from '../../../features/students/studentSlice';
import { filterByNamePerson } from '../../../features/people/personSlice';
// Los estilos (pn-toolbar, pn-search, pn-btn) viven en src/styles/panel.css

/*
  Barra de herramientas de las tablas: buscador a la izquierda y botón de agregar a la derecha.
  Las dos versiones (personas y estudiantes) eran casi idénticas, así que comparten
  un mismo componente base y solo cambian el texto y la acción de filtrar.
*/
const ToolBar = ({ placeholder, addLabel, onSearch, onAddClick, extra }) => (
  <div className="pn-toolbar">
    {/* <label> envuelve el ícono y el campo: hacer clic en el ícono enfoca el buscador */}
    <label className="pn-search">
      <i className="fas fa-search" aria-hidden="true"></i>
      <input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={onSearch}
      />
    </label>
    <div className="pn-toolbar-actions">
      {extra}
      <button type="button" className="pn-btn" onClick={onAddClick}>
        <i className="fas fa-plus" aria-hidden="true"></i> {addLabel}
      </button>
    </div>
  </div>
);

const PersonToolBar = ({ onAddClick }) => {
  const dispatch = useDispatch();
  return (
    <ToolBar
      placeholder="Buscar persona..."
      addLabel="Agregar persona"
      onSearch={(e) => dispatch(filterByNamePerson(e.target.value))}
      onAddClick={onAddClick}
    />
  );
};

const StudentToolbar = ({ onAddClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <ToolBar
      extra={
        // Lleva a la pantalla de importación masiva desde Excel/CSV
        <button type="button" className="pn-btn-ghost" onClick={() => navigate('/admin/importar-estudiantes')}>
          <i className="fas fa-file-import" aria-hidden="true"></i> Importar
        </button>
      }
      placeholder="Buscar estudiante..."
      addLabel="Agregar estudiante"
      onSearch={(e) => dispatch(filterByNameStudents(e.target.value))}
      onAddClick={onAddClick}
    />
  );
};

export { StudentToolbar, PersonToolBar };
