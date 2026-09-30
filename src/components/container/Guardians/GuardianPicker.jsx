// src/components/container/Guardians/GuardianPicker.jsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLazySearchPeopleQuery } from '../../../features/people/personApi';
import { useAddGuardianToStudentMutation } from '../../../features/students/studentApi';
import useConfirm from '../../../hooks/useConfirm';
import { ModalCard } from '../../forms/ui/FormKit';

/*
  Buscador de acudientes (dentro de una ventana emergente).
  Se escribe una cédula o un nombre (mínimo 2 letras), aparecen las coincidencias y se elige una.
  La lógica es la original (búsqueda con "debounce" de 300 ms); cambió el diseño.
*/
const GuardianPicker = ({ student, onAssigned, onClose }) => {
  const studentId = student.id;
  const [q, setQ] = useState('');
  const [trigger, { data: results = [], isFetching }] = useLazySearchPeopleQuery();
  const [addGuardian, { isLoading }] = useAddGuardianToStudentMutation();
  const [confirm, confirmDialog] = useConfirm();

  // Búsqueda con "debounce": espera 300 ms sin escribir antes de preguntar al servidor
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length >= 2) trigger(q.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [q, trigger]);

  const handleAssign = async (persona) => {
    const ok = await confirm({
      title: 'Asignar acudiente',
      message: `¿Asignar a ${persona.nombre} ${persona.apellido} como acudiente de ${student.nombre}?`,
      confirmLabel: 'Sí, asignar',
      icon: 'fa-user-check',
    });
    if (!ok) return;
    try {
      await addGuardian({ studentId, persona_id: persona.id }).unwrap();
      toast.success('Acudiente asignado');
      onAssigned?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      toast.error('No se pudo asignar el acudiente');
    }
  };

  const escribio = q.trim().length >= 2;

  return (
    <>
      <ModalCard
        icon="fa-user-group"
        title="Asignar acudiente"
        subtitle={`Estudiante: ${student.nombre} ${student.apellido}`}
        titleId="asignar-acudiente-titulo"
      >
        <label className="pn-search pn-search-block">
          <i className="fas fa-search" aria-hidden="true"></i>
          <input
            type="search"
            placeholder="Busca por cédula o nombre…"
            aria-label="Buscar acudiente por cédula o nombre"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
        </label>

        <div className="pn-results" aria-live="polite">
          {!escribio && <p className="pn-results-hint">Escribe al menos 2 caracteres para buscar.</p>}
          {escribio && isFetching && <p className="pn-results-hint">Buscando…</p>}
          {escribio && !isFetching && results.length === 0 && (
            <p className="pn-results-hint">No encontramos a nadie con “{q.trim()}”.</p>
          )}
          {escribio && !isFetching && results.map((p) => (
            <div key={p.id} className="pn-result">
              <span className="pn-mini-avatar" aria-hidden="true">{(p.nombre || '?').charAt(0)}</span>
              <div>
                <strong>{p.nombre} {p.apellido}</strong>
                <small>{p.numero_documento}</small>
              </div>
              <button
                type="button"
                className="pn-btn is-small"
                onClick={() => handleAssign(p)}
                disabled={isLoading}
              >
                Asignar
              </button>
            </div>
          ))}
        </div>

        <footer className="pn-modal-foot">
          <button type="button" className="pn-btn-ghost" onClick={onClose}>Cerrar</button>
        </footer>
      </ModalCard>
      {confirmDialog}
    </>
  );
};

export default GuardianPicker;
