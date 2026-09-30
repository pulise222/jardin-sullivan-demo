// src/components/container/Guardians/AcudienteCell.jsx
import React, { useState } from 'react';
import { useGetStudentGuardiansQuery } from '../../../features/students/studentApi';
import GuardianPicker from './GuardianPicker';
import Modal from '../Modal/Modal';

/*
  Celda "Acudiente" de la tabla de estudiantes.
    - Si el estudiante ya tiene acudiente: muestra su nombre y documento, y un botón para cambiarlo.
    - Si no tiene: muestra un botón "Asignar acudiente".
  El buscador de acudientes se abre en una ventana emergente (Modal), ya no dentro de la celda.
*/
const AcudienteCell = ({ student }) => {
  const { id: studentId } = student;
  // Los estudiantes "temporales" (id negativo, mientras el servidor responde) no tienen acudientes que pedir
  const { data: guardians = [], refetch, isFetching } = useGetStudentGuardiansQuery(studentId, { skip: studentId < 0 });
  const [openPicker, setOpenPicker] = useState(false);

  if (isFetching) return <span className="pn-muted">Cargando…</span>;

  const g = guardians[0]; // se muestra el primero

  return (
    <>
      {g ? (
        <div className="pn-guardian">
          <span className="pn-mini-avatar" aria-hidden="true">{(g.nombre || '?').charAt(0)}</span>
          <div>
            <strong>{g.nombre} {g.apellido}</strong>
            <small>{g.numero_documento}</small>
          </div>
          <button
            type="button"
            className="pn-icon-btn is-small"
            onClick={() => setOpenPicker(true)}
            title="Cambiar acudiente"
            aria-label={`Cambiar el acudiente de ${student.nombre}`}
          >
            <i className="fas fa-repeat" aria-hidden="true"></i>
          </button>
        </div>
      ) : (
        <button type="button" className="pn-link-btn" onClick={() => setOpenPicker(true)}>
          <i className="fas fa-user-plus" aria-hidden="true"></i> Asignar acudiente
        </button>
      )}

      <Modal isOpen={openPicker} onClose={() => setOpenPicker(false)}>
        <GuardianPicker
          student={student}
          onAssigned={() => refetch()}
          onClose={() => setOpenPicker(false)}
        />
      </Modal>
    </>
  );
};

export default AcudienteCell;
