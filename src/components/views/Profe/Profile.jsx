// src/components/views/Profe/Perfil.jsx
import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useUpdateMyPersonaMutation,
  useUploadPersonaAvatarMutation,
  useDeletePersonaAvatarMutation,
  useLazyGetMyPersonaQuery,
} from '../../../features/people/personApi';
import { setPersona, setCredentials } from '../../../features/user/userSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import './css/Profe.css';

const Profile = () => {
  const dispatch = useDispatch();
  const persona = useSelector((s) => s.user.persona);
  
  const user = useSelector((s) => s.user.user);

  const [editMode, setEditMode] = useState(false);
  const [updateMyPersona, { isLoading }] = useUpdateMyPersonaMutation();

  // --- NUEVO: avatar ---
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadPersonaAvatarMutation();
  const [deleteAvatar, { isLoading: deletingAvatar }] = useDeletePersonaAvatarMutation();
  const [triggerGetMyPersona] = useLazyGetMyPersonaQuery();
  const fileInputRef = useRef(null);

  const avatarUrl =
    persona?.foto_url ||   'https://randomuser.me/api/portraits/men/1.jpg' ;

  const handlePickAvatar = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !persona?.id) return;
    try {
      await uploadAvatar({ personaId: persona.id, file }).unwrap();
      const fresh = await triggerGetMyPersona().unwrap();
      dispatch(setPersona(fresh));
      sessionStorage.setItem('persona', JSON.stringify(fresh));
    } catch (err) {
      console.error(err);
      toast.error('No se pudo subir la foto');
    } finally {
      // permite volver a seleccionar el mismo archivo
      e.target.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (!persona?.id) return;
    if (!confirm('¿Quitar foto de perfil?')) return;
    try {
      await deleteAvatar(persona.id).unwrap();
      const fresh = await triggerGetMyPersona().unwrap();
      dispatch(setPersona(fresh));
      sessionStorage.setItem('persona', JSON.stringify(fresh));
    } catch (err) {
      console.error(err);
      toast.error('No se pudo eliminar la foto');
    }
  };
  // --- fin avatar ---

  // Valores iniciales del form
  const initialValues = useMemo(
    () => ({
      nombre: persona?.nombre || '',
      apellido: persona?.apellido || '',
      telefono: persona?.telefono || '',
      tipo_documento: persona?.tipo_documento || '',
      numero_documento: persona?.numero_documento || '',
      direccion: persona?.direccion || '',
      fecha_nacimiento: persona?.fecha_nacimiento || '',
      usuario_email: user?.email || '',
      usuario_password: '', // opcional
    }),
    [persona, user]
  );

  const validationSchema = Yup.object({
    nombre: Yup.string().required('Requerido'),
    apellido: Yup.string().required('Requerido'),
    telefono: Yup.string().required('Requerido'),
    tipo_documento: Yup.string().required('Requerido'),
    numero_documento: Yup.string().required('Requerido'),
    direccion: Yup.string().required('Requerido'),
    fecha_nacimiento: Yup.string().required('Requerido'),
    usuario_email: Yup.string().email('Email inválido').required('Requerido'),
    usuario_password: Yup.string(), // opcional
  });

  const onSubmit = async (values) => {
    const patch = {
      nombre: values.nombre,
      apellido: values.apellido,
      telefono: values.telefono,
      tipo_documento: values.tipo_documento,
      numero_documento: values.numero_documento,
      direccion: values.direccion,
      fecha_nacimiento: values.fecha_nacimiento,
      usuario: {
        email: values.usuario_email,
        username: values.usuario_email,
      },
    };
    if (values.usuario_password?.trim()) {
      patch.usuario.password = values.usuario_password.trim();
    }

    try {
      const updated = await updateMyPersona(patch).unwrap();

      dispatch(setPersona(updated));
      sessionStorage.setItem('persona', JSON.stringify(updated));

      if (values.usuario_email !== user?.email) {
        const newUser = { ...user, email: values.usuario_email, username: values.usuario_email };
        sessionStorage.setItem('user', JSON.stringify(newUser));
        dispatch(
          setCredentials({
            user: newUser,
            access: localStorage.getItem('access'),
            refresh: localStorage.getItem('refresh'),
          })
        );
      }

      toast.success('Perfil actualizado');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo actualizar el perfil');
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit,
  });

  if (!persona || !user) {
    return <div className="pn-state"><span className="pn-spinner" /><strong>Cargando perfil…</strong></div>;
  }

  // Campo de texto conectado a Formik: evita repetir 8 bloques casi iguales
  const campo = (name, label, type = 'text') => (
    <div className="pn-field" key={name}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        aria-invalid={formik.touched[name] && formik.errors[name] ? 'true' : 'false'}
      />
      {formik.touched[name] && formik.errors[name] && (
        <p className="pn-field-error" role="alert">{formik.errors[name]}</p>
      )}
    </div>
  );

  // Dato de solo lectura (etiqueta pequeña + valor)
  const dato = (label, value) => (
    <div className="pf-dato">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  );

  return (
    <div className="pf-profile">
      {/* Tarjeta de cabecera: foto + nombre + botón para cambiarla */}
      <section className="pn-card pf-profile-head">
        <div className="pf-photo">
          <img src={avatarUrl || `${import.meta.env.BASE_URL}avatar.svg`} alt="Foto de perfil" />
        </div>
        <div className="pf-profile-name">
          <h2>{persona.nombre} {persona.apellido}</h2>
          <span className="pn-chip is-accent">Profesor</span>
        </div>
        <button type="button" className="pn-btn-ghost" onClick={handlePickAvatar} disabled={uploadingAvatar || deletingAvatar}>
          <i className="fas fa-camera" aria-hidden="true"></i> {uploadingAvatar ? 'Subiendo…' : 'Cambiar foto'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
      </section>

      {!editMode ? (
        <>
          <div className="pn-split">
            <section className="pn-card pn-panel">
              <div className="pn-panel-head"><h2>Datos personales</h2></div>
              <div className="pf-datos">
                {dato('Documento', `${persona.tipo_documento || ''} ${persona.numero_documento || ''}`.trim())}
                {dato('Teléfono', persona.telefono)}
                {dato('Dirección', persona.direccion)}
                {dato('Nacimiento', persona.fecha_nacimiento)}
              </div>
            </section>
            <section className="pn-card pn-panel">
              <div className="pn-panel-head"><h2>Cuenta</h2></div>
              <div className="pf-datos">
                {dato('Correo / usuario', user.email)}
                {dato('Rol', user.rol)}
              </div>
            </section>
          </div>
          <div className="pn-form-actions">
            <a className="pn-btn-ghost" href="/cambiar-contraseña">
              <i className="fas fa-key" aria-hidden="true"></i> Cambiar contraseña
            </a>
            <button type="button" className="pn-btn" onClick={() => setEditMode(true)}>
              <i className="fas fa-pen" aria-hidden="true"></i> Editar perfil
            </button>
          </div>
        </>
      ) : (
        <form className="pn-card pn-panel" onSubmit={formik.handleSubmit} noValidate>
          <div className="pn-panel-head"><h2>Editar perfil</h2></div>
          <div className="pn-form-grid">
            {campo('nombre', 'Nombre')}
            {campo('apellido', 'Apellido')}
            {campo('tipo_documento', 'Tipo de documento')}
            {campo('numero_documento', 'Número de documento')}
            {campo('telefono', 'Teléfono')}
            {campo('direccion', 'Dirección')}
            {campo('fecha_nacimiento', 'Fecha de nacimiento', 'date')}
            {campo('usuario_email', 'Correo', 'email')}
          </div>
          <div className="pn-form-actions">
            <button type="button" className="pn-btn-ghost" onClick={() => setEditMode(false)} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="pn-btn" disabled={isLoading}>
              <i className="fas fa-check" aria-hidden="true"></i> {isLoading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
