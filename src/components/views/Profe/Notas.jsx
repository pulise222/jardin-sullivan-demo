import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetMatrizCalificacionesPorCursoQuery,
  useActualizarEntregaMutation,
} from '../../../features/actividades/actividadesApi';
import toast from 'react-hot-toast';
import './css/Profe.css';

const Notas = () => {
  const cpm = useSelector((s) => s.courses?.curso_profesor_materia);
  const cursoId = cpm?.curso?.id;

  const { data, isLoading, isError, refetch } =
    useGetMatrizCalificacionesPorCursoQuery({ cursoId, todas: 0 }, { skip: !cursoId });

  const [actualizarEntrega, { isLoading: saving }] = useActualizarEntregaMutation();

  // Construimos mapas para llenar inputs
  // useMemo: sin él, el `|| []` crea un arreglo nuevo en cada render y el useEffect de abajo entraría en bucle
  const actividades = useMemo(() => data?.actividades || [], [data]);
  const estudiantes = useMemo(() => data?.estudiantes || [], [data]);

  // mapa: actividadId -> estudianteId -> { aeId, calificacion }
  const baseMap = useMemo(() => {
    const m = {};
    for (const a of actividades) m[a.id] = {};
    for (const c of data?.celdas || []) {
      m[c.actividad_id] ||= {};
      m[c.actividad_id][c.estudiante_id] = {
        aeId: c.actividad_estudiante_id,
        calificacion: c.calificacion,
      };
    }
    return m;
  }, [data, actividades]);

  // draft editable (string para inputs)
  const [draft, setDraft] = useState({});
  useEffect(() => {
    const d = {};
    for (const a of actividades) {
      d[a.id] = {};
      for (const e of estudiantes) {
        const val = baseMap?.[a.id]?.[e.id]?.calificacion ?? '';
        d[a.id][e.id] = val === null ? '' : String(val);
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

  // Promedio por estudiante (1 decimal)
  const promedioAlumno = (est) => {
    if (!actividades.length) return '—';
    const valores = actividades
      .map((a) => parseFloat(draft?.[a.id]?.[est.id]))
      .filter((n) => !Number.isNaN(n));
    if (!valores.length) return '—';
    const avg = valores.reduce((acc, n) => acc + n, 0) / valores.length;
    return avg.toFixed(1);
  };

  const guardarCambios = async () => {
    if (!data) return;
    const trabajos = [];
    for (const a of actividades) {
      for (const e of estudiantes) {
        const nuevo = draft?.[a.id]?.[e.id];
        const previo = baseMap?.[a.id]?.[e.id]?.calificacion ?? '';
        if (`${nuevo}` !== `${previo}`) {
          const aeId = baseMap?.[a.id]?.[e.id]?.aeId;
          if (!aeId) continue; // por seguridad
          const payload = {
            calificacion: nuevo === '' ? null : Number(nuevo),
          };
          trabajos.push(
            actualizarEntrega({
              actividadEstudianteId: aeId,
              data: payload,
              actividadId: a.id, // para invalidatesTags
            }).unwrap()
          );
        }
      }
    }
    try {
      await Promise.all(trabajos);
      await refetch();
      toast.success('Notas guardadas');
    } catch (e) {
      console.error(e);
      toast.error('No se pudieron guardar algunas notas');
    }
  };

  if (!cursoId) return <p className="pn-results-hint">Selecciona un curso.</p>;
  if (isLoading) return <div className="pn-state"><span className="pn-spinner" /><strong>Cargando notas…</strong></div>;
  if (isError) return <div className="pn-state"><i className="fas fa-triangle-exclamation" /><strong>No se pudieron cargar las notas</strong></div>;

  return (
    <div className="pf-notas">
      <h3 className="pf-sub">
        Notas — Curso: {cpm?.curso?.nombre_curso} / Materia: {cpm?.materia?.nombre}
      </h3>

      {actividades.length === 0 ? (
        <p className="pn-results-hint">Este curso aún no tiene actividades. Créalas en la pestaña «Actividades».</p>
      ) : (
        <div className="pn-card pn-table-wrap">
          <table className="pn-table pf-grid">
            <thead>
              <tr>
                <th style={{ width: 60 }}>No</th>
                <th>Nombre del estudiante</th>
                {actividades.map((a) => (
                  <th key={a.id} title={a.titulo}>{a.titulo}</th>
                ))}
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est, idx) => (
                <tr key={est.id}>
                  <td>{idx + 1}</td>
                  <td>{est.nombre} {est.apellido}</td>
                  {actividades.map((a) => (
                    <td key={`${a.id}-${est.id}`}>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={draft?.[a.id]?.[est.id] ?? ''}
                        onChange={(e) => setValor(a.id, est.id, e.target.value)}
                        className="pf-input pf-nota"
                      />
                    </td>
                  ))}
                  <td><span className="pn-chip is-accent">{promedioAlumno(est)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pn-form-actions">
        <button type="button" className="pn-btn" onClick={guardarCambios} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

export default Notas;
