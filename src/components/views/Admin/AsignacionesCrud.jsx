// src/components/views/Admin/AsignacionesCrud.jsx
import React, { useState } from 'react';
import AsignacionesForm from '../../container/AsignacionesForm/AsignacionesForm';
import AsignacionesTable from '../../container/AsignacionesTable/AsignacionesTable';

/* Pantalla de Asignaciones: formulario a la izquierda y tabla a la derecha (dos columnas). */
const AsignacionesCrud = () => {
  const [editing, setEditing] = useState(null);

  return (
    <div className="pn-split pn-split-form-first">
      <AsignacionesForm
        editing={editing}
        onSaved={() => setEditing(null)}   // tras crear o editar, se limpia
        onCancel={() => setEditing(null)}
      />
      <AsignacionesTable onEdit={setEditing} editingId={editing?.id} />
    </div>
  );
};

export default AsignacionesCrud;
