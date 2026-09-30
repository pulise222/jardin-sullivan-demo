// src/components/views/Acudiente/ActividadesHijo.jsx
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetEntregasPorEstudianteQuery,
  useSubirEntregableMutation,
} from '../../../features/actividades/actividadesApi';
import FilePreview from '../../common/FilePreview';

const FILTROS = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Por evaluar' },
  { id: 'evaluadas', label: 'Evaluadas' },
];

const fecha = (f) =>
  f ? new Date(`${f}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : null;

/*
  Actividades de UN hijo. Se piden todas de una vez y se filtran aquí, así los tres números de
  arriba (total, evaluadas, por evaluar) siempre coinciden con lo que se ve en la lista.
  La familia puede adjuntar una evidencia (foto o documento) y verla o descargarla.
*/
const ActividadesHijo = ({ hijo }) => {
  const [filtro, setFiltro] = useState('todas');
  const { data: filas = [], isLoading, isError } = useGetEntregasPorEstudianteQuery({ estudianteId: hijo.id, estado: 'todas' });
  const [subirEntregable, { isLoading: subiendo }] = useSubirEntregableMutation();

  // Visor de archivos
  const [archivo, setArchivo] = useState(null);

  const evaluadas = useMemo(() => filas.filter((f) => f.calificacion != null).length, [filas]);
  const visibles = useMemo(() => {
    if (filtro === 'evaluadas') return filas.filter((f) => f.calificacion != null);
    if (filtro === 'pendientes') return filas.filter((f) => f.calificacion == null);
    return filas;
  }, [filas, filtro]);

  const subir = async (fila, file) => {
    if (!file) return;
    const form = new FormData();
    form.append('entregable', file);
    try {
      // estudianteId: para que la caché de ESTE hijo se actualice sola al terminar
      await subirEntregable({ actividadEstudianteId: fila.actividad_estudiante_id, formData: form, estudianteId: hijo.id }).unwrap();
      toast.success('Archivo enviado');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo subir el archivo');
    }
  };

  const descargar = async (fila) => {
    try {
      const token = localStorage.getItem('access');
      const res = await fetch(fila.download_url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const url = window.URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = fila.filename || 'archivo';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error('No se pudo descargar el archivo');
    }
  };

  if (isLoading) return <div className="pn-state"><span className="pn-spinner" /><strong>Cargando actividades…</strong></div>;
  if (isError) return <div className="pn-state"><i className="fas fa-triangle-exclamation" /><strong>No se pudieron cargar las actividades</strong></div>;

  return (
    <div className="ac-actividades">
      <section className="pf-stats" aria-label="Resumen de actividades">
        <div className="pf-stat"><strong>{filas.length}</strong><span>Actividades</span></div>
        <div className="pf-stat"><strong>{evaluadas}</strong><span>Evaluadas</span></div>
        <div className="pf-stat"><strong>{filas.length - evaluadas}</strong><span>Por evaluar</span></div>
      </section>

      <nav className="pf-tabs pf-tabs-sm" role="tablist" aria-label="Filtrar actividades">
        {FILTROS.map((f) => (
          <button key={f.id} type="button" role="tab" aria-selected={filtro === f.id} className={filtro === f.id ? 'is-active' : ''} onClick={() => setFiltro(f.id)}>
            {f.label}
          </button>
        ))}
      </nav>

      {visibles.length === 0 ? (
        <div className="pn-card pn-panel"><p className="pn-results-hint">No hay actividades en esta lista.</p></div>
      ) : (
        <ul className="ac-act-list">
          {visibles.map((f) => (
            <li key={f.actividad_estudiante_id} className="pn-card ac-act">
              <div className="ac-act-head">
                <div>
                  <h3>{f.titulo}</h3>
                  {f.materia && <span className="pn-chip is-accent">{f.materia}</span>}
                </div>
                {/* Nivel de evaluación con su color, o «Por evaluar» si aún no hay */}
                {f.calificacion != null
                  ? <span className={`pn-chip lvl-${f.calificacion}`}>{f.nivel}</span>
                  : <span className="pn-chip">Por evaluar</span>}
              </div>

              {f.descripcion && <p>{f.descripcion}</p>}

              <div className="ac-act-meta">
                {f.fecha && <span><i className="fas fa-calendar" aria-hidden="true"></i> {fecha(f.fecha)}</span>}
                {f.fecha_entrega && <span><i className="fas fa-flag" aria-hidden="true"></i> Entrega {fecha(f.fecha_entrega)}</span>}
              </div>

              {/* Evidencia: ver, descargar, subir o reemplazar */}
              <div className="ac-act-files pn-actions">
                {f.entregable_url && (
                  <>
                    <button type="button" className="pn-btn-ghost pn-btn-small"
                      onClick={() => setArchivo({ url: f.entregable_url, mime: f.mime, filename: f.filename, downloadUrl: f.download_url })}>
                      <i className="fas fa-eye" aria-hidden="true"></i> Ver
                    </button>
                    <button type="button" className="pn-btn-ghost pn-btn-small" onClick={() => descargar(f)}>
                      <i className="fas fa-download" aria-hidden="true"></i> Descargar
                    </button>
                  </>
                )}
                <label className="pn-btn pn-btn-small ac-upload">
                  <i className="fas fa-paperclip" aria-hidden="true"></i> {f.entregable_url ? 'Reemplazar' : 'Adjuntar evidencia'}
                  <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" hidden disabled={subiendo}
                    onChange={(e) => { subir(f, e.target.files?.[0]); e.target.value = ''; }} />
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FilePreview open={!!archivo} onClose={() => setArchivo(null)} file={archivo} />
    </div>
  );
};

export default ActividadesHijo;
