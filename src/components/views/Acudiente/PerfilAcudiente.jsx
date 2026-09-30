// src/components/views/Acudiente/PerfilAcudiente.jsx
import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

import {
  useUpdateMyPersonaMutation,
  useUploadPersonaAvatarMutation,
  useDeletePersonaAvatarMutation,
} from '../../../features/people/personApi';
import { setPersona, setCredentials } from '../../../features/user/userSlice';
import { useMisEstudiantesQuery } from '../../../features/students/studentApi';

// Reusa el mismo CSS del perfil del profe para que se vean idénticos
import '../Profe/css/Profile.css';

const PerfilAcudiente = () => {
  const dispatch = useDispatch();

  const persona = useSelector((s) => s.user.persona);
  const user    = useSelector((s) => s.user.user);

  const [editMode, setEditMode] = useState(false);
  const [updateMyPersona, { isLoading }] = useUpdateMyPersonaMutation();

  // Mutations para avatar
  const [uploadAvatar, { isLoading: uploading }]   = useUploadPersonaAvatarMutation();
  const [deleteAvatar, { isLoading: deleting }]    = useDeletePersonaAvatarMutation();
  const fileInputRef = useRef(null);

  // Lista de hijos/as
  const { data: hijos = [], isLoading: loadingHijos } = useMisEstudiantesQuery();

  const initialValues = useMemo(() => ({
    nombre:            persona?.nombre || '',
    apellido:          persona?.apellido || '',
    telefono:          persona?.telefono || '',
    tipo_documento:    persona?.tipo_documento || '',
    numero_documento:  persona?.numero_documento || '',
    direccion:         persona?.direccion || '',
    fecha_nacimiento:  persona?.fecha_nacimiento || '',
    usuario_email:     user?.email || '',
    usuario_password:  '',  // opcional
  }), [persona, user]);

  const validationSchema = Yup.object({
    nombre:           Yup.string().required('Requerido'),
    apellido:         Yup.string().required('Requerido'),
    telefono:         Yup.string().required('Requerido'),
    tipo_documento:   Yup.string().required('Requerido'),
    numero_documento: Yup.string().required('Requerido'),
    direccion:        Yup.string().required('Requerido'),
    fecha_nacimiento: Yup.string().required('Requerido'),
    usuario_email:    Yup.string().email('Email inválido').required('Requerido'),
    usuario_password: Yup.string(), // opcional
  });

  const syncPersona = (updated) => {
    // Actualiza Redux y sessionStorage con la persona retornada por el backend
    dispatch(setPersona(updated));
    sessionStorage.setItem('persona', JSON.stringify(updated));
  };

  const onSubmit = async (values) => {
    const patch = {
      nombre:            values.nombre,
      apellido:          values.apellido,
      telefono:          values.telefono,
      tipo_documento:    values.tipo_documento,
      numero_documento:  values.numero_documento,
      direccion:         values.direccion,
      fecha_nacimiento:  values.fecha_nacimiento,
      usuario: {
        email:    values.usuario_email,
        username: values.usuario_email,
      }
    };
    if (values.usuario_password?.trim()) {
      patch.usuario.password = values.usuario_password.trim();
    }

    try {
      const updated = await updateMyPersona(patch).unwrap();
      syncPersona(updated);

      // Si cambió el email, sincroniza bloque user
      if (values.usuario_email !== user?.email) {
        const newUser = { ...user, email: values.usuario_email, username: values.usuario_email };
        sessionStorage.setItem('user', JSON.stringify(newUser));
        dispatch(setCredentials({
          user: newUser,
          access: localStorage.getItem('access'),
          refresh: localStorage.getItem('refresh'),
        }));
      }

      alert('Perfil actualizado');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el perfil');
    }
  };

  const formik = useFormik({ initialValues, validationSchema, enableReinitialize: true, onSubmit });

  // === Handlers de Avatar ===
  const onPickFile = () => fileInputRef.current?.click();

  const onFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !persona?.id) return;

    // Validación simple de tipo (opcional)
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) {
      alert('Formato no soportado. Sube una imagen (png, jpg, jpeg, webp, gif).');
      e.target.value = '';
      return;
    }

    try {
      const updated = await uploadAvatar({ personaId: persona.id, file }).unwrap();
      // Backend debería retornar la persona actualizada (incluyendo foto_url). Si no, adapta aquí.
      syncPersona(updated);
      alert('Foto actualizada');
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar la foto');
    } finally {
      e.target.value = '';
    }
  };

  const onRemoveAvatar = async () => {
    if (!persona?.id) return;
    if (!confirm('¿Quitar foto de perfil?')) return;

    try {
      const updated = await deleteAvatar(persona.id).unwrap();
      // Igual que arriba, asumimos que retorna persona; si retorna {ok:true}, entonces:
      // syncPersona({ ...persona, foto_url: null });
      syncPersona(updated || { ...persona, foto_url: null });
      alert('Foto eliminada');
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar la foto');
    }
  };

  if (!persona || !user) return <p>Cargando perfil…</p>;

  const avatarUrl = persona?.foto_url || `${import.meta.env.BASE_URL}avatar.svg`;

  return (
    <div className="perfil-wrapper">
      <h2>Perfil</h2>

      {!editMode ? (
        <div className="perfil-read">
          {/* Columna izquierda — Avatar + acciones */}
          <section className="perfil-card">
            <div className="perfil-dl">
              <h3>Foto de perfil</h3>
              <div className="perfil-avatar-lg">
                <img src={avatarUrl} alt="Foto del acudiente" />
              </div>
              <div className="perfil-actions" style={{ gap: 8 }}>
                <button type="button" onClick={onPickFile} disabled={uploading || deleting}>
                  {uploading ? 'Subiendo…' : 'Cambiar foto'}
                </button>
                {persona?.foto_url ? (
                  <button
                    type="button"
                    className="secondary"
                    onClick={onRemoveAvatar}
                    disabled={uploading || deleting}
                  >
                    {deleting ? 'Eliminando…' : 'Quitar foto'}
                  </button>
                ) : null}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onFileSelected}
                />
              </div>
            </div>
          </section>

          {/* Columna central — Datos personales */}
          <section className='perfil-card'>
            <div className="perfil-dl">
              <h3>Datos personales</h3>
              <p><strong>Nombre: </strong>{persona.nombre} {persona.apellido}</p>
              <p><strong>Documento: </strong>{persona.tipo_documento} {persona.numero_documento}</p>
              <p><strong>Teléfono: </strong>{persona.telefono}</p>
              <p><strong>Dirección: </strong>{persona.direccion}</p>
              <p><strong>Nacimiento: </strong>{persona.fecha_nacimiento}</p>
            </div>
          </section>

          {/* Columna derecha — Usuario + Hijos */}
          <section className="perfil-card">
            <div className="perfil-dl">
              <h3>Usuario</h3>
              <p><strong>Email/Usuario: </strong>{user.email}</p>
              <p><strong>Rol: </strong>{user.rol}</p>
              <hr />
              <h3>Mis estudiantes</h3>
              {loadingHijos ? (
                <p>Cargando…</p>
              ) : hijos.length === 0 ? (
                <p>No hay estudiantes vinculados.</p>
              ) : (
                <ul className="dotless">
                  {hijos.map(h => (
                    <li key={h.id}>
                      <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                        <span>
                          {h.nombre} {h.apellido}{' '}
                          <em className="muted">({h.curso?.nombre_curso || '—'})</em>
                        </span>
                        <Link className="link" to={`/acudiente/estudiante/${h.id}`} state={{ estudiante: h }}>
                          Ver actividades
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <div className="perfil-actions">
            <button onClick={() => setEditMode(true)}>Editar</button>
            <a className="link" href="/cambiar-contraseña">Cambiar contraseña</a>
          </div>
        </div>
      ) : (
        <form className="perfil-form" onSubmit={formik.handleSubmit}>
          <h3>Editar Perfil</h3>

          <div className="grid">
            <label>Nombre
              <input name="nombre" value={formik.values.nombre} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
              {formik.touched.nombre && formik.errors.nombre && <span className="error">{formik.errors.nombre}</span>}
            </label>

            <label>Apellido
              <input name="apellido" value={formik.values.apellido} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
              {formik.touched.apellido && formik.errors.apellido && <span className="error">{formik.errors.apellido}</span>}
            </label>

            <label>Tipo de documento
              <input name="tipo_documento" value={formik.values.tipo_documento} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
              {formik.touched.tipo_documento && formik.errors.tipo_documento && <span className="error">{formik.errors.tipo_documento}</span>}
            </label>

            <label>Número de documento
              <input name="numero_documento" value={formik.values.numero_documento} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
              {formik.touched.numero_documento && formik.errors.numero_documento && <span className="error">{formik.errors.numero_documento}</span>}
            </label>

            <label>Teléfono
              <input name="telefono" value={formik.values.telefono} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
              {formik.touched.telefono && formik.errors.telefono && <span className="error">{formik.errors.telefono}</span>}
            </label>

            <label>Dirección
              <input name="direccion" value={formik.values.direccion} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
              {formik.touched.direccion && formik.errors.direccion && <span className="error">{formik.errors.direccion}</span>}
            </label>

            <label>Fecha de nacimiento
              <input type="date" name="fecha_nacimiento" value={formik.values.fecha_nacimiento} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
              {formik.touched.fecha_nacimiento && formik.errors.fecha_nacimiento && <span className="error">{formik.errors.fecha_nacimiento}</span>}
            </label>

            <label>Email
              <input type="email" name="usuario_email" value={formik.values.usuario_email} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
              {formik.touched.usuario_email && formik.errors.usuario_email && <span className="error">{formik.errors.usuario_email}</span>}
            </label>
          </div>

          <div className="perfil-actions">
            <button type="button" className="secondary" onClick={() => setEditMode(false)} disabled={isLoading}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Guardando…' : 'Guardar cambios'}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PerfilAcudiente;
