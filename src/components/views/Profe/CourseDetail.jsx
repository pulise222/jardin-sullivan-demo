// src/components/views/Profe/CourseDetail.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './css/Profe.css';
import Attendance from './Attendance';
import Activities from './Activities';
import Notas from './Notas';

// Las pestañas del curso: una lista evita repetir tres botones casi iguales
const TABS = [
  { id: 'asistencia', label: 'Asistencia', icon: 'fa-clipboard-user' },
  { id: 'notas', label: 'Notas', icon: 'fa-star' },
  { id: 'actividades', label: 'Actividades', icon: 'fa-list-check' },
];

const CourseDetail = ({ onBack }) => {
  // Curso/Materia seleccionados desde Redux
  const cpm = useSelector((s) => s.courses.curso_profesor_materia);
  const [tab, setTab] = useState('asistencia');

  if (!cpm) return <p className="pn-results-hint">Elige un curso para ver su detalle.</p>;

  return (
    <section className="pf-detail">
      <div className="pf-detail-head">
        <button type="button" className="pn-back" onClick={onBack}>
          <i className="fas fa-arrow-left" aria-hidden="true"></i> Mis cursos
        </button>
        <div>
          <h2>{cpm.curso?.nombre_curso}</h2>
          <span className="pn-chip is-accent">{cpm.materia?.nombre}</span>
        </div>
      </div>

      {/* role="tablist": ayuda a lectores de pantalla a entender que son pestañas */}
      <nav className="pf-tabs" role="tablist" aria-label="Secciones del curso">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'is-active' : ''}
            onClick={() => setTab(t.id)}
          >
            <i className={`fas ${t.icon}`} aria-hidden="true"></i> {t.label}
          </button>
        ))}
      </nav>

      <div key={tab} className="pn-fade">
        {tab === 'asistencia' && <Attendance />}
        {tab === 'notas' && <Notas />}
        {tab === 'actividades' && <Activities />}
      </div>
    </section>
  );
};

export default CourseDetail;
