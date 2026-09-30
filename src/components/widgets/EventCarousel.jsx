import React, { useMemo, useState } from 'react';
import { useGetEventosProximosQuery } from '../../features/eventos/eventosApi';
import Modal from '../container/Modal/Modal';
import { ModalCard } from '../forms/ui/FormKit';
import '../views/Profe/css/Profe.css';

/*
  Próximos eventos como tarjetas (mismo estilo que los eventos del administrador).
  Al pulsar una tarjeta se abre una ventana con el detalle.
  Se mantiene el nombre del archivo por compatibilidad, aunque ya no es un carrusel.
*/
// Fecha ISO -> "17 nov 2026"
const fmt = (f) => { const d = new Date(f); return Number.isNaN(d) ? f : d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }); };

const EventCarousel = ({ limit = 10 }) => {
  const { data = [], isLoading, isError } = useGetEventosProximosQuery({ limit });
  const list = useMemo(() => data || [], [data]);
  const [openIdx, setOpenIdx] = useState(null);

  if (isLoading) return <div className="pn-state"><span className="pn-spinner" /><strong>Cargando eventos…</strong></div>;
  if (isError) return <div className="pn-state"><i className="fas fa-triangle-exclamation" /><strong>No se pudieron cargar los eventos</strong></div>;
  if (list.length === 0) return <div className="pn-state"><i className="fas fa-calendar-xmark" /><strong>No hay eventos próximos</strong></div>;

  const abierto = openIdx !== null ? list[openIdx] : null;

  return (
    <>
      <ul className="pn-cards">
        {list.map((ev, idx) => (
          <li key={ev.id_evento ?? ev.id ?? idx} className="pn-event">
            <div className={`pn-event-media t${idx % 4}`}>
              {ev.imagen_url ? <img src={ev.imagen_url} alt={ev.titulo} /> : <i className="fas fa-calendar-days" aria-hidden="true"></i>}
            </div>
            <div className="pn-event-body">
              <span className="pn-chip is-accent">{fmt(ev.fecha_inicio)}</span>
              <h3>{ev.titulo}</h3>
              <p>{ev.descripcion || 'Sin descripción'}</p>
              <button type="button" className="pn-btn-ghost" onClick={() => setOpenIdx(idx)}>Ver detalle</button>
            </div>
          </li>
        ))}
      </ul>

      <Modal isOpen={!!abierto} onClose={() => setOpenIdx(null)}>
        {abierto && (
          <ModalCard icon="fa-calendar-days" title={abierto.titulo} subtitle={fmt(abierto.fecha_inicio)} titleId="evento-detalle-titulo">
            {abierto.imagen_url && <img className="pf-event-img" src={abierto.imagen_url} alt={abierto.titulo} />}
            <p className="pf-event-desc">{abierto.descripcion || 'Sin descripción'}</p>
            <footer className="pn-modal-foot">
              <button type="button" className="pn-btn" onClick={() => setOpenIdx(null)}>Cerrar</button>
            </footer>
          </ModalCard>
        )}
      </Modal>
    </>
  );
};

export default EventCarousel;
