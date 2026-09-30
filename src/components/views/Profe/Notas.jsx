import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  useGetMatrizCalificacionesPorCursoQuery,
  useActualizarEntregaMutation,
} from '../../../features/actividades/actividadesApi';
import { NIVELES, promedioNivel } from '../../../utils/escala';
import './css/Profe.css';

// Periodos del año escolar (trimestres). Si el jardín usa otra cantidad, basta con cambiar esta lista.
const PERIODOS = [1, 2, 3, 4];
const periodoActual = () => Math.floor(new Date().getMonth() / 3) + 1;

// El backend devuelve la ruta del archivo ("/media/..."); la volvemos absoluta para poder abrirla
const urlArchivo = (u) => new URL(u, 'http://127.0.0.1:8000/').href;

/*
  Planilla de evaluación de UNA materia en UN curso.
  A los niños no se les pone un número sino un nivel (Deficiente · Aceptable · Sobresaliente).
  El promedio de cada niño también es un nivel. La lógica de la escala está en utils/escala.js
  (espejo de academico/escala.py en el backend, que es quien calcula el dato oficial).
*/
const Notas = () => {
  const cpm = useSelector((s) => s.courses?.curso_profesor_materia);
  const cursoId = cpm?.curso?.id;

  // '' = todo el año
  const [periodo, setPeriodo] = useState(String(periodoActual()));

  // cpmId: solo las actividades de esta materia (antes se mezclaban con las otras materias del curso)
  const { data, isLoading, isError } = useGetMatrizCalificacionesPorCursoQuery(
    { cursoId, cpmId: cpm?.id, periodo },
    { skip: !cursoId }
  );

  const [actualizarEntrega, { isLoading: saving }] = useActualizarEntregaMutation();

  // useMemo: sin él, el `|| []` crea un arreglo nuevo en cada render y el useEffect de abajo entraría en bucle
  const actividades = useMemo(() => data?.actividades || [], [data]);
  const estudiantes = useMemo(() => data?.estudiantes || [], [data]);

  // mapa: actividadId -> estudianteId -> { aeId, calificacion, url }
  const baseMap = useMemo(() => {
    const m = {};
    for (const a of actividades) m[a.id] = {};
    for (const c of data?.celdas || []) {
      m[c.actividad_id] ||= {};
      m[c.actividad_id][c.estudiante_id] = {
        aeId: c.actividad_estudiante_id,
        calificacion: c.calificacion,
        url: c.entregable_url,
      };
    }
    return m;
  }, [data, actividades]);

  // borrador editable: valor de cada <select> como texto ('' = sin evaluar, '1', '2' o '3')
  const [draft, setDraft] = useState({});
  useEffect(() => {
    const d = {};
    for (const a of actividades) {
      d[a.id] = {};
      for (const e of estudiantes) {
        const val = baseMap?.[a.id]?.[e.id]?.calificacion;
        d[a.id][e.id] = val == null ? '' : String(val);
      }
    }
    setDraft(d);
  }, [baseMap, actividades, estudiantes]);

  const setValor = (actividadId, estudianteId, val) => {
    setDraft((prev) => ({
      ...prev,
      [actividadId]: { ...prev[actividadId], [estudianteId]: val },
    }));
  };

  // Celdas que cambiaron respecto a lo guardado (para el contador y el botón)
  const cambios = useMemo(() => {
    const lista = [];
    for (const a of actividades) {
      for (const e of estudiantes) {
        const nuevo = draft?.[a.id]?.[e.id] ?? '';
        const previo = baseMap?.[a.id]?.[e.id]?.calificacion;
        const aeId = baseMap?.[a.id]?.[e.id]?.aeId;
        if (aeId && nuevo !== (previo == null ? '' : String(previo))) lista.push({ a, aeId, nuevo });
      }
    }
    return lista;
  }, [draft, baseMap, actividades, estudiantes]);

  // Vista previa del promedio mientras se edita (el oficial llega del backend al guardar)
  const promedioAlumno = (est) =>
    promedioNivel(actividades.map((a) => draft?.[a.id]?.[est.id] ?? ''));

  const guardarCambios = async () => {
    try {
      await Promise.all(
        cambios.map(({ a, aeId, nuevo }) =>
          actualizarEntrega({
            actividadEstudianteId: aeId,
            data: { calificacion: nuevo === '' ? null : Number(nuevo) },
            actividadId: a.id, // para invalidatesTags
          }).unwrap()
        )
      );
      toast.success('Evaluaciones guardadas');
    } catch (e) {
      console.error(e);
      toast.error('No se pudieron guardar algunas evaluaciones');
    }
  };

  if (!cursoId) return <p className="pn-results-hint">Selecciona un curso.</p>;
  if (isLoading) return <div className="pn-state"><span className="pn-spinner" /><strong>Cargando evaluaciones…</strong></div>;
  if (isError) return <div className="pn-state"><i className="fas fa-triangle-exclamation" /><strong>No se pudieron cargar las evaluaciones</strong></div>;

  return (
    <div className="pf-notas">
      <div className="pn-toolbar pf-toolbar">
        <h2>Evaluación de {cpm?.materia?.nombre}</h2>
        <div className="pn-toolbar-actions">
          <label className="pf-date">
            Periodo
            <select className="pf-input" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              {PERIODOS.map((p) => <option key={p} value={p}>Periodo {p}</option>)}
              <option value="">Todo el año</option>
            </select>
          </label>
        </div>
      </div>

      {/* Leyenda: qué significa cada color */}
      <div className="pf-legend" aria-label="Escala de evaluación">
        {NIVELES.map((n) => <span key={n.codigo} className={`pn-chip ${n.chip}`}>{n.etiqueta}</span>)}
      </div>

      {actividades.length === 0 ? (
        <div className="pn-card pn-panel">
          <p className="pn-results-hint">
            No hay actividades en {periodo ? `el periodo ${periodo}` : 'este curso'}. Créalas en la pestaña «Actividades».
          </p>
        </div>
      ) : (
        <>
          <div className="pn-card pn-table-wrap">
            <table className="pn-table pf-grid">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>No</th>
                  <th>Estudiante</th>
                  {actividades.map((a) => (
                    <th key={a.id} title={a.titulo}>{a.titulo}</th>
                  ))}
                  <th>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((est, idx) => {
                  const prom = promedioAlumno(est);
                  return (
                    <tr key={est.id}>
                      <td>{idx + 1}</td>
                      <td><strong>{est.nombre} {est.apellido}</strong></td>
                      {actividades.map((a) => {
                        const valor = draft?.[a.id]?.[est.id] ?? '';
                        const url = baseMap?.[a.id]?.[est.id]?.url;
                        return (
                          <td key={`${a.id}-${est.id}`}>
                            <div className="pf-celda">
                              <select
                                className={`pf-input pf-nivel ${valor ? `n${valor}` : ''}`}
                                value={valor}
                                onChange={(e) => setValor(a.id, est.id, e.target.value)}
                                aria-label={`${est.nombre}: ${a.titulo}`}
                              >
                                <option value="">—</option>
                                {NIVELES.map((n) => <option key={n.codigo} value={n.codigo}>{n.etiqueta}</option>)}
                              </select>
                              {/* Si el acudiente subió una evidencia (foto, PDF…), aparece el clip para verla */}
                              {url && (
                                <a className="pf-clip" href={urlArchivo(url)} target="_blank" rel="noopener noreferrer" title="Ver evidencia adjunta">
                                  <i className="fas fa-paperclip" aria-hidden="true"></i>
                                </a>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td>
                        {prom
                          ? <span className={`pn-chip ${prom.chip}`}>{prom.etiqueta}</span>
                          : <span className="pf-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pn-form-actions">
            {cambios.length > 0 && <span className="pf-muted">{cambios.length} cambio{cambios.length > 1 ? 's' : ''} sin guardar</span>}
            <button type="button" className="pn-btn" onClick={guardarCambios} disabled={saving || cambios.length === 0}>
              <i className="fas fa-check" aria-hidden="true"></i> {saving ? 'Guardando…' : 'Guardar evaluaciones'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Notas;
