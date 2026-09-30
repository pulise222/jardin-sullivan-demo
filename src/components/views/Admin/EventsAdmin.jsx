// src/components/views/Admin/EventsAdmin.jsx
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetEventosQuery,
  useCreateEventoMutation,
  useUpdateEventoMutation,
  useDeleteEventoMutation
} from '../../../features/eventos/eventosApi';
import Modal from '../../container/Modal/Modal';
import useConfirm from '../../../hooks/useConfirm';
import { ModalCard, FormFooter } from '../../forms/ui/FormKit';

/*
  Gestión de eventos: tarjetas con imagen y fecha. "Nuevo evento" y "Editar" abren una
  ventana emergente con el formulario. La lógica de datos (RTK Query, conversión de fechas
  y subida de imagen) es la original; cambió el diseño y los avisos.
*/

function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  // datetime-local → YYYY-MM-DDTHH:mm (sin zona)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalToISO(localValue) {
  // Toma el valor de <input type="datetime-local"> (naive) y lo convierte a ISO UTC
  if (!localValue) return null;
  return new Date(localValue).toISOString(); // DRF recibe UTC ISO 8601
}
// Fecha legible: "12 oct 2026, 9:00 a. m."
function formatFecha(iso) {
  if (!iso) return 'Sin fecha';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

const EMPTY = { titulo: '', descripcion: '', fecha_inicio_local: '', file: null };

const EventsAdmin = () => {
  const { data = [], isLoading, isError } = useGetEventosQuery();
  const eventos = useMemo(() => data || [], [data]);

  const [createEvento, { isLoading: creating }] = useCreateEventoMutation();
  const [updateEvento, { isLoading: updating }] = useUpdateEventoMutation();
  const [deleteEvento] = useDeleteEventoMutation();
  const [confirm, confirmDialog] = useConfirm();

  const [open, setOpen] = useState(false);     // ¿ventana del formulario abierta?
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null); // evento en edición o null

  const closeForm = () => { setOpen(false); setEditing(null); setForm(EMPTY); setPreview(null); };

  const startCreate = () => { setEditing(null); setForm(EMPTY); setPreview(null); setOpen(true); };

  const startEdit = (ev) => {
    setEditing(ev);
    setForm({
      titulo: ev.titulo ?? '',
      descripcion: ev.descripcion ?? '',
      fecha_inicio_local: toLocalInputValue(ev.fecha_inicio),
      file: null, // solo si el admin sube uno nuevo
    });
    setPreview(ev.imagen_url || null);
    setOpen(true);
  };

  const onPickFile = (file) => {
    setForm((f) => ({ ...f, file }));
    setPreview(file ? URL.createObjectURL(file) : (editing?.imagen_url || null));
  };

  const submit = async (e) => {
    e.preventDefault();
    const fecha_inicio_iso = fromLocalToISO(form.fecha_inicio_local);
    const base = { titulo: form.titulo, descripcion: form.descripcion, fecha_inicio_iso, file: form.file || undefined };
    try {
      if (editing) {
        await updateEvento({ id_evento: editing.id_evento ?? editing.id, ...base }).unwrap();
        toast.success('Evento actualizado');
      } else {
        await createEvento(base).unwrap();
        toast.success('Evento creado');
      }
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo guardar el evento');
    }
  };

  const remove = async (ev) => {
    const ok = await confirm({
      title: `¿Eliminar “${ev.titulo}”?`,
      message: 'Dejará de verse para profesores y acudientes. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteEvento(ev.id_evento ?? ev.id).unwrap();
      toast.success('Evento eliminado');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo eliminar el evento');
    }
  };

  return (
    <div>
      <div className="pn-toolbar">
        <p className="pn-toolbar-note">
          <i className="fas fa-circle-info" aria-hidden="true"></i>
          {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'} publicados
        </p>
        <button type="button" className="pn-btn" onClick={startCreate}>
          <i className="fas fa-plus" aria-hidden="true"></i> Nuevo evento
        </button>
      </div>

      {isLoading ? (
        <div className="pn-card pn-state" role="status">
          <span className="pn-spinner" aria-hidden="true"></span>
          <strong>Cargando eventos…</strong>
        </div>
      ) : isError ? (
        <div className="pn-card pn-state" role="alert">
          <i className="fas fa-triangle-exclamation" aria-hidden="true"></i>
          <strong>No pudimos cargar los eventos</strong>
        </div>
      ) : eventos.length === 0 ? (
        <div className="pn-card pn-state">
          <i className="fas fa-calendar-days" aria-hidden="true"></i>
          <strong>Aún no hay eventos</strong>
          <span>Crea el primero con el botón “Nuevo evento”.</span>
        </div>
      ) : (
        <ul className="pn-cards">
          {eventos.map((ev, i) => (
            <li key={ev.id_evento ?? ev.id} className="pn-event">
              <div className={`pn-event-media t${i % 4}`}>
                {ev.imagen_url ? (
                  <img src={ev.imagen_url} alt="" loading="lazy" />
                ) : (
                  <i className="fas fa-image" aria-hidden="true"></i>
                )}
              </div>
              <div className="pn-event-body">
                <span className="pn-chip is-accent">
                  <i className="fas fa-clock" aria-hidden="true"></i>&nbsp;{formatFecha(ev.fecha_inicio)}
                </span>
                <h3>{ev.titulo}</h3>
                <p>{ev.descripcion || 'Sin descripción.'}</p>
                <div className="pn-actions">
                  <button type="button" className="pn-icon-btn is-edit" onClick={() => startEdit(ev)}
                    aria-label={`Editar ${ev.titulo}`} title="Editar">
                    <i className="fas fa-pen" aria-hidden="true"></i>
                  </button>
                  <button type="button" className="pn-icon-btn is-danger" onClick={() => remove(ev)}
                    aria-label={`Eliminar ${ev.titulo}`} title="Eliminar">
                    <i className="fas fa-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ===== Ventana del formulario ===== */}
      <Modal isOpen={open} onClose={closeForm}>
        <ModalCard
          icon="fa-calendar-plus"
          title={editing ? 'Editar evento' : 'Nuevo evento'}
          subtitle="Lo verán profesores y acudientes en su panel."
          titleId="evento-titulo"
        >
          <form onSubmit={submit} aria-labelledby="evento-titulo">
            <div className="pn-form-grid">
              <div className="pn-field pn-span-2">
                <label htmlFor="ev-titulo">Título *</label>
                <input id="ev-titulo" type="text" required value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
              </div>

              <div className="pn-field pn-span-2">
                <label htmlFor="ev-fecha">Fecha y hora de inicio *</label>
                <input id="ev-fecha" type="datetime-local" required value={form.fecha_inicio_local}
                  onChange={(e) => setForm((f) => ({ ...f, fecha_inicio_local: e.target.value }))} />
              </div>

              <div className="pn-field pn-span-2">
                <label htmlFor="ev-desc">Descripción</label>
                <textarea id="ev-desc" rows={4} value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
              </div>

              <div className="pn-field pn-span-2">
                <label htmlFor="ev-img">Imagen (JPG o PNG)</label>
                <label className="pn-drop" htmlFor="ev-img">
                  {preview ? (
                    <img src={preview} alt="Vista previa de la imagen del evento" />
                  ) : (
                    <>
                      <i className="fas fa-cloud-arrow-up" aria-hidden="true"></i>
                      <span>Haz clic para elegir una imagen</span>
                    </>
                  )}
                  <input id="ev-img" type="file" accept="image/*"
                    onChange={(e) => onPickFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            <FormFooter
              onCancel={closeForm}
              loading={creating || updating}
              submitLabel={editing ? 'Guardar cambios' : 'Crear evento'}
              loadingLabel="Guardando…"
            />
          </form>
        </ModalCard>
      </Modal>
      {confirmDialog}
    </div>
  );
};

export default EventsAdmin;
