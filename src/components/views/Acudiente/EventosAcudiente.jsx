// src/components/views/Acudiente/EventosAcudiente.jsx
import React from 'react';
import { useGetEventosProximosQuery } from '../../../features/acudiente/acudienteApi';

const EventosAcudiente = () => {
  const { data: eventos = [], isLoading, isError } = useGetEventosProximosQuery();

  if (isLoading) return <p>Cargando eventos…</p>;
  if (isError) return <p>Error cargando eventos.</p>;

  return (
    <section>
      <h2 className="acu-title">Próximos eventos</h2>
      {eventos.length === 0 ? (
        <p>No hay eventos próximos.</p>
      ) : (
        <ul className="events-list">
          {eventos.map((ev) => (
            <li key={ev.id_evento} className="event-item">
              <div>
                <strong>{ev.titulo}</strong>
                <div className="muted">{new Date(ev.fecha_inicio).toLocaleString()}</div>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => alert(`${ev.titulo}\n\n${ev.descripcion ?? ''}`)}
              >
                Ver detalle
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default EventosAcudiente;
