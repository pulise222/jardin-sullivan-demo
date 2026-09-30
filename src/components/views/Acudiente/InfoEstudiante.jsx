// src/components/views/Acudiente/InfoEstudiante.jsx
import React, { useState } from 'react';
import { useGetMisEstudiantesQuery } from '../../../features/acudiente/acudienteApi';
import EstudianteCard from './EstudianteCard';
import BoletinAcudiente from './BoletinAcudiente';
import { useGetEntregasPorEstudianteQuery, useSubirEntregableMutation } from '../../../features/actividades/actividadesApi';
import FilePreview from '../../common/FilePreview';

const InfoEstudiante = () => {
  const [tab, setTab] = useState('estudiante');
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [filtro, setFiltro] = useState('todas');

  // Asumimos endpoint: GET /acudientes/mis-estudiantes/
  const { data: estudiantes = [], isLoading, isError } = useGetMisEstudiantesQuery();

  // Para la vista de actividades
  const { data: filas = [], isLoading: loadingActividades, isError: errorActividades, refetch } =
    useGetEntregasPorEstudianteQuery(
      { estudianteId: selectedEstudiante?.id, estado: filtro }, 
      { skip: !selectedEstudiante }
    );

  const [subirEntregable, { isLoading: uploading }] = useSubirEntregableMutation();

  // estado del visor
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const onUpload = async (aeId, file) => {
    if (!file) return;
    const form = new FormData();
    form.append('entregable', file);
    try {
      await subirEntregable({ actividadEstudianteId: aeId, formData: form, actividadId: 0 }).unwrap();
      refetch();
    } catch (e) {
      console.error(e);
      alert('No se pudo subir el archivo');
    }
  };

  const openPreview = (row) => {
    setPreviewFile({
      url: row.entregable_url,
      mime: row.mime,
      filename: row.filename,
      downloadUrl: row.download_url,
    });
    setPreviewOpen(true);
  };

  const handleDownload = async (row) => {
    try {
      const token = localStorage.getItem('access');
      const res = await fetch(row.download_url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = row.filename || 'entregable';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('No se pudo descargar el archivo');
    }
  };

  const handleVerActividades = (estudiante) => {
    setSelectedEstudiante(estudiante);
    setTab('actividades');
  };

  return (
    <section>
      <div className="acu-tabs">
        <button
          type="button"
          className={`acu-tab ${tab === 'estudiante' ? 'active' : ''}`}
          onClick={() => setTab('estudiante')}
        >
          Estudiante
        </button>
        <button
          type="button"
          className={`acu-tab ${tab === 'boletin' ? 'active' : ''}`}
          onClick={() => setTab('boletin')}
        >
          Boletín
        </button>
        {selectedEstudiante && (
          <button
            type="button"
            className={`acu-tab ${tab === 'actividades' ? 'active' : ''}`}
            onClick={() => setTab('actividades')}
          >
            Actividades
          </button>
        )}
      </div>

      {tab === 'estudiante' && (
        <>
          {isLoading && <p>Cargando estudiantes…</p>}
          {isError && <p>Error cargando estudiantes.</p>}
          {!isLoading && !isError && (estudiantes?.length === 0 ? (
            <p>No tienes estudiantes asociados.</p>
          ) : (
            estudiantes.map((e) => (
              <EstudianteCard 
                key={e.id} 
                estudiante={e} 
                onVerActividades={() => handleVerActividades(e)}
              />
            ))
          ))}
        </>
      )}

      {tab === 'boletin' && (
        <div className="acu-card">
          <h3>Boletín</h3>
          <BoletinAcudiente></BoletinAcudiente>
        </div>
      )}

      {tab === 'actividades' && selectedEstudiante && (
        <>
          <div className="acu-card" style={{ marginBottom: 12 }}>
            <h2 style={{ marginTop: 0 }}>
              Actividades de {selectedEstudiante.nombre} {selectedEstudiante.apellido}
            </h2>
            <div className="acu-tabs">
              <button className={`acu-tab ${filtro==='todas'?'active':''}`} onClick={() => setFiltro('todas')}>Todas</button>
              <button className={`acu-tab ${filtro==='pendientes'?'active':''}`} onClick={() => setFiltro('pendientes')}>Pendientes</button>
              <button className={`acu-tab ${filtro==='entregadas'?'active':''}`} onClick={() => setFiltro('entregadas')}>Entregadas</button>
            </div>
          </div>

          <div className="acu-card">
            {loadingActividades && <p>Cargando…</p>}
            {errorActividades && <p>Error cargando actividades.</p>}
            {!loadingActividades && !errorActividades && (
              filas.length === 0 ? <p>No hay actividades para este filtro.</p> : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Fecha</th>
                        <th>Entrega</th>
                        <th>Nota</th>
                        <th>Archivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filas.map((row) => (
                        <tr key={row.actividad_estudiante_id}>
                          <td>
                            <strong>{row.titulo}</strong>
                            <div className="muted">{row.descripcion}</div>
                          </td>
                          <td>
                            {row.fecha || '—'}
                            {row.fecha_entrega ? <div className="muted">Límite: {row.fecha_entrega}</div> : null}
                          </td>
                          <td>{row.entregado_en ? new Date(row.entregado_en).toLocaleString() : 'Pendiente'}</td>
                          <td>{row.calificacion ?? '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              {row.entregable_url ? (
                                  <>
                                    {/* Ver (previsualiza si es imagen/pdf; si no, muestra fallback) */}
                                    <button className="btn-secondary" onClick={() => openPreview(row)}>
                                      Ver
                                    </button>
                                    {/* Descargar (forzado) */}
                                    <button className="btn" onClick={() => handleDownload(row)}>Descargar </button>
                                  </>
                                ) : (
                                  <span className="muted">Sin archivo</span>
                                )}
                              <label className="btn-primary" style={{ cursor: 'pointer' }}>
                                {row.entregable_url ? 'Reemplazar' : 'Subir'}
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                  style={{ display: 'none' }}
                                  onChange={(e) => onUpload(row.actividad_estudiante_id, e.target.files?.[0])}
                                  disabled={uploading}
                                />
                              </label>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
          {/* Modal de previsualización */}
          <FilePreview open={previewOpen} onClose={() => setPreviewOpen(false)} file={previewFile} />
        </>
      )}
    </section>
  );
};

export default InfoEstudiante;
