import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../container/Modal/Modal';
import EditarEstudianteForm from './EditarEstudianteForm';

const EstudianteCard = ({ estudiante, onUpdated, onVerActividades }) => {
  const navigate = useNavigate();
  const [openEdit, setOpenEdit] = useState(false);

  const {
    nombre,
    apellido,
    tipo_documento,
    numero_documento,
    telefono,
    direccion,
    correo_electronico,
    curso,
    foto_url,
    fecha_nacimiento,
  } = estudiante || {};

  return (
    <div className="acu-card est-card">
      <div className="est-left">
        <div className="est-avatar">
          <img src={foto_url || `${import.meta.env.BASE_URL}avatar.svg`} alt={`${nombre} ${apellido}`} />
        </div>
        <div>
          <h3 className="est-nombre">{`${nombre ?? ''} ${apellido ?? ''}`.trim()}</h3>
          <span className="est-curso">Curso: {curso?.nombre_curso ?? curso ?? '—'}</span>
        </div>
      </div>

      <div className="est-info">
        <div><strong>Documento:</strong> {tipo_documento ?? '—'} {numero_documento ?? ''}</div>
        <div><strong>Edad:</strong> {fecha_nacimiento ?? '—'}</div>
        <div><strong>Dirección:</strong> {direccion ?? '—'}</div>
        <div><strong>Teléfono:</strong> {telefono ?? '—'}</div>
        <div><strong>Correo:</strong> {correo_electronico ?? '—'}</div>
      </div>

      <aside className="est-actions">
        <h4>Editar Perfil Estudiante</h4>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setOpenEdit(true)}
        >
          Editar Perfil
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => onVerActividades(estudiante)}
          style={{ marginTop: 8 }}
        >
          Ver actividades
        </button>
      </aside>

      {/* Modal con el formulario */}
      <Modal isOpen={openEdit} onClose={() => setOpenEdit(false)}>
        <EditarEstudianteForm
          estudiante={estudiante}
          onClose={() => setOpenEdit(false)}
          onUpdated={onUpdated}  // opcional: el padre puede hacer refetch de "mis estudiantes"
        />
      </Modal>
    </div>
  );
};

export default EstudianteCard;
