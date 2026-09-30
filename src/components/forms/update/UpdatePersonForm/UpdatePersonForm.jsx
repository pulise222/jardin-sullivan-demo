// src/components/forms/update/UpdatePersonForm/UpdatePersonForm.jsx
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useUpdatePersonMutation } from "../../../../features/people/personApi";
import { ModalCard, Field, FormAlert, FormFooter } from '../../ui/FormKit';

/*
  Formulario para EDITAR una persona.
  NOTA: no se envía el 'usuario' (solo se muestra como información de solo lectura).
*/

const required = "Este campo es obligatorio";

const validationSchema = Yup.object().shape({
  nombre: Yup.string().trim().required(required),
  apellido: Yup.string().trim().required(required),
  telefono: Yup.string().trim().required(required),
  direccion: Yup.string().trim().required(required),
  fecha_nacimiento: Yup.date().typeError('Fecha no válida').required(required),
  tipo_documento: Yup.string().max(20, "Máximo 20 caracteres").required(required),
  numero_documento: Yup.string().max(20, "Máximo 20 caracteres").required(required),
});

const UpdatePersonaForm = ({ person, onClose }) => {
  const [updatePerson, { isLoading }] = useUpdatePersonMutation();
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    enableReinitialize: true, // importante si abres otro registro
    initialValues: {
      nombre: person?.nombre || "",
      apellido: person?.apellido || "",
      telefono: person?.telefono || "",
      direccion: person?.direccion || "",
      fecha_nacimiento: person?.fecha_nacimiento || "",
      tipo_documento: person?.tipo_documento || "CC",
      numero_documento: person?.numero_documento || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setServerError('');
      try {
        // Enviamos solo campos editables (PATCH)
        await updatePerson({ id: person.id, ...values }).unwrap();
        toast.success('Persona actualizada');
        onClose?.();
      } catch (error) {
        console.error("Error al actualizar persona:", error);
        const detalle = error?.data ? Object.values(error.data).flat().join(' ') : '';
        setServerError(detalle || 'No se pudo actualizar la persona.');
      }
    },
  });

  return (
    <ModalCard
      icon="fa-user-pen"
      title="Editar persona"
      subtitle={person ? `${person.nombre} ${person.apellido}` : ''}
      titleId="editar-persona-titulo"
    >
      <form onSubmit={formik.handleSubmit} noValidate aria-labelledby="editar-persona-titulo">
        <FormAlert message={serverError} />

        {/* Datos del usuario: solo lectura */}
        <div className="pn-readonly">
          <div>
            <span>Usuario</span>
            <strong>{person?.usuario?.username ?? '—'}</strong>
          </div>
          <div>
            <span>Correo</span>
            <strong>{person?.usuario?.email ?? '—'}</strong>
          </div>
          <div>
            <span>Rol</span>
            <strong>{person?.usuario?.rol ?? '—'}</strong>
          </div>
        </div>

        <div className="pn-form-grid">
          <Field formik={formik} name="nombre" label="Nombre *" />
          <Field formik={formik} name="apellido" label="Apellido *" />
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
          submitLabel="Guardar cambios"
          loadingLabel="Guardando…"
        />
      </form>
    </ModalCard>
  );
};

export default UpdatePersonaForm;
