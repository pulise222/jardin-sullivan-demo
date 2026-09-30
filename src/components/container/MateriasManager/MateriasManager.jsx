// src/components/container/MateriasManager/MateriasManager.jsx
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  useGetMateriasQuery,
  useCreateMateriaMutation,
  useUpdateMateriaMutation,
  useDeleteMateriaMutation
} from '../../../features/materias/materiasApi';
import useConfirm from '../../../hooks/useConfirm';
import { Field } from '../../forms/ui/FormKit';

/*
  Gestión de materias: a la izquierda la lista, a la derecha el formulario para crear o editar.
  La lógica de datos es la original (RTK Query + Formik); cambió el diseño y los avisos.
*/
const MateriasManager = () => {
  // 1) Traer lista
  const { data: materias = [], isLoading, isError } = useGetMateriasQuery();

  // 2) Mutations
  const [createMateria, { isLoading: isCreating }] = useCreateMateriaMutation();
  const [updateMateria, { isLoading: isUpdating }] = useUpdateMateriaMutation();
  const [deleteMateria, { isLoading: isDeleting }] = useDeleteMateriaMutation();
  const [confirm, confirmDialog] = useConfirm();

  // 3) Estado de edición
  const [editing, setEditing] = useState(null); // {id, nombre} o null

  // 4) Formik (se vuelve a inicializar cuando cambia `editing`)
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { nombre: editing?.nombre || '' },
    validationSchema: Yup.object({
      nombre: Yup.string().trim().required('Este campo es obligatorio'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editing) {
          await updateMateria({ id: editing.id, ...values }).unwrap();
          toast.success('Materia actualizada');
          setEditing(null);
        } else {
          await createMateria(values).unwrap();
          toast.success('Materia creada');
        }
        resetForm();
      } catch (err) {
        console.error('Error al guardar materia:', err);
        toast.error('No se pudo guardar la materia');
      }
    },
  });

  const onCancelEdit = () => {
    setEditing(null);
    formik.resetForm();
  };

  const onDeleteClick = async (m) => {
    const ok = await confirm({
      title: `¿Eliminar “${m.nombre}”?`,
      message: 'Si hay asignaciones que usan esta materia, también se verán afectadas.',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteMateria(m.id).unwrap();
      toast.success('Materia eliminada');
      if (editing?.id === m.id) onCancelEdit();
    } catch (err) {
      console.error('Error al eliminar materia:', err);
      toast.error('No se pudo eliminar la materia');
    }
  };

  if (isLoading) {
    return (
      <div className="pn-card pn-state" role="status">
        <span className="pn-spinner" aria-hidden="true"></span>
        <strong>Cargando materias…</strong>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="pn-card pn-state" role="alert">
        <i className="fas fa-triangle-exclamation" aria-hidden="true"></i>
        <strong>No pudimos cargar las materias</strong>
      </div>
    );
  }

  const busy = isCreating || isUpdating;

  return (
    <div className="pn-split">
      {/* ===== Lista ===== */}
      <section className="pn-card pn-panel" aria-label="Materias existentes">
        <header className="pn-panel-head">
          <h2>Materias existentes</h2>
          <span className="pn-chip is-accent">{materias.length}</span>
        </header>

        {materias.length === 0 ? (
          <div className="pn-state">
            <i className="fas fa-book-open" aria-hidden="true"></i>
            <strong>Aún no hay materias</strong>
            <span>Crea la primera con el formulario.</span>
          </div>
        ) : (
          <ul className="pn-list">
            {materias.map((m) => (
              <li key={m.id} className={editing?.id === m.id ? 'is-selected' : ''}>
                <div className="pn-person">
                  <span className={`pn-avatar t${m.id % 4}`} aria-hidden="true"><i className="fas fa-book"></i></span>
                  <strong>{m.nombre}</strong>
                </div>
                <div className="pn-actions">
                  <button type="button" className="pn-icon-btn is-edit" onClick={() => setEditing(m)}
                    aria-label={`Editar ${m.nombre}`} title="Editar">
                    <i className="fas fa-pen" aria-hidden="true"></i>
                  </button>
                  <button type="button" className="pn-icon-btn is-danger" onClick={() => onDeleteClick(m)}
                    disabled={isDeleting} aria-label={`Eliminar ${m.nombre}`} title="Eliminar">
                    <i className="fas fa-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ===== Formulario ===== */}
      <section className="pn-card pn-panel pn-sticky" aria-label="Formulario de materia">
        <header className="pn-panel-head">
          <h2>{editing ? 'Editar materia' : 'Nueva materia'}</h2>
        </header>
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="pn-form-grid pn-one-col">
            <Field formik={formik} name="nombre" label="Nombre de la materia *" placeholder="Ej. Matemáticas" />
          </div>
          <div className="pn-form-actions">
            {editing && (
              <button type="button" className="pn-btn-ghost" onClick={onCancelEdit}>Cancelar</button>
            )}
            <button type="submit" className="pn-btn" disabled={busy}>
              {busy ? (
                <><span className="pn-spinner-sm" aria-hidden="true"></span>Guardando…</>
              ) : (
                <><i className={`fas ${editing ? 'fa-check' : 'fa-plus'}`} aria-hidden="true"></i>{editing ? 'Guardar cambios' : 'Crear materia'}</>
              )}
            </button>
          </div>
        </form>
      </section>
      {confirmDialog}
    </div>
  );
};

export default MateriasManager;
