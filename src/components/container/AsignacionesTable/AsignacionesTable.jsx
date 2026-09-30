// src/components/container/AsignacionesTable/AsignacionesTable.jsx
import React from 'react';
import toast from 'react-hot-toast';
import { useGetAsignacionesQuery, useDeleteAsignacionMutation } from '../../../features/asignaciones/asignacionesApi';
import useConfirm from '../../../hooks/useConfirm';

/* Tabla de asignaciones: qué profesor dicta qué materia en cada curso. */
const AsignacionesTable = ({ onEdit, editingId }) => {
  const { data: asignaciones = [], isLoading, isError } = useGetAsignacionesQuery();
  const [del, { isLoading: deleting }] = useDeleteAsignacionMutation();
  const [confirm, confirmDialog] = useConfirm();

  if (isLoading) {
    return (
      <div className="pn-card pn-state" role="status">
        <span className="pn-spinner" aria-hidden="true"></span>
        <strong>Cargando asignaciones…</strong>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="pn-card pn-state" role="alert">
        <i className="fas fa-triangle-exclamation" aria-hidden="true"></i>
        <strong>No pudimos cargar las asignaciones</strong>
      </div>
    );
  }

  const handleDelete = async (a) => {
    const ok = await confirm({
      title: '¿Eliminar esta asignación?',
      message: `${a.persona?.nombre ?? 'El profesor'} dejará de dictar ${a.materia?.nombre ?? 'la materia'} en ${a.curso?.nombre_curso ?? 'el curso'}.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await del(a.id).unwrap();
      toast.success('Asignación eliminada');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo eliminar la asignación');
    }
  };

  if (asignaciones.length === 0) {
    return (
      <div className="pn-card pn-state">
        <i className="fas fa-diagram-project" aria-hidden="true"></i>
        <strong>Aún no hay asignaciones</strong>
        <span>Usa el formulario para asignar un profesor a una materia.</span>
      </div>
    );
  }

  return (
    <>
      <div className="pn-card">
        <div className="pn-table-wrap">
          <table className="pn-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Profesor</th>
                <th>Materia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((a) => (
                <tr key={a.id} className={editingId === a.id ? 'is-selected' : ''}>
                  <td><span className="pn-chip is-teal">{a.curso?.nombre_curso ?? '—'}</span></td>
                  <td>
                    <div className="pn-person">
                      <span className={`pn-avatar t${(a.persona?.nombre || '?').charCodeAt(0) % 4}`} aria-hidden="true">
                        {(a.persona?.nombre || '?').charAt(0)}
                      </span>
                      <strong>{a.persona?.nombre} {a.persona?.apellido}</strong>
                    </div>
                  </td>
                  <td><span className="pn-chip is-amber">{a.materia?.nombre ?? '—'}</span></td>
                  <td>
                    <div className="pn-actions">
                      <button type="button" className="pn-icon-btn is-edit" onClick={() => onEdit(a)}
                        aria-label="Editar asignación" title="Editar">
                        <i className="fas fa-pen" aria-hidden="true"></i>
                      </button>
                      <button type="button" className="pn-icon-btn is-danger" onClick={() => handleDelete(a)}
                        disabled={deleting} aria-label="Eliminar asignación" title="Eliminar">
                        <i className="fas fa-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {confirmDialog}
    </>
  );
};

export default AsignacionesTable;
