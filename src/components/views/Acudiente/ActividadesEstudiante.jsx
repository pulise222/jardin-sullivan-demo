// src/components/views/Acudiente/ActividadesEstudiante.jsx
import React, { useState, useRef } from 'react';
import {
  useGetEntregasPorEstudianteQuery,
  useSubirEntregableMutation,
} from '../../../features/actividades/actividadesApi';
import './css/Acudiente.css';

const ActividadesEstudiante = ({ estudiante, onBack }) => {
  const [estado, setEstado] = useState('pendientes'); // pendientes | entregadas | todas
  const { data: filas = [], isLoading } = useGetEntregasPorEstudianteQuery({
    estudianteId: estudiante.id,
    estado,
  });
  const [subirEntregable, { isLoading: upBusy }] = useSubirEntregableMutation();
  const inputRefs = useRef({}); // file inputs por fila

  const pickFile = (aeId) => inputRefs.current[aeId]?.click();

  const handleUpload = async (aeId, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('entregable', file);
    await subirEntregable({ actividadEstudianteId: aeId, formData: fd, estudianteId: estudiante.id });
  };

  return (
    <div className="acu-card">
      <div className="acu-card-head">
        <button className="btn-link" onClick={onBack}>← Volver</button>
        <h3>Actividades de {estudiante.nombre} {estudiante.apellido}</h3>
      </div>

      <div className="acu-tabs small">
        {['pendientes','entregadas','todas'].map(t => (
          <button key={t}
            className={`cd-tab ${estado === t ? 'active' : ''}`}
            onClick={() => setEstado(t)}
          >
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? <p>Cargando…</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Actividad</th>
                <th>Fecha</th>
                <th>Entrega máx.</th>
                <th>Entregado</th>
                <th>Nota</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(row => (
                <tr key={row.actividad_estudiante_id}>
                  <td>
                    <strong>{row.titulo}</strong>
                    <div className="muted">{row.descripcion?.slice(0,80)}</div>
                  </td>
                  <td>{row.fecha ?? '—'}</td>
                  <td>{row.fecha_entrega ?? '—'}</td>
                  <td>{row.entregado_en ? new Date(row.entregado_en).toLocaleString() : '—'}</td>
                  <td>{row.calificacion ?? '—'}</td>
                  <td>
                    {row.entregable_url ? (
                      <button className="btn-secondary" onClick={() => window.open(row.entregable_url,'_blank')}>
                        Ver archivo
                      </button>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="*/*"
                          style={{ display:'none' }}
                          ref={el => (inputRefs.current[row.actividad_estudiante_id] = el)}
                          onChange={(e)=>handleUpload(row.actividad_estudiante_id, e.target.files?.[0])}
                        />
                        <button
                          className="btn-primary"
                          onClick={() => pickFile(row.actividad_estudiante_id)}
                          disabled={upBusy || estado==='entregadas'}
                          title={estado==='entregadas' ? 'Ya entregada' : 'Subir entregable'}
                        >
                          {upBusy ? 'Subiendo…' : 'Subir entregable'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr><td colSpan={6}>No hay actividades para este filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActividadesEstudiante;
