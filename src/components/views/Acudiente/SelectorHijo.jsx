// src/components/views/Acudiente/SelectorHijo.jsx
import React from 'react';

/*
  Fila de "pastillas" para elegir de quién se está viendo la información.
  Si la familia solo tiene un hijo no se muestra nada (no hay nada que elegir).
  Se usa en «Mis hijos» y en «Boletín».
*/
const SelectorHijo = ({ hijos, hijo, onChange }) => {
  if (hijos.length < 2) return null;

  return (
    <div className="ac-selector ac-noprint" role="tablist" aria-label="Elegir hijo">
      {hijos.map((h) => (
        <button
          key={h.id}
          type="button"
          role="tab"
          aria-selected={hijo?.id === h.id}
          className={hijo?.id === h.id ? 'is-active' : ''}
          onClick={() => onChange(h.id)}
        >
          <span className="ac-mini-avatar" aria-hidden="true">
            {h.foto_url ? <img src={h.foto_url} alt="" /> : (h.nombre || '?').charAt(0)}
          </span>
          <span>
            <strong>{h.nombre}</strong>
            <small>{h.curso?.nombre_curso || 'Sin curso'}</small>
          </span>
        </button>
      ))}
    </div>
  );
};

export default SelectorHijo;
