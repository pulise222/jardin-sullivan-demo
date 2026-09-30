import React, { useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  useUpdateStudentMutation,
  useUploadStudentAvatarMutation,
  useDeleteStudentAvatarMutation,
} from '../../../features/students/studentApi';
import { ModalCard, Field, FormAlert, FormFooter } from '../../forms/ui/FormKit';
import useConfirm from '../../../hooks/useConfirm';

/*
  Ventana para que la familia edite los datos de su hijo (y cambie su foto).
  La lógica de datos es la original (PUT del estudiante + subir/quitar foto);
  cambió el diseño: usa las mismas piezas (FormKit) que los formularios del administrador.
*/
const EditarEstudianteForm = ({ estudiante, onClose }) => {
  const [updateStudent, { isLoading }] = useUpdateStudentMutation();
  const [uploadAvatar, { isLoading: subiendo }] = useUploadStudentAvatarMutation();
  const [deleteAvatar, { isLoading: quitando }] = useDeleteStudentAvatarMutation();
  const [confirm, confirmDialog] = useConfirm();
  const [serverError, setServerError] = useState('');

  // El curso puede llegar como objeto {id, nombre_curso} o como número; el PUT necesita el id
  const cursoId = useMemo(() => {
    if (!estudiante) return '';
    return typeof estudiante.curso === 'object' ? estudiante.curso?.id : estudiante.curso;
  }, [estudiante]);

  // Foto que se ve en la ventana (se actualiza al instante sin esperar a recargar la lista)
  const [foto, setFoto] = useState(estudiante?.foto_url || null);

  const initialValues = useMemo(() => ({
    nombre: estudiante?.nombre || '',
    apellido: estudiante?.apellido || '',
    fecha_nacimiento: estudiante?.fecha_nacimiento || '',
    direccion: estudiante?.direccion || '',
    telefono: estudiante?.telefono || '',
    correo_electronico: estudiante?.correo_electronico || '',
    tipo_documento: estudiante?.tipo_documento || '',
    numero_documento: estudiante?.numero_documento || '',
  }), [estudiante]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      nombre: Yup.string().trim().required('Requerido'),
      apellido: Yup.string().trim().required('Requerido'),
      tipo_documento: Yup.string().required('Requerido'),
      numero_documento: Yup.string().trim().required('Requerido'),
      correo_electronico: Yup.string().email('Correo inválido'),
    }),
    onSubmit: async (values) => {
      setServerError('');
      try {
        // El endpoint usa PUT: hay que enviar todos los campos, incluido el curso (solo lectura aquí)
        await updateStudent({ id: estudiante.id, ...values, curso: Number(cursoId) || cursoId }).unwrap();
        toast.success('Datos actualizados');
        onClose?.();
      } catch (e) {
        console.error(e);
        setServerError('No se pudieron guardar los cambios. Revisa los datos e inténtalo de nuevo.');
      }
    },
  });

  const cambiarFoto = async (file) => {
    if (!file) return;
    try {
      const res = await uploadAvatar({ estudianteId: estudiante.id, file }).unwrap();
      setFoto(res?.foto_url || res?.foto || null);
      toast.success('Foto actualizada');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo subir la foto');
    }
  };

  const quitarFoto = async () => {
    const ok = await confirm({ title: '¿Quitar la foto?', message: 'Se mostrará la inicial de su nombre en su lugar.', confirmLabel: 'Quitar', danger: true });
    if (!ok) return;
    try {
      await deleteAvatar(estudiante.id).unwrap();
      setFoto(null);
      toast.success('Foto eliminada');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo eliminar la foto');
    }
  };

  return (
    <ModalCard icon="fa-user-pen" title="Editar datos" subtitle={`${estudiante?.nombre ?? ''} ${estudiante?.apellido ?? ''}`} titleId="editar-hijo-titulo">
      {/* Foto */}
      <div className="ac-edit-foto">
        <div className="ac-hero-avatar ac-hero-avatar-sm">
          {foto ? <img src={foto} alt="Foto" /> : <span>{(estudiante?.nombre || '?').charAt(0)}</span>}
        </div>
        <div className="pn-actions">
          <label className="pn-btn-ghost pn-btn-small ac-upload">
            <i className="fas fa-camera" aria-hidden="true"></i> {subiendo ? 'Subiendo…' : 'Cambiar foto'}
            <input type="file" accept="image/*" hidden disabled={subiendo} onChange={(e) => { cambiarFoto(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          {foto && (
            <button type="button" className="pn-btn-ghost pn-btn-small pf-danger" onClick={quitarFoto} disabled={quitando}>
              <i className="fas fa-trash" aria-hidden="true"></i> Quitar
            </button>
          )}
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate aria-labelledby="editar-hijo-titulo">
        <FormAlert message={serverError} />
        <div className="pn-form-grid">
          <Field formik={formik} name="nombre" label="Nombre *" />
          <Field formik={formik} name="apellido" label="Apellido *" />
          <Field formik={formik} name="tipo_documento" label="Tipo de documento *" as="select">
            <option value="">Selecciona</option>
            <option value="RC">Registro civil</option>
            <option value="TI">Tarjeta de identidad</option>
            <option value="PAS">Pasaporte</option>
            <option value="CE">Cédula de extranjería</option>
          </Field>
          <Field formik={formik} name="numero_documento" label="Número de documento *" />
          <Field formik={formik} name="fecha_nacimiento" label="Fecha de nacimiento" type="date" />
          <Field formik={formik} name="telefono" label="Teléfono de contacto" type="tel" />
          <Field formik={formik} name="correo_electronico" label="Correo de contacto" type="email" span />
          <Field formik={formik} name="direccion" label="Dirección" span />
        </div>
        <p className="pn-field-hint">El curso lo asigna el jardín: {estudiante?.curso?.nombre_curso || 'sin asignar'}.</p>

        <FormFooter onCancel={onClose} loading={isLoading} submitLabel="Guardar cambios" loadingLabel="Guardando…" />
      </form>
      {confirmDialog}
    </ModalCard>
  );
};

export default EditarEstudianteForm;
