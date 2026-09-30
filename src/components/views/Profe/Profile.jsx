// src/components/views/Profe/Perfil.jsx
import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  useUpdateMyPersonaMutation,
  useUploadPersonaAvatarMutation,
  useDeletePersonaAvatarMutation,
  useLazyGetMyPersonaQuery,
} from '../../../features/people/personApi';
import { setPersona, setCredentials } from '../../../features/user/userSlice';
import { useGetCourseByTeacherQuery } from '../../../features/cursos/cursosApi';
import { useMisEstudiantesQuery } from '../../../features/students/studentApi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import './css/Profe.css';

const Profile = () => {
  const dispatch = useDispatch();
  const persona = useSelector((s) => s.user.persona);
  
  const user = useSelector((s) => s.user.user);
  // Asignaciones del profesor (curso + materia): ya las pidió Profe.jsx, así que vienen de la caché
  // Este perfil lo usan el profesor y el acudiente: según el rol cambia el resumen de arriba
  const esAcudiente = user?.rol === 'Acudiente';
  const { data: asignaciones = [] } = useGetCourseByTeacherQuery(persona?.id, { skip: !persona?.id || esAcudiente });
  const { data: hijos = [] } = useMisEstudiantesQuery(undefined, { skip: !esAcudiente });

  const [editMode, setEditMode] = useState(false);
  const [updateMyPersona, { isLoading }] = useUpdateMyPersonaMutation();

  // --- NUEVO: avatar ---
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadPersonaAvatarMutation();
  const [deleteAvatar, { isLoading: deletingAvatar }] = useDeletePersonaAvatarMutation();
  const [triggerGetMyPersona] = useLazyGetMyPersonaQuery();
  const fileInputRef = useRef(null);

  // Sin foto guardada mostramos la inicial (antes había una foto de stock de internet como respaldo)
  const avatarUrl = persona?.foto_url || null;

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

  // Fila de datos: ícono + etiqueta pequeña + valor
  const dato = (icono, etiqueta, valor) => (
    <li className="pf-info-row" key={etiqueta}>
      <span className="pf-info-ico" aria-hidden="true"><i className={`fas ${icono}`}></i></span>
      <div>
        <small>{etiqueta}</small>
        <strong>{valor || '—'}</strong>
      </div>
    </li>
  );

  // Edad a partir de la fecha de nacimiento (solo para mostrarla junto a la fecha)
  const edad = (() => {
    if (!persona.fecha_nacimiento) return null;
    const n = new Date(persona.fecha_nacimiento);
    if (Number.isNaN(n)) return null;
    const hoy = new Date();
    let a = hoy.getFullYear() - n.getFullYear();
    if (hoy < new Date(hoy.getFullYear(), n.getMonth(), n.getDate())) a -= 1;
    return a;
  })();
  const nacimiento = persona.fecha_nacimiento
    ? `${new Date(persona.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}${edad != null ? ` · ${edad} años` : ''}`
    : null;

  // Resumen de lo que dicta (sale de la consulta de cursos que ya hace Profe.jsx: está en caché)
  const totalCursos = new Set(asignaciones.map((c) => c.curso?.id)).size;
  const totalMaterias = new Set(asignaciones.map((c) => c.materia?.id)).size;

  return (
    <div className="pf-profile">
      {/* Portada: franja de color, foto que sobresale y acciones principales */}
      <section className="pn-card pf-cover">
        <div className="pf-cover-bg" aria-hidden="true" />
        <div className="pf-cover-body">
          <div className="pf-photo-wrap">
            <div className="pf-photo">
              {avatarUrl
                ? <img src={avatarUrl} alt="Foto de perfil" />
                : <span className="pf-photo-initial" aria-hidden="true">{(persona.nombre || "?").charAt(0)}</span>}
            </div>
            <button
              type="button"
              className="pf-photo-btn"
              onClick={handlePickAvatar}
              disabled={uploadingAvatar || deletingAvatar}
              aria-label="Cambiar foto de perfil"
              title="Cambiar foto"
            >
              <i className={`fas ${uploadingAvatar ? 'fa-spinner fa-spin' : 'fa-camera'}`} aria-hidden="true"></i>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </div>

          <div className="pf-profile-name">
            <h2>{persona.nombre} {persona.apellido}</h2>
            <p><i className="fas fa-envelope" aria-hidden="true"></i> {user.email}</p>
            <span className="pn-chip is-accent">{user.rol}</span>
          </div>

          {!editMode && (
            <div className="pf-cover-actions">
              <button type="button" className="pn-btn" onClick={() => setEditMode(true)}>
                <i className="fas fa-pen" aria-hidden="true"></i> Editar perfil
              </button>
              {/* Link (no <a href>): navega sin recargar toda la página */}
              <Link className="pn-btn-ghost" to="/cambiar-contraseña">
                <i className="fas fa-key" aria-hidden="true"></i> Cambiar contraseña
              </Link>
            </div>
          )}
        </div>
      </section>

      {!editMode ? (
        <>
          {/* Resumen rápido */}
          <section className="pf-stats" aria-label="Resumen">
            {esAcudiente ? (
              <>
                <div className="pf-stat"><strong>{hijos.length}</strong><span>Hijos en el jardín</span></div>
                <div className="pf-stat"><strong>{new Set(hijos.map((h) => h.curso?.id).filter(Boolean)).size}</strong><span>Cursos</span></div>
              </>
            ) : (
              <>
                <div className="pf-stat"><strong>{totalCursos}</strong><span>Cursos a cargo</span></div>
                <div className="pf-stat"><strong>{totalMaterias}</strong><span>Materias</span></div>
                <div className="pf-stat"><strong>{asignaciones.length}</strong><span>Clases asignadas</span></div>
              </>
            )}
          </section>

          <div className="pn-split">
            <section className="pn-card pn-panel">
              <div className="pn-panel-head"><h2>Datos personales</h2></div>
              <ul className="pf-info">
                {dato('fa-id-card', 'Documento', `${persona.tipo_documento || ''} ${persona.numero_documento || ''}`.trim())}
                {dato('fa-phone', 'Teléfono', persona.telefono)}
                {dato('fa-location-dot', 'Dirección', persona.direccion)}
                {dato('fa-cake-candles', 'Nacimiento', nacimiento)}
              </ul>
            </section>

            <section className="pn-card pn-panel">
              <div className="pn-panel-head"><h2>Cuenta</h2></div>
              <ul className="pf-info">
                {dato('fa-envelope', 'Correo / usuario', user.email)}
                {dato('fa-user-shield', 'Rol', user.rol)}
                {dato('fa-lock', 'Contraseña', '••••••••')}
              </ul>
            </section>
          </div>
        </>
      ) : (
        <form className="pn-card pn-panel" onSubmit={formik.handleSubmit} noValidate>
          <div className="pn-panel-head"><h2>Editar perfil</h2></div>

          <h3 className="pf-form-sec">Datos personales</h3>
          <div className="pn-form-grid">
            {campo('nombre', 'Nombre')}
            {campo('apellido', 'Apellido')}
            {campo('tipo_documento', 'Tipo de documento')}
            {campo('numero_documento', 'Número de documento')}
            {campo('telefono', 'Teléfono')}
            {campo('fecha_nacimiento', 'Fecha de nacimiento', 'date')}
            <div className="pn-span-2">{campo('direccion', 'Dirección')}</div>
          </div>

          <h3 className="pf-form-sec">Acceso</h3>
          <div className="pn-form-grid">
            <div className="pn-span-2">{campo('usuario_email', 'Correo', 'email')}</div>
          </div>

          <div className="pn-form-actions">
            <button type="button" className="pn-btn-ghost" onClick={() => { formik.resetForm(); setEditMode(false); }} disabled={isLoading}>
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
