// src/components/forms/update/UpdateStudentForm/UpdateStudentForm.jsx
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useUpdateStudentMutation } from '../../../../features/students/studentApi';
import { useGetCoursesQuery } from '../../../../features/cursos/cursosApi';
import { ModalCard, Field, FormAlert, FormFooter } from '../../ui/FormKit';

/*
  Formulario para EDITAR un estudiante (dentro de una ventana emergente).
  La lógica de datos es la misma de antes (Formik + Yup + useUpdateStudentMutation);
  cambió el diseño (usa las piezas de FormKit), el curso se elige de una lista con nombres,
  y los avisos salen como notificaciones en vez de alert().
*/

const required = "Este campo es obligatorio";

const validationSchema = Yup.object().shape({
  nombre: Yup.string().trim().required(required),
  apellido: Yup.string().trim().required(required),
  fecha_nacimiento: Yup.string().required(required),
  direccion: Yup.string().trim().required(required),
  telefono: Yup.string().trim().required(required),
  correo_electronico: Yup.string().email('Correo inválido').required(required),
  tipo_documento: Yup.string().oneOf(['RC', 'TI', 'PAS', 'CE']).required(required),
  numero_documento: Yup.string().matches(/^[A-Za-z0-9\-.]{4,30}$/, '4 a 30 caracteres (letras, números, - y .)').required(required),
  curso: Yup.number().typeError('Selecciona un curso').required(required),
});

const UpdateStudentForm = ({ student, onClose }) => {
  const [updateStudent, { isLoading }] = useUpdateStudentMutation();
  const { data: cursos = [], isLoading: cargandoCursos } = useGetCoursesQuery();
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    enableReinitialize: true, // si se abre otro estudiante, el formulario se actualiza
    initialValues: {
      nombre: student?.nombre || '',
      apellido: student?.apellido || '',
      fecha_nacimiento: student?.fecha_nacimiento || '',
      direccion: student?.direccion || '',
      telefono: student?.telefono || '',
      correo_electronico: student?.correo_electronico || '',
      tipo_documento: student?.tipo_documento || 'RC',
      numero_documento: student?.numero_documento || '',
      curso: student?.curso || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setServerError('');
      try {
        await updateStudent({ id: student.id, ...values }).unwrap();
        toast.success('Estudiante actualizado');
        onClose?.();
      } catch (error) {
        console.error("Error al actualizar estudiante:", error);
        setServerError('No se pudo actualizar el estudiante. Revisa los datos e inténtalo de nuevo.');
      }
    },
  });

  return (
    <ModalCard
      icon="fa-user-pen"
      title="Editar estudiante"
      subtitle={student ? `${student.nombre} ${student.apellido}` : ''}
      titleId="editar-estudiante-titulo"
    >
      <form onSubmit={formik.handleSubmit} noValidate aria-labelledby="editar-estudiante-titulo">
        <FormAlert message={serverError} />

        <div className="pn-form-grid">
          <Field formik={formik} name="nombre" label="Nombre *" />
          <Field formik={formik} name="apellido" label="Apellido *" />
          <Field formik={formik} name="fecha_nacimiento" label="Fecha de nacimiento *" type="date" />

          <Field formik={formik} name="curso" label="Curso *" as="select" disabled={cargandoCursos}>
            <option value="">{cargandoCursos ? 'Cargando cursos…' : 'Selecciona un curso'}</option>
            {cursos.map((c) => <option key={c.id} value={c.id}>{c.nombre_curso}</option>)}
          </Field>

          <Field formik={formik} name="tipo_documento" label="Tipo de documento *" as="select">
            <option value="RC">Registro civil</option>
            <option value="TI">Tarjeta de identidad</option>
            <option value="PAS">Pasaporte</option>
            <option value="CE">Cédula de extranjería</option>
          </Field>
          <Field formik={formik} name="numero_documento" label="Número de documento *" />

          <Field formik={formik} name="telefono" label="Teléfono del acudiente *" type="tel" inputMode="numeric" />
          <Field formik={formik} name="correo_electronico" label="Correo del acudiente *" type="email" />
          <Field formik={formik} name="direccion" label="Dirección *" span />
        </div>

        <FormFooter
          onCancel={onClose}
          loading={isLoading}
          submitLabel="Guardar cambios"
          loadingLabel="Guardando…"
        />
      </form>
    </ModalCard>
  );
};

export default UpdateStudentForm;
