// src/components/views/Acudiente/Boletin.jsx
import React, { useMemo, useState } from 'react';
import { useGetBoletinEstudianteQuery, useGetContextoAcademicoQuery } from '../../../features/academico/academicoApi';
import SelectorHijo from './SelectorHijo';
import '../Profe/css/Profe.css'; // reutiliza .pf-tabs y .pf-stats

// El año escolar tiene 4 trimestres. Si el jardín usara otra cantidad, basta con cambiar esta lista.
const TRIMESTRES = [1, 2, 3, 4];

const fechaCorta = (f) =>
  f ? new Date(`${f}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : '';

// Etiqueta de nivel con su color de semáforo; si no hay evaluación muestra «Sin evaluar» en gris
const Nivel = ({ codigo, texto }) =>
  codigo ? <span className={`pn-chip lvl-${codigo}`}>{texto}</span> : <span className="pn-chip">{texto || 'Sin evaluar'}</span>;

/*
  Boletín de la familia: resultados de cada trimestre de un hijo.
  - Un trimestre a la vez: resumen general, y una tarjeta por materia (docente, nivel, faltas, logros).
  - «Resumen del año»: tabla materia × trimestre para ver la evolución de un vistazo.
  Los datos los calcula el backend (academico/services.py); aquí solo se muestran.
  Los niveles son cualitativos: Deficiente · Aceptable · Sobresaliente.
*/
const Boletin = ({ hijos, hijo, setHijoId, cargando, error }) => {
  const { data: ctx, isLoading: cargandoCtx } = useGetContextoAcademicoQuery();
  const actual = Math.min(Math.max(ctx?.periodo_actual || 1, 1), TRIMESTRES.length);

  // 'anio' = resumen del año; si no, el número de trimestre elegido (por defecto el que está en curso)
  const [vista, setVista] = useState(null);
  const seleccion = vista ?? actual;

  const listo = !!(ctx && hijo?.curso?.id);
  const args = (periodo) => ({ cursoId: hijo?.curso?.id, periodo, estudianteId: hijo?.id, anio: ctx?.anio_actual });
  // Los trimestres que aún no empiezan no se piden (no tienen nada que mostrar)
  const opciones = (n) => ({ skip: !listo || n > actual });
  const b1 = useGetBoletinEstudianteQuery(args(1), opciones(1));
  const b2 = useGetBoletinEstudianteQuery(args(2), opciones(2));
  const b3 = useGetBoletinEstudianteQuery(args(3), opciones(3));
  const b4 = useGetBoletinEstudianteQuery(args(4), opciones(4));
  const consultas = { 1: b1, 2: b2, 3: b3, 4: b4 };

  // Nombres de materias de todos los trimestres (para la tabla del año)
  const materias = useMemo(() => {
    const set = new Set();
    Object.values(consultas).forEach((q) => q.data?.materias?.forEach((m) => set.add(m.materia_nombre)));
    return [...set];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b1.data, b2.data, b3.data, b4.data]);

  if (cargando || cargandoCtx) return <div className="pn-state"><span className="pn-spinner" /><strong>Cargando…</strong></div>;
  if (error) return <div className="pn-state"><i className="fas fa-triangle-exclamation" /><strong>No se pudo cargar el boletín</strong></div>;
  if (!hijo) {
    return <div className="pn-card pn-state"><i className="fas fa-children" /><strong>Aún no tienes hijos vinculados</strong></div>;
  }
  if (!hijo.curso?.id) {
    return <div className="pn-card pn-state"><i className="fas fa-school" /><strong>{hijo.nombre} todavía no tiene un curso asignado</strong><span>Cuando el jardín lo asigne, aquí aparecerá su boletín.</span></div>;
  }

  const q = typeof seleccion === 'number' ? consultas[seleccion] : null;
  const data = q?.data;

  return (
    <div className="ac-boletin">
      <SelectorHijo hijos={hijos} hijo={hijo} onChange={setHijoId} />

      <div className="ac-bol-top ac-noprint">
        <nav className="pf-tabs" role="tablist" aria-label="Trimestres">
          {TRIMESTRES.map((n) => (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={seleccion === n}
              className={seleccion === n ? 'is-active' : ''}
              disabled={n > actual}
              title={n > actual ? 'Este trimestre aún no empieza' : undefined}
              onClick={() => setVista(n)}
            >
              T{n}{n === actual ? ' · en curso' : ''}
            </button>
          ))}
          <button type="button" role="tab" aria-selected={seleccion === 'anio'} className={seleccion === 'anio' ? 'is-active' : ''} onClick={() => setVista('anio')}>
            <i className="fas fa-chart-line" aria-hidden="true"></i> Resumen del año
          </button>
        </nav>
        <button type="button" className="pn-btn-ghost" onClick={() => window.print()}>
          <i className="fas fa-print" aria-hidden="true"></i> Imprimir / guardar PDF
        </button>
      </div>

      {/* Encabezado que solo aparece al imprimir */}
      <div className="ac-print-head">
        <h2>Boletín de {hijo.nombre} {hijo.apellido}</h2>
        <p>Jardín Sullivan · {hijo.curso.nombre_curso} · Año {ctx.anio_actual}</p>
      </div>

      {seleccion === 'anio' ? (
        <section className="pn-card pn-panel">
          <div className="pn-panel-head"><h2>Evolución de {hijo.nombre} en el año {ctx.anio_actual}</h2></div>
          {materias.length === 0 ? (
            <p className="pn-results-hint">Todavía no hay resultados para mostrar.</p>
          ) : (
            <div className="pn-table-wrap">
              <table className="pn-table pf-grid ac-evolucion">
                <thead>
                  <tr>
                    <th>Materia</th>
                    {TRIMESTRES.map((n) => <th key={n}>T{n}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {materias.map((nombre) => (
                    <tr key={nombre}>
                      <td><strong>{nombre}</strong></td>
                      {TRIMESTRES.map((n) => {
                        const m = consultas[n].data?.materias?.find((x) => x.materia_nombre === nombre);
                        return <td key={n}>{n > actual ? <span className="pf-muted">—</span> : <Nivel codigo={m?.nivel_codigo} texto={m?.desempeno} />}</td>;
                      })}
                    </tr>
                  ))}
                  <tr className="ac-evolucion-total">
                    <td><strong>General</strong></td>
                    {TRIMESTRES.map((n) => {
                      const d = consultas[n].data;
                      return <td key={n}>{n > actual ? <span className="pf-muted">—</span> : <Nivel codigo={d?.nivel_general} texto={d?.desempeno_general} />}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : q?.isFetching && !data ? (
        <div className="pn-state"><span className="pn-spinner" /><strong>Cargando boletín…</strong></div>
      ) : q?.isError ? (
        <div className="pn-card pn-state"><i className="fas fa-triangle-exclamation" /><strong>No se pudo cargar este trimestre</strong></div>
      ) : data ? (
        <>
          {/* Resumen del trimestre */}
          <section className="pn-card ac-resumen">
            <div>
              <span className="ac-resumen-label">Trimestre {seleccion} · {fechaCorta(data.periodo?.fecha_inicio)} – {fechaCorta(data.periodo?.fecha_fin)}</span>
              <div className="ac-resumen-nivel">
                <Nivel codigo={data.nivel_general} texto={data.desempeno_general} />
              </div>
              <small>Desempeño general de {hijo.nombre}{seleccion === actual ? ' (trimestre en curso: puede cambiar)' : ''}</small>
            </div>
            <div className="ac-resumen-nums">
              <div><strong>{data.materias.length}</strong><span>Materias</span></div>
              <div><strong>{data.inasistencias_total}</strong><span>Inasistencias</span></div>
            </div>
          </section>

          {/* Una tarjeta por materia */}
          {data.materias.length === 0 ? (
            <div className="pn-card pn-panel"><p className="pn-results-hint">Este curso aún no tiene materias asignadas.</p></div>
          ) : (
            <ul className="ac-materias">
              {data.materias.map((m) => (
                <li key={m.materia_nombre} className="pn-card ac-materia">
                  <div className="ac-materia-head">
                    <div>
                      <h3>{m.materia_nombre}</h3>
                      {m.profesor && <small><i className="fas fa-chalkboard-user" aria-hidden="true"></i> Profe {m.profesor}</small>}
                    </div>
                    <Nivel codigo={m.nivel_codigo} texto={m.desempeno} />
                  </div>

                  <div className="ac-materia-faltas">
                    <i className="fas fa-user-clock" aria-hidden="true"></i>
                    {m.inasistencias === 0 ? 'Sin inasistencias' : `${m.inasistencias} ${m.inasistencias === 1 ? 'inasistencia' : 'inasistencias'}`}
                  </div>

                  {m.logros?.length > 0 && (
                    <div className="ac-logros">
                      <small>Logros del trimestre</small>
                      <ul>{m.logros.map((l) => <li key={l.orden}>{l.descripcion}</li>)}</ul>
                    </div>
                  )}

                  {m.observacion_docente && (
                    <blockquote className="ac-obs">
                      <small>Observación de la profesora</small>
                      {m.observacion_docente}
                    </blockquote>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
};

export default Boletin;
