// src/components/container/TablaPersonas/TablaPersonas.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { setPeople } from '../../../features/people/personSlice';
import { useGetPeopleQuery, useDeletePersonMutation } from '../../../features/people/personApi';
import useConfirm from '../../../hooks/useConfirm';

// Cada rol con su etiqueta de color (las clases están en styles/panel.css)
const ROL_CHIP = {
  Administrador: 'is-petrol',
  Profesor: 'is-teal',
  Acudiente: 'is-amber',
};

const TablaPersonas = ({ handleEdit }) => {
  const dispatch = useDispatch();
  const personas = useSelector((state) => state.people.people);
  const personasFiltradas = useSelector((state) => state.people.personasFiltradas);

  const { data, isSuccess, isLoading, isError } = useGetPeopleQuery();
  const [deletePerson] = useDeletePersonMutation();
  const [confirm, confirmDialog] = useConfirm();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setPeople(data));
    }
  }, [isSuccess, data, dispatch]);

  if (isLoading) {
    return (
      <div className="pn-card pn-state" role="status">
        <span className="pn-spinner" aria-hidden="true"></span>
        <strong>Cargando personas…</strong>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pn-card pn-state" role="alert">
        <i className="fas fa-triangle-exclamation" aria-hidden="true"></i>
        <strong>No pudimos cargar las personas</strong>
        <span>Revisa que el servidor esté encendido e inténtalo de nuevo.</span>
      </div>
    );
  }

  const handleDelete = async (per) => {
    const ok = await confirm({
      title: `¿Eliminar a ${per.nombre} ${per.apellido}?`,
      message: 'También se eliminará su usuario de acceso. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await deletePerson(per.id).unwrap();
      toast.success('Persona eliminada');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo eliminar la persona');
    }
  };

  const lista = (personasFiltradas.length > 0 ? personasFiltradas : personas) || [];

  if (lista.length === 0) {
    return (
      <div className="pn-card pn-state">
        <i className="fas fa-user-group" aria-hidden="true"></i>
        <strong>Aún no hay personas</strong>
        <span>Usa el botón “Agregar persona” para crear la primera.</span>
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
                <th>Persona</th>
                <th>Rol</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((per) => {
                const rol = per.usuario?.rol ?? per.rol;
                return (
                  <tr key={per.id}>
                    <td>
                      <div className="pn-person">
                        <span className={`pn-avatar t${(per.nombre || '?').charCodeAt(0) % 4}`} aria-hidden="true">
                          {(per.nombre || '?').charAt(0)}
                        </span>
                        <div>
                          <strong>{per.nombre} {per.apellido}</strong>
                          {/* el correo puede venir del usuario anidado */}
                          <small><i className="fas fa-envelope" aria-hidden="true"></i> {per.usuario?.email ?? per.email ?? 'Sin correo'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {rol ? <span className={`pn-chip ${ROL_CHIP[rol] || ''}`}>{rol}</span> : <span className="pn-muted">—</span>}
                    </td>
                    <td>
                      <span className="pn-chip is-petrol">{per.tipo_documento || '—'}</span>{' '}
                      <span className="pn-muted">{per.numero_documento}</span>
                    </td>
                    <td className="pn-muted">{per.telefono || '—'}</td>
                    <td className="pn-muted pn-clip" title={per.direccion || ''}>{per.direccion || '—'}</td>
                    <td>
                      <div className="pn-actions">
                        <button
                          type="button"
                          className="pn-icon-btn is-edit"
                          onClick={() => handleEdit(per)}
                          aria-label={`Editar a ${per.nombre} ${per.apellido}`}
                          title="Editar"
                        >
                          <i className="fas fa-pen" aria-hidden="true"></i>
                        </button>
                        <button
                          type="button"
                          className="pn-icon-btn is-danger"
                          onClick={() => handleDelete(per)}
                          aria-label={`Eliminar a ${per.nombre} ${per.apellido}`}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash" aria-hidden="true"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {confirmDialog}
    </>
  );
};

export default TablaPersonas;
