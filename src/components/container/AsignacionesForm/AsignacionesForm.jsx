// src/components/container/AsignacionesForm/AsignacionesForm.jsx
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

import { useGetCoursesQuery } from '../../../features/cursos/cursosApi';
import { useGetPeopleQuery } from '../../../features/people/personApi';
import { useGetMateriasQuery } from '../../../features/materias/materiasApi';
import {
  useCreateAsignacionMutation,
  useUpdateAsignacionMutation,
} from '../../../features/asignaciones/asignacionesApi';
import { Field } from '../../forms/ui/FormKit';

/*
  Formulario para asignar un profesor a una materia en un curso (o editar una asignación).
  Props:
    editing  → la asignación que se está editando (o null para crear una nueva)
    onSaved  → se llama al guardar
    onCancel → se llama al cancelar la edición
*/
const AsignacionesForm = ({ editing, onSaved, onCancel }) => {
  const { data: cursos = [] } = useGetCoursesQuery();
  const { data: personas = [] } = useGetPeopleQuery();
  const { data: materias = [] } = useGetMateriasQuery();

  const [createAsignacion, { isLoading: creating }] = useCreateAsignacionMutation();
  const [updateAsignacion, { isLoading: updating }] = useUpdateAsignacionMutation();

  // Solo profesores; si aún no hay ninguno marcado con ese rol, se muestran todas las personas
  const profesores = personas.filter((p) => p.usuario?.rol === 'Profesor');
  const opcionesProfesor = profesores.length > 0 ? profesores : personas;

  const formik = useFormik({
    // enableReinitialize: al elegir otra asignación para editar, el formulario se llena solo
    enableReinitialize: true,
    initialValues: {
      curso_id: editing?.curso?.id ?? '',
      persona_id: editing?.persona?.id ?? '',
      materia_id: editing?.materia?.id ?? '',
    },
    validationSchema: Yup.object({
      curso_id: Yup.number().typeError('Selecciona un curso').required('Requerido'),
      persona_id: Yup.number().typeError('Selecciona un profesor').required('Requerido'),
      materia_id: Yup.number().typeError('Selecciona una materia').required('Requerido'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editing?.id) {
          await updateAsignacion({ id: editing.id, ...values }).unwrap();
          toast.success('Asignación actualizada');
        } else {
          await createAsignacion(values).unwrap();
          toast.success('Asignación creada');
        }
        resetForm();
        onSaved?.();
      } catch (err) {
        console.error(err);
        toast.error(err?.data?.detail || 'No se pudo guardar la asignación');
      }
    },
  });

  const busy = creating || updating;

  return (
    <section className="pn-card pn-panel pn-sticky" aria-label="Formulario de asignación">
      <header className="pn-panel-head">
        <h2>{editing ? 'Editar asignación' : 'Nueva asignación'}</h2>
      </header>

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="pn-form-grid pn-one-col">
          <Field formik={formik} name="curso_id" label="Curso *" as="select">
            <option value="">Selecciona un curso</option>
            {cursos.map((c) => <option key={c.id} value={c.id}>{c.nombre_curso}</option>)}
          </Field>

          <Field formik={formik} name="persona_id" label="Profesor *" as="select">
            <option value="">Selecciona un profesor</option>
            {opcionesProfesor.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
          </Field>

          <Field formik={formik} name="materia_id" label="Materia *" as="select">
            <option value="">Selecciona una materia</option>
            {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </Field>
        </div>

        <div className="pn-form-actions">
          {editing && (
            <button type="button" className="pn-btn-ghost" onClick={onCancel} disabled={busy}>Cancelar</button>
          )}
          <button type="submit" className="pn-btn" disabled={busy}>
            {busy ? (
              <><span className="pn-spinner-sm" aria-hidden="true"></span>Guardando…</>
            ) : (
              <><i className={`fas ${editing ? 'fa-check' : 'fa-link'}`} aria-hidden="true"></i>{editing ? 'Actualizar' : 'Asignar'}</>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AsignacionesForm;
