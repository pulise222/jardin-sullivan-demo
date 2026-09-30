// src/components/views/Profe/CoursesList.jsx
import React from 'react';
import './css/Profe.css';

/*
  Tarjetas de los cursos del profesor. Cada elemento es un "curso-profesor-materia":
  el mismo curso puede salir varias veces si el profe dicta varias materias en él.
*/
const CoursesList = ({ courses = [], onSelect }) => {
  if (!courses.length) {
    return (
      <div className="pn-card pn-panel">
        <p className="pn-results-hint">No tienes cursos asignados todavía. Pídele al administrador que te asigne uno.</p>
      </div>
    );
  }

  return (
    <ul className="pn-cards">
      {courses.map((course, i) => (
        <li key={course.id} className="pf-course">
          {/* t0..t3 rotan los colores de apoyo para que las tarjetas no se vean todas iguales */}
          <span className={`pf-course-ico t${i % 4}`} aria-hidden="true"><i className="fas fa-chalkboard"></i></span>
          <h3>{course.curso?.nombre_curso}</h3>
          <span className="pn-chip is-accent">{course.materia?.nombre}</span>
          {course.curso?.descripcion && <p>{course.curso.descripcion}</p>}
          <button type="button" className="pn-btn" onClick={() => onSelect(course)}>
            Abrir curso <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default CoursesList;
