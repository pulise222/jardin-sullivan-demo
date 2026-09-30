// src/components/views/Profe/DashboardProfesor.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { useGetEventosProximosQuery } from '../../../features/eventos/eventosApi';
import './css/Profe.css';

/*
  Inicio del profesor. Antes eran números inventados; ahora todo sale de datos reales:
    - el nombre, de la persona logueada (Redux)
    - los cursos y materias, de la consulta que hace Profe.jsx (llegan por props)
    - los próximos eventos, de la API de eventos
*/
// Fecha ISO -> "17 nov 2026" (si no se puede leer, se deja tal cual)
const fmt = (f) => { const d = new Date(f); return Number.isNaN(d) ? f : d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }); };

const DashboardProfesor = ({ cursos = [], onOpenCourse, onGoTo }) => {
  const persona = useSelector((s) => s.user.persona) || {};
  const { data: eventos = [] } = useGetEventosProximosQuery({ limit: 3 });

  // Un profesor puede dictar varias materias en el mismo curso: contamos cursos distintos con Set
  const totalCursos = new Set(cursos.map((c) => c.curso?.id)).size;
  const totalMaterias = new Set(cursos.map((c) => c.materia?.id)).size;

  // Saludo según la hora del día
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <>
      <section className="pf-hero">
        <div>
          <p className="pf-hero-kicker">{saludo}</p>
          <h2>{persona.nombre ? `Profe ${persona.nombre}` : 'Profe'} 👋</h2>
          <p>Aquí tienes tus cursos y lo que viene en el jardín.</p>
        </div>
        <button type="button" className="pn-btn" onClick={() => onGoTo('cursos')}>
          <i className="fas fa-chalkboard-user" aria-hidden="true"></i> Ir a mis cursos
        </button>
      </section>

      <section className="pn-kpis" aria-label="Resumen">
        <div className="pn-kpi">
          <span className="pn-kpi-ico" aria-hidden="true"><i className="fas fa-school"></i></span>
          <div><strong>{totalCursos}</strong><span>Cursos a cargo</span></div>
        </div>
        <div className="pn-kpi">
          <span className="pn-kpi-ico" aria-hidden="true"><i className="fas fa-book-open"></i></span>
          <div><strong>{totalMaterias}</strong><span>Materias que dictas</span></div>
        </div>
        <div className="pn-kpi">
          <span className="pn-kpi-ico" aria-hidden="true"><i className="fas fa-calendar-days"></i></span>
          <div><strong>{eventos.length}</strong><span>Próximos eventos</span></div>
        </div>
      </section>

      <div className="pn-split">
        <section className="pn-card pn-panel">
          <div className="pn-panel-head"><h2>Mis cursos</h2></div>
          {cursos.length === 0 ? (
            <p className="pn-results-hint">Todavía no tienes cursos asignados.</p>
          ) : (
            <ul className="pn-list">
              {cursos.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <div>
                    <strong>{c.curso?.nombre_curso}</strong>
                    <small className="pf-muted"> · {c.materia?.nombre}</small>
                  </div>
                  <button type="button" className="pn-btn-ghost" onClick={() => onOpenCourse(c)}>
                    Abrir <i className="fas fa-arrow-right" aria-hidden="true"></i>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pn-card pn-panel">
          <div className="pn-panel-head">
            <h2>Próximos eventos</h2>
            <button type="button" className="pn-btn-ghost" onClick={() => onGoTo('eventos')}>Ver todos</button>
          </div>
          {eventos.length === 0 ? (
            <p className="pn-results-hint">No hay eventos próximos.</p>
          ) : (
            <ul className="pn-list">
              {eventos.map((ev, i) => (
                <li key={ev.id_evento ?? ev.id ?? i}>
                  <div>
                    <strong>{ev.titulo}</strong>
                    <small className="pf-muted"> · {fmt(ev.fecha_inicio)}</small>
                  </div>
                  <span className={`pn-chip ${['is-accent', 'is-teal', 'is-amber'][i % 3]}`}>Evento</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
};

export default DashboardProfesor;
