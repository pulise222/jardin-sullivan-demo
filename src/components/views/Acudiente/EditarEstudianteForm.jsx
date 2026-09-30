import React, { useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useUpdateStudentMutation,
  useUploadStudentAvatarMutation,
  useDeleteStudentAvatarMutation,
} from '../../../features/students/studentApi';

const EditarEstudianteForm = ({ estudiante, onClose, onUpdated }) => {
  const [updateStudent, { isLoading }] = useUpdateStudentMutation();
  const [uploadAvatar, { isLoading: uploading }] = useUploadStudentAvatarMutation();
  const [deleteAvatar, { isLoading: deleting }] = useDeleteStudentAvatarMutation();

  // Si curso viene como objeto, obtener id; si es número, usarlo tal cual
  const cursoId = useMemo(() => {
    if (!estudiante) return '';
    return typeof estudiante.curso === 'object' ? estudiante.curso?.id : estudiante.curso;
  }, [estudiante]);

  // Para previsualizar cambios de foto sin recargar lista
  const [fotoPreview, setFotoPreview] = useState(estudiante?.foto_url || null);
  console.log(estudiante);
  
  const initialValues = useMemo(() => ({
    nombre:           estudiante?.nombre || '',
    apellido:         estudiante?.apellido || '',
    fecha_nacimiento: estudiante?.fecha_nacimiento || '',
    direccion:        estudiante?.direccion || '',
    telefono:         estudiante?.telefono || '',
    correo_electronico: estudiante?.correo_electronico || '',
    tipo_documento:   estudiante?.tipo_documento || '',
    numero_documento: estudiante?.numero_documento || '',
    // mostramos curso solo lectura, pero lo enviaremos para PUT
    curso:            cursoId || '',
  }), [estudiante, cursoId]);

  const validationSchema = Yup.object({
    nombre:           Yup.string().required('Requerido'),
    apellido:         Yup.string().required('Requerido'),
    tipo_documento:   Yup.string().required('Requerido'),
    numero_documento: Yup.string().required('Requerido'),
    telefono:         Yup.string(),
    direccion:        Yup.string(),
    correo_electronico: Yup.string().email('Email inválido'),
    fecha_nacimiento: Yup.string(), // si tu backend requiere, cámbialo a required
    curso:            Yup.number().typeError('Curso inválido'),
  });

  const onSubmit = async (values) => {
    try {
      // IMPORTANTE: tu endpoint usa PUT -> envía todos los campos, incluido curso (id)
      const payload = {
        ...values,
        curso: Number(values.curso) || cursoId, // garantizar número
      };

      await updateStudent({ id: estudiante.id, ...payload }).unwrap();
      onUpdated?.(); // si el padre quiere refetch
      alert('Estudiante actualizado');
      onClose?.();
    } catch (e) {
      console.error(e);
      alert('No se pudo actualizar el estudiante');
    }
  };

  const formik = useFormik({ initialValues, validationSchema, enableReinitialize: true, onSubmit });

  const onAvatarChange = async (file) => {
    if (!file) return;
    try {
      const res = await uploadAvatar({ estudianteId: estudiante.id, file }).unwrap();
      // si tu endpoint del avatar devuelve la entidad completa, usa res.foto_url;
      // si devuelve el estudiante serializado, accede a res.foto_url igual:
      const nueva = res?.foto_url || res?.foto || null;
      if (nueva) setFotoPreview(nueva);
      onUpdated?.();
    } catch (e) {
      console.error(e);
      alert('No se pudo subir la foto');
    }
  };

  const onAvatarDelete = async () => {
    if (!window.confirm('¿Quitar foto de perfil?')) return;
    try {
      await deleteAvatar(estudiante.id).unwrap();
      setFotoPreview(null);
      onUpdated?.();
    } catch (e) {
      console.error(e);
      alert('No se pudo eliminar la foto');
    }
  };

  return (
    <div className="perfil-form" style={{ minWidth: 520 }}>
      <h3>Editar estudiante</h3>

      {/* FOTO */}
      <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:16 }}>
        <div style={{
          width:96, height:96, borderRadius:'50%', overflow:'hidden',
          border:'1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <img
            src={fotoPreview || `${import.meta.env.BASE_URL}avatar.svg`}
            alt="Foto"
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
          />
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <label className="btn-primary" style={{ cursor:'pointer' }}>
            {uploading ? 'Subiendo…' : 'Cambiar foto'}
            <input
              type="file"
              accept="image/*"
              style={{ display:'none' }}
              onChange={(e) => onAvatarChange(e.target.files?.[0])}
              disabled={uploading}
            />
          </label>
          {fotoPreview && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onAvatarDelete}
              disabled={deleting}
            >
              {deleting ? 'Eliminando…' : 'Quitar foto'}
            </button>
          )}
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={formik.handleSubmit}>
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
          </label>

          <label>Correo electrónico
            <input type="email" name="correo_electronico" value={formik.values.correo_electronico} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
            {formik.touched.correo_electronico && formik.errors.correo_electronico && <span className="error">{formik.errors.correo_electronico}</span>}
          </label>

          <label>Dirección
            <input name="direccion" value={formik.values.direccion} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
          </label>

          <label>Fecha de nacimiento
            <input type="date" name="fecha_nacimiento" value={formik.values.fecha_nacimiento} onChange={formik.handleChange} onBlur={formik.handleBlur}/>
          </label>

          <label>Curso (solo lectura)
            <input value={estudiante?.curso?.nombre_curso || estudiante?.curso || ''} readOnly />
          </label>
        </div>

        <div className="perfil-actions" style={{ marginTop: 16 }}>
          <button type="button" className="secondary" onClick={onClose} disabled={isLoading || uploading || deleting}>
            Cancelar
          </button>
          <button type="submit" disabled={isLoading || uploading || deleting}>
            {isLoading ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarEstudianteForm;
