// src/components/views/Profe/Profe.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import MenuProfe from '../../container/Menu/MenuProfe/MenuProfe';
// Sistema de diseño compartido de los paneles (el rol "profesor" aporta la paleta cielo y rosa)
import '../../../styles/panel.css';

import DashboardProfesor from './DashboardProfesor';
import CoursesList from './CoursesList';
import CourseDetail from './CourseDetail';
import Attendance from './Attendance';
import Profile from './Profile';

import {
  useGetCourseByTeacherQuery,
  useGetCourseWithStudentsQuery,
} from '../../../features/cursos/cursosApi';
import {
  coursesByTeacher,
  setSelectedCourse,
  setCursoProfesorMateria,
} from '../../../features/cursos/cursosSlice';
import EventCarousel from '../../widgets/EventCarousel';

// Título y descripción que se muestran arriba según la sección
const VIEW_INFO = {
  inicio: { title: 'Inicio', subtitle: 'Un resumen de tu día en el jardín.' },
  cursos: { title: 'Mis cursos', subtitle: 'Los cursos y materias que tienes a cargo.' },
  'curso-seleccionado': { title: 'Curso', subtitle: 'Asistencia, notas y actividades.' },
  asistencia: { title: 'Asistencia', subtitle: 'Registro de asistencia del curso.' },
  eventos: { title: 'Eventos', subtitle: 'Lo que viene en la agenda del jardín.' },
  perfil: { title: 'Mi perfil', subtitle: 'Tus datos personales y de acceso.' },
};

const Profe = () => {
  const dispatch = useDispatch();
  // Estado local para controlar la "vista" actual
  const [view, setView] = useState('inicio');
  // En celular el menú lateral se abre y se cierra
  const [menuOpen, setMenuOpen] = useState(false);

  // Curso-profesor-materia elegido en "Mis cursos"
  const [selectedCPM, setSelectedCPM] = useState(null);

  // Tomamos la persona actual (profesor) del store de Redux
  const profe = useSelector((s) => s.user.persona);
  // Cursos del profesor. `profe.id` si existe, o 2 como respaldo durante el desarrollo
  const { data: cursosData } = useGetCourseByTeacherQuery(profe ? profe.id : 2);

  // Detalle del curso (con estudiantes) cuando hay uno elegido; skip evita la llamada antes
  const { data: detalleCurso } = useGetCourseWithStudentsQuery(
    selectedCPM?.curso?.id,
    { skip: !selectedCPM?.curso?.id }
  );

  // Cada vez que llegan los cursos del profesor, los guardamos en Redux
  useEffect(() => {
    if (cursosData) dispatch(coursesByTeacher(cursosData));
  }, [dispatch, cursosData]);

  // Cuando llega el detalle de un curso lo guardamos en Redux y mostramos su vista
  useEffect(() => {
    if (detalleCurso) {
      dispatch(setSelectedCourse(detalleCurso));
      setView('curso-seleccionado');
    }
  }, [dispatch, detalleCurso]);

  // Se pasa a CoursesList: se ejecuta al pulsar "Abrir curso"
  const handleSelectCourse = (curso) => {
    setView('curso-seleccionado');
    setSelectedCPM(curso);
    dispatch(setCursoProfesorMateria(curso));
  };

  const renderContent = () => {
    switch (view) {
      case 'inicio':
        return <DashboardProfesor cursos={cursosData || []} onOpenCourse={handleSelectCourse} onGoTo={setView} />;
      case 'cursos':
        return <CoursesList courses={cursosData || []} onSelect={handleSelectCourse} />;
      case 'curso-seleccionado':
        return <CourseDetail onBack={() => setView('cursos')} />;
      case 'asistencia':
        return <Attendance />;
      case 'eventos':
        return <EventCarousel />;
      case 'perfil':
        return <Profile />;
      default:
        return null;
    }
  };

  const info = VIEW_INFO[view] || VIEW_INFO.inicio;

  return (
    // data-role="profesor" activa la paleta cielo y rosa (ver styles/panel.css)
    <div className={`pn-layout ${menuOpen ? 'is-menu-open' : ''}`} data-role="profesor">
      <MenuProfe setView={setView} currentView={view} onNavigate={() => setMenuOpen(false)} />
      {/* Fondo oscuro detrás del menú en celular: al tocarlo se cierra */}
      <div className="pn-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />

      {/* Avisos emergentes (éxito / error) de todo el panel */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: 'inherit', fontSize: '1.4rem', fontWeight: 600, borderRadius: '1.2rem', padding: '1.2rem 1.6rem', color: '#24123f' },
          success: { iconTheme: { primary: '#2fb5a8', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ffb020', secondary: '#fff' } },
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
        <div key={view} className="pn-fade">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Profe;
