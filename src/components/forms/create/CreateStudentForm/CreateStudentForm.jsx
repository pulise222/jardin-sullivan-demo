// src/components/forms/create/CreateStudentForm/CreateStudentForm.jsx
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateStudentMutation } from '../../../../features/students/studentApi';
import { useGetCoursesQuery } from '../../../../features/cursos/cursosApi';
// Los estilos de formulario (pn-modal, pn-field, pn-form-grid…) están en src/styles/panel.css

/*
  Formulario para crear un estudiante. Se muestra dentro de una ventana emergente (Modal),
  así el administrador no sale de la lista.

  Formik maneja los valores, la validación y el envío; Yup define las reglas.
  La lógica de datos es la misma de antes; cambió el diseño y dos detalles:
    - "Curso" ahora es una lista con los nombres de los cursos (antes había que escribir un ID)
    - los errores del servidor salen dentro del formulario (antes era un alert)
*/

const required = "Este campo es obligatorio";

const validationSchema = Yup.object({
  nombre: Yup.string().trim().required(required),
  apellido: Yup.string().trim().required(required),
  fecha_nacimiento: Yup.string().required(required),
  direccion: Yup.string().trim().required(required),
  telefono: Yup.string().matches(/^\d{7,15}$/, 'Solo dígitos (7 a 15)').required(required),
  correo_electronico: Yup.string().email('Correo inválido').required(required),
  tipo_documento: Yup.string().oneOf(['RC', 'TI', 'PAS', 'CE']).required(required),
  numero_documento: Yup.string()
    .matches(/^[A-Za-z0-9\-.]{4,30}$/, '4 a 30 caracteres (letras, números, - y .)')
    .required(required),
  curso_id: Yup.number().typeError('Selecciona un curso').required(required),
});

const initialValues = {
  nombre: '',
  apellido: '',
  fecha_nacimiento: '',
  direccion: '',
  telefono: '',
  correo_electronico: '',
  tipo_documento: 'RC', // por defecto Registro Civil
  numero_documento: '',
  curso_id: '',
};

const CreateStudentForm = ({ onClose }) => {
  const [createStudent, { isLoading }] = useCreateStudentMutation();
  const { data: cursos = [], isLoading: cargandoCursos } = useGetCoursesQuery(); // para la lista de cursos
  const [serverError, setServerError] = useState('');

  const onSubmit = async (values, { resetForm }) => {
    setServerError('');
    try {
      const payload = { ...values, curso: Number(values.curso_id) };
      delete payload.curso_id;

      await createStudent(payload).unwrap();
      resetForm();
      onClose?.();
    } catch (error) {
      console.error(error);
      setServerError('No se pudo crear el estudiante. Revisa los datos e inténtalo de nuevo.');
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, handleBlur, errors, touched, values } = formik;

  // Atributos comunes de cada campo: valor, eventos y accesibilidad. Evita repetir lo mismo 9 veces.
  const field = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': errors[name] && touched[name] ? 'true' : 'false',
    'aria-describedby': errors[name] && touched[name] ? `${name}-error` : undefined,
  });

  // Mensaje de error debajo del campo (solo después de que el usuario lo tocó)
  const Err = ({ name }) =>
    errors[name] && touched[name] ? (
      <p className="pn-field-error" id={`${name}-error`} role="alert">{errors[name]}</p>
    ) : null;

  return (
    <div className="pn-modal" role="document">
      <header className="pn-modal-head">
        <span className="pn-modal-ico" aria-hidden="true"><i className="fas fa-child"></i></span>
        <div>
          <h2 id="crear-estudiante-titulo">Nuevo estudiante</h2>
          <p>Completa los datos para registrarlo en el jardín.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate aria-labelledby="crear-estudiante-titulo">
        {serverError && (
          <div className="pn-form-alert" role="alert">
            <i className="fas fa-circle-exclamation" aria-hidden="true"></i>
            {serverError}
          </div>
        )}

        <div className="pn-form-grid">
          <div className="pn-field">
            <label htmlFor="nombre">Nombre *</label>
            <input type="text" autoComplete="off" {...field('nombre')} />
            <Err name="nombre" />
          </div>

          <div className="pn-field">
            <label htmlFor="apellido">Apellido *</label>
            <input type="text" autoComplete="off" {...field('apellido')} />
            <Err name="apellido" />
          </div>

          <div className="pn-field">
            <label htmlFor="fecha_nacimiento">Fecha de nacimiento *</label>
            <input type="date" {...field('fecha_nacimiento')} />
            <Err name="fecha_nacimiento" />
          </div>

          <div className="pn-field">
            <label htmlFor="curso_id">Curso *</label>
            <select {...field('curso_id')} disabled={cargandoCursos}>
              <option value="">{cargandoCursos ? 'Cargando cursos…' : 'Selecciona un curso'}</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre_curso}</option>
              ))}
            </select>
            <Err name="curso_id" />
          </div>

          <div className="pn-field">
            <label htmlFor="tipo_documento">Tipo de documento *</label>
            <select {...field('tipo_documento')}>
              <option value="RC">Registro civil</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="PAS">Pasaporte</option>
              <option value="CE">Cédula de extranjería</option>
            </select>
            <Err name="tipo_documento" />
          </div>

          <div className="pn-field">
            <label htmlFor="numero_documento">Número de documento *</label>
            <input type="text" autoComplete="off" {...field('numero_documento')} />
            <Err name="numero_documento" />
          </div>

          <div className="pn-field">
            <label htmlFor="telefono">Teléfono del acudiente *</label>
            <input type="tel" inputMode="numeric" autoComplete="off" {...field('telefono')} />
            <Err name="telefono" />
          </div>

          <div className="pn-field">
            <label htmlFor="correo_electronico">Correo del acudiente *</label>
            <input type="email" autoComplete="off" {...field('correo_electronico')} />
            <Err name="correo_electronico" />
          </div>

          <div className="pn-field pn-span-2">
            <label htmlFor="direccion">Dirección *</label>
            <input type="text" autoComplete="off" {...field('direccion')} />
            <Err name="direccion" />
          </div>
        </div>

        <footer className="pn-modal-foot">
          <button type="button" className="pn-btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="pn-btn" disabled={isLoading}>
            {isLoading ? (
              <><span className="pn-spinner-sm" aria-hidden="true"></span>Creando…</>
            ) : (
              <><i className="fas fa-check" aria-hidden="true"></i>Crear estudiante</>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default CreateStudentForm;
