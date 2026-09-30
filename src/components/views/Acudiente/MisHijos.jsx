// src/components/views/Acudiente/MisHijos.jsx
import React, { useState } from 'react';
import Modal from '../../container/Modal/Modal';
import SelectorHijo from './SelectorHijo';
import ActividadesHijo from './ActividadesHijo';
import EditarEstudianteForm from './EditarEstudianteForm';
import '../Profe/css/Profe.css'; // reutiliza .pf-info, .pf-tabs y las tarjetas de datos del perfil

// Edad en años a partir de la fecha de nacimiento (o null si no se puede calcular)
const calcularEdad = (fecha) => {
  if (!fecha) return null;
  const n = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(n)) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - n.getFullYear();
  if (hoy < new Date(hoy.getFullYear(), n.getMonth(), n.getDate())) edad -= 1;
  return edad;
};

const fechaLarga = (fecha) =>
  fecha ? new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: 'fa-id-card' },
  { id: 'actividades', label: 'Actividades', icon: 'fa-list-check' },
];

/*
  Pantalla principal de la familia: datos del hijo elegido y sus actividades.
  Antes había una tarjeta larga por cada hijo y las pestañas mezcladas; ahora se elige un hijo
  arriba y se ven sus datos o sus actividades por separado.
*/
const MisHijos = ({ hijos, hijo, setHijoId, cargando, error, irABoletin }) => {
  const [tab, setTab] = useState('resumen');
  const [editando, setEditando] = useState(false);

  if (cargando) return <div className="pn-state"><span className="pn-spinner" /><strong>Cargando…</strong></div>;
  if (error) return <div className="pn-state"><i className="fas fa-triangle-exclamation" /><strong>No se pudo cargar la información</strong></div>;
  if (!hijo) {
    return (
      <div className="pn-card pn-state">
        <i className="fas fa-children" />
        <strong>Aún no tienes hijos vinculados</strong>
        <span>Pídele al jardín que asocie a tu hijo con tu cuenta.</span>
      </div>
    );
  }

  const edad = calcularEdad(hijo.fecha_nacimiento);
  const datos = [
    ['fa-id-card', 'Documento', `${hijo.tipo_documento || ''} ${hijo.numero_documento || ''}`.trim()],
    ['fa-cake-candles', 'Nacimiento', fechaLarga(hijo.fecha_nacimiento)],
    ['fa-location-dot', 'Dirección', hijo.direccion],
    ['fa-phone', 'Teléfono de contacto', hijo.telefono],
    ['fa-envelope', 'Correo de contacto', hijo.correo_electronico],
  ];

  return (
    <div className="ac-hijos">
      <SelectorHijo hijos={hijos} hijo={hijo} onChange={setHijoId} />

      {/* Portada del hijo: foto o inicial, nombre, curso y acciones */}
      <section className="pn-card ac-hero">
        <div className="ac-hero-avatar">
          {hijo.foto_url ? <img src={hijo.foto_url} alt={`${hijo.nombre} ${hijo.apellido}`} /> : <span>{(hijo.nombre || '?').charAt(0)}</span>}
        </div>
        <div className="ac-hero-text">
          <h2>{hijo.nombre} {hijo.apellido}</h2>
          <div className="ac-hero-chips">
            <span className="pn-chip is-accent"><i className="fas fa-school" aria-hidden="true"></i>&nbsp;{hijo.curso?.nombre_curso || 'Sin curso'}</span>
            {edad != null && <span className="pn-chip is-teal">{edad} {edad === 1 ? 'año' : 'años'}</span>}
          </div>
        </div>
        <div className="ac-hero-actions">
          <button type="button" className="pn-btn" onClick={irABoletin}>
            <i className="fas fa-file-lines" aria-hidden="true"></i> Ver boletín
          </button>
          <button type="button" className="pn-btn-ghost" onClick={() => setEditando(true)}>
            <i className="fas fa-pen" aria-hidden="true"></i> Editar datos
          </button>
        </div>
      </section>

      <nav className="pf-tabs" role="tablist" aria-label="Secciones">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'is-active' : ''}
            onClick={() => setTab(t.id)}
          >
            <i className={`fas ${t.icon}`} aria-hidden="true"></i> {t.label}
          </button>
        ))}
      </nav>

      <div key={`${hijo.id}-${tab}`} className="pn-fade">
        {tab === 'resumen' && (
          <section className="pn-card pn-panel">
            <div className="pn-panel-head"><h2>Datos de {hijo.nombre}</h2></div>
            <ul className="pf-info ac-info-grid">
              {datos.map(([icono, etiqueta, valor]) => (
                <li className="pf-info-row" key={etiqueta}>
                  <span className="pf-info-ico" aria-hidden="true"><i className={`fas ${icono}`}></i></span>
                  <div><small>{etiqueta}</small><strong>{valor || '—'}</strong></div>
                </li>
              ))}
            </ul>
          </section>
        )}
        {tab === 'actividades' && <ActividadesHijo hijo={hijo} />}
      </div>

      {/* Ventana para editar los datos del hijo */}
      <Modal isOpen={editando} onClose={() => setEditando(false)}>
        <EditarEstudianteForm estudiante={hijo} onClose={() => setEditando(false)} />
      </Modal>
    </div>
  );
};

export default MisHijos;
