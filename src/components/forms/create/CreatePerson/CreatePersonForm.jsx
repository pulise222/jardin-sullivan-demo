// src/components/forms/create/CreatePerson/CreatePersonForm.jsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useCreatePersonMutation } from '../../../../features/people/personApi';
import { ModalCard, Field, FormAlert, FormFooter } from '../../ui/FormKit';

/*
  Formulario para CREAR una persona (profesor, acudiente o administrador).
  Crea a la vez la persona y su usuario de acceso (el correo se usa también como nombre de usuario).
  La lógica es la original; cambia el diseño, el tipo de documento pasa a ser una lista
  y los avisos dejan de ser alert().
*/

const required = "Este campo es obligatorio";

const validationSchema = Yup.object().shape({
  nombre: Yup.string().trim().required(required),
  apellido: Yup.string().trim().required(required),
  telefono: Yup.string().trim().required(required),
  tipo_documento: Yup.string().required(required),
  numero_documento: Yup.string().trim().required(required),
  direccion: Yup.string().trim().required(required),
  fecha_nacimiento: Yup.date().typeError('Fecha no válida').required(required),
  email: Yup.string().email("Correo inválido").required(required),
  rol: Yup.string().required(required),
});

const CreatePersonForm = ({ onClose }) => {
  const [params] = useSearchParams();
  const preRol = params.get('new') === 'acudiente' ? 'Acudiente' : '';
  const [createPerson, { isLoading }] = useCreatePersonMutation();
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      tipo_documento: 'CC',
      numero_documento: '',
      direccion: '',
      fecha_nacimiento: '',
      email: '',
      rol: preRol,
    },
    validationSchema,
    onSubmit: async (values) => {
      setServerError('');
      try {
        // Preparamos el payload para que el backend reciba la persona y los datos de usuario anidados
        const payload = {
          nombre: values.nombre,
          apellido: values.apellido,
          telefono: values.telefono,
          tipo_documento: values.tipo_documento,
          numero_documento: values.numero_documento,
          direccion: values.direccion,
          fecha_nacimiento: values.fecha_nacimiento,
          usuario: {
            username: values.email, // usamos el mismo correo como nombre de usuario
            email: values.email,
            rol: values.rol,
          },
        };
        await createPerson(payload).unwrap();
        toast.success('Persona creada');
        onClose?.();
      } catch (error) {
        console.error(error);
        const detalle = error?.data ? Object.values(error.data).flat().join(' ') : '';
        setServerError(detalle || 'No se pudo crear la persona. Revisa los datos e inténtalo de nuevo.');
      }
    },
  });

  return (
    <ModalCard
      icon="fa-user-plus"
      title="Nueva persona"
      subtitle="Se creará también su usuario de acceso al sistema."
      titleId="crear-persona-titulo"
    >
      <form onSubmit={formik.handleSubmit} noValidate aria-labelledby="crear-persona-titulo">
        <FormAlert message={serverError} />

        <div className="pn-form-grid">
          <Field formik={formik} name="nombre" label="Nombre *" />
          <Field formik={formik} name="apellido" label="Apellido *" />

          <Field formik={formik} name="rol" label="Rol en el sistema *" as="select">
            <option value="" disabled>Selecciona un rol</option>
            <option value="Acudiente">Acudiente</option>
            <option value="Profesor">Profesor</option>
            <option value="Administrador">Administrador</option>
          </Field>
          <Field formik={formik} name="email" label="Correo electrónico *" type="email" hint="También será su nombre de usuario." />

          <Field formik={formik} name="tipo_documento" label="Tipo de documento *" as="select">
            <option value="CC">Cédula de ciudadanía</option>
            <option value="CE">Cédula de extranjería</option>
            <option value="TI">Tarjeta de identidad</option>
            <option value="PAS">Pasaporte</option>
          </Field>
          <Field formik={formik} name="numero_documento" label="Número de documento *" />

          <Field formik={formik} name="telefono" label="Teléfono *" type="tel" inputMode="numeric" />
          <Field formik={formik} name="fecha_nacimiento" label="Fecha de nacimiento *" type="date" />
          <Field formik={formik} name="direccion" label="Dirección *" span />
        </div>

        <FormFooter
          onCancel={onClose}
          loading={isLoading}
          submitLabel="Crear persona"
          loadingLabel="Creando…"
        />
      </form>
    </ModalCard>
  );
};

export default CreatePersonForm;
