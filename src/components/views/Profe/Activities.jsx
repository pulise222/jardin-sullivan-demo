import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

import {
  useGetActividadesPorCursoQuery,
  useCrearActividadEnCursoMutation,
  useGetEntregasByActividadQuery,
  useActualizarEntregaMutation,
  useActualizarActividadMutation,
  useEliminarActividadMutation,
} from '../../../features/actividades/actividadesApi';

import {
  setActividadSeleccionada,
  toggleFormulario,
} from '../../../features/actividades/actividadesSlice';

import Modal from '../../container/Modal/Modal';
import { ModalCard } from '../../forms/ui/FormKit';
import useConfirm from '../../../hooks/useConfirm';
import './css/Profe.css';

const schemaActividad = Yup.object({
  titulo: Yup.string().required('Requerido'),
  descripcion: Yup.string().required('Requerido'),
  fecha: Yup.date().required('Requerido'),
  fecha_entrega: Yup.date().nullable(true),
});

/*
  Actividades del curso. La lógica de datos (RTK Query + Redux + Formik) es la original;
  lo que cambió: el diseño, y que los cuadros feos del navegador (alert / prompt / confirm)
  ahora son avisos (toast), ventanas del panel y el diálogo useConfirm.
*/
const Activities = () => {
  const dispatch = useDispatch();
  const [confirm, confirmDialog] = useConfirm();

  // CPM del curso+materia seleccionado
  const cpm = useSelector((s) =>
    s.clase?.claseEnCurso?.dictada_por ?? s.courses?.curso_profesor_materia
  );
  const cursoId = cpm?.curso?.id;
  const cpmId = cpm?.id;

  const mostrarFormulario = useSelector((s) => s.actividades.mostrarFormulario);
  const actividadSeleccionada = useSelector((s) => s.actividades.actividadSeleccionada);
  const actividadId = actividadSeleccionada?.id || null;

  const { data: actividades, isLoading, refetch } = useGetActividadesPorCursoQuery(
    { cursoId, todas: 0 },
    { skip: !cursoId }
  );

  // Filtro de entregas: 'entregadas' | 'pendientes' | 'todas'
  const [detalleFiltro, setDetalleFiltro] = useState('entregadas');

  const {
    data: entregas,
    isLoading: loadingEntregas,
    refetch: refetchEntregas,
  } = useGetEntregasByActividadQuery(
    { actividadId, estado: detalleFiltro },
    { skip: !actividadId }
  );

  const [crearActividad] = useCrearActividadEnCursoMutation();
  const [actualizarEntrega] = useActualizarEntregaMutation();
  const [actualizarActividad] = useActualizarActividadMutation();
  const [eliminarActividad] = useEliminarActividadMutation();

  // Ventana pequeña para pedir un dato: { tipo: 'fecha' | 'nota', ae?: entrega }
  const [dialog, setDialog] = useState(null);
  const [valorDialog, setValorDialog] = useState('');

  const hoyISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleCrearActividad = async (values, { resetForm }) => {
    if (!cursoId || !cpmId) {
      toast.error('No hay un curso seleccionado.');
      return;
    }
    try {
      await crearActividad({ cursoId, payload: { ...values, cpm_id: cpmId } }).unwrap();
      resetForm();
      dispatch(toggleFormulario(false));
      refetch();
      toast.success('Actividad creada');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo crear la actividad');
    }
  };

  const handleVerDetalle = (actividad) => {
    dispatch(setActividadSeleccionada(actividad));
    setDetalleFiltro('entregadas');
  };

  // Abre la ventana para cambiar la fecha de entrega
  const abrirFecha = () => {
    setValorDialog(actividadSeleccionada?.fecha_entrega ?? '');
    setDialog({ tipo: 'fecha' });
  };

  // Abre la ventana para calificar (solo si ya fue entregada)
  const abrirNota = (ae) => {
    if (!ae.entregado_en) {
      toast.error('Primero marca la actividad como entregada.');
      return;
    }
    setValorDialog(ae.calificacion ?? '');
    setDialog({ tipo: 'nota', ae });
  };

  const cerrarDialog = () => setDialog(null);

  const guardarFecha = async () => {
    if (!valorDialog) return;
    try {
      const updated = await actualizarActividad({
        actividadId,
        data: { fecha_entrega: valorDialog },
      }).unwrap();
      dispatch(setActividadSeleccionada({ ...actividadSeleccionada, ...updated }));
      refetch();
      toast.success('Fecha de entrega actualizada');
      cerrarDialog();
    } catch (e) {
      console.error(e);
      toast.error('No se pudo actualizar la fecha de entrega');
    }
  };

  const guardarNota = async () => {
    const nota = Number(valorDialog);
    if (valorDialog === '' || Number.isNaN(nota) || nota < 0 || nota > 5) {
      toast.error('La nota debe estar entre 0 y 5.');
      return;
    }
    try {
      await actualizarEntrega({
        actividadEstudianteId: dialog.ae.id,
        actividadId,
        data: { calificacion: nota },
      }).unwrap();
      refetchEntregas();
      toast.success('Nota guardada');
      cerrarDialog();
    } catch (e) {
      console.error(e);
      toast.error('No se pudo calificar');
    }
  };

  const handleEliminarActividad = async () => {
    if (!actividadId) return;
    const ok = await confirm({
      title: '¿Eliminar esta actividad?',
      message: 'También se borrarán las entregas y notas asociadas.',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await eliminarActividad(actividadId).unwrap();
      dispatch(setActividadSeleccionada(null));
      refetch();
      toast.success('Actividad eliminada');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo eliminar la actividad');
    }
  };

  const marcarEntregada = async (ae) => {
    try {
      await actualizarEntrega({
        actividadEstudianteId: ae.id,
        actividadId,
        data: { entregado_en: new Date().toISOString() },
      }).unwrap();
      refetchEntregas();
      toast.success('Marcada como entregada');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo marcar como entregada');
    }
  };

  const abrirEntregable = (ae) => {
    if (!ae.entregable_url) {
      toast.error('Este estudiante no tiene entregable adjunto.');
      return;
    }
    window.open(ae.entregable_url, '_blank', 'noopener,noreferrer');
  };

  if (!cpm) return <p className="pn-results-hint">Selecciona un curso para gestionar sus actividades.</p>;

  return (
    <div className="pf-activities">
      <div className="pn-toolbar pf-toolbar">
        <h2>Actividades del curso</h2>
        <div className="pn-toolbar-actions">
          <button type="button" className="pn-btn" onClick={() => dispatch(toggleFormulario(true))}>
            <i className="fas fa-plus" aria-hidden="true"></i> Nueva actividad
          </button>
        </div>
      </div>

      {/* Lista de actividades */}
      {isLoading ? (
        <div className="pn-state"><span className="pn-spinner" /><strong>Cargando actividades…</strong></div>
      ) : (actividades || []).length === 0 ? (
        <div className="pn-card pn-panel">
          <p className="pn-results-hint">Aún no hay actividades. Crea la primera con «Nueva actividad».</p>
        </div>
      ) : (
        <ul className="pf-act-grid">
          {(actividades || []).map((a) => (
            <li
              key={a.id}
              className={`pf-act ${actividadId === a.id ? 'is-selected' : ''}`}
            >
              <h3>{a.titulo}</h3>
              <p>{a.descripcion}</p>
              <div className="pf-act-meta">
                <span className="pn-chip is-teal"><i className="fas fa-calendar" aria-hidden="true"></i>&nbsp;{a.fecha}</span>
                {a.fecha_entrega && (
                  <span className="pn-chip is-amber"><i className="fas fa-flag" aria-hidden="true"></i>&nbsp;Entrega {a.fecha_entrega}</span>
                )}
              </div>
              <button type="button" className="pn-btn-ghost" onClick={() => handleVerDetalle(a)}>
                Ver entregas <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Detalle de entregas de la actividad elegida */}
      {actividadId && (
        <section className="pn-card pn-panel pf-entregas">
          <div className="pn-panel-head">
            <h2>Entregas · {actividadSeleccionada?.titulo}</h2>
            <div className="pn-actions">
              <button type="button" className="pn-btn-ghost" onClick={abrirFecha}>
                <i className="fas fa-calendar-pen" aria-hidden="true"></i> Cambiar entrega
              </button>
              <button type="button" className="pn-btn-ghost pf-danger" onClick={handleEliminarActividad}>
                <i className="fas fa-trash" aria-hidden="true"></i> Eliminar
              </button>
            </div>
          </div>

          <div className="pf-tabs pf-tabs-sm" role="tablist" aria-label="Filtrar entregas">
            {[['entregadas', 'Entregadas'], ['pendientes', 'Pendientes'], ['todas', 'Todas']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={detalleFiltro === id}
                className={detalleFiltro === id ? 'is-active' : ''}
                onClick={() => setDetalleFiltro(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {loadingEntregas ? (
            <div className="pn-state"><span className="pn-spinner" /></div>
          ) : (
            <div className="pn-table-wrap">
              <table className="pn-table pf-grid">
                <thead>
                  <tr><th>Estudiante</th><th>Entregado</th><th>Nota</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {(entregas || []).map((ae) => (
                    <tr key={ae.id}>
                      <td><strong>{ae.estudiante_nombre}</strong></td>
                      <td>
                        {ae.entregado_en
                          ? new Date(ae.entregado_en).toLocaleString()
                          : <span className="pn-chip is-amber">Pendiente</span>}
                      </td>
                      <td>{ae.calificacion != null ? <span className="pn-chip is-accent">{ae.calificacion}</span> : '—'}</td>
                      <td>
                        <div className="pn-actions">
                          <button
                            type="button" className="pn-btn-ghost pn-btn-small"
                            onClick={() => abrirEntregable(ae)} disabled={!ae.entregable_url}
                            title={ae.entregable_url ? 'Abrir entregable' : 'Sin adjunto'}
                          >
                            Entregable
                          </button>
                          {!ae.entregado_en && (
                            <button type="button" className="pn-btn-ghost pn-btn-small" onClick={() => marcarEntregada(ae)}>
                              Marcar entregada
                            </button>
                          )}
                          <button
                            type="button" className="pn-btn pn-btn-small"
                            onClick={() => abrirNota(ae)} disabled={!ae.entregado_en}
                            title={!ae.entregado_en ? 'Primero marca como entregada' : 'Calificar'}
                          >
                            Calificar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(entregas || []).length === 0 && (
                    <tr><td colSpan={4} className="pn-results-hint">No hay entregas para este filtro.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Ventana: nueva actividad */}
      <Modal isOpen={!!mostrarFormulario} onClose={() => dispatch(toggleFormulario(false))}>
        <ModalCard icon="fa-list-check" title="Nueva actividad" subtitle={cpm?.materia?.nombre} titleId="nueva-actividad-titulo">
          <Formik
            initialValues={{ titulo: '', descripcion: '', fecha: hoyISO, fecha_entrega: '' }}
            validationSchema={schemaActividad}
            onSubmit={handleCrearActividad}
          >
            {({ isSubmitting }) => (
              <Form noValidate aria-labelledby="nueva-actividad-titulo">
                <div className="pn-form-grid">
                  <div className="pn-field pn-span-2">
                    <label htmlFor="titulo">Título *</label>
                    <Field id="titulo" name="titulo" autoComplete="off" />
                    <ErrorMessage name="titulo" component="p" className="pn-field-error" />
                  </div>
                  <div className="pn-field">
                    <label htmlFor="fecha">Fecha *</label>
                    <Field id="fecha" type="date" name="fecha" />
                    <ErrorMessage name="fecha" component="p" className="pn-field-error" />
                  </div>
                  <div className="pn-field">
                    <label htmlFor="fecha_entrega">Fecha de entrega</label>
                    <Field id="fecha_entrega" type="date" name="fecha_entrega" />
                    <ErrorMessage name="fecha_entrega" component="p" className="pn-field-error" />
                  </div>
                  <div className="pn-field pn-span-2">
                    <label htmlFor="descripcion">Descripción *</label>
                    <Field id="descripcion" as="textarea" name="descripcion" rows={4} />
                    <ErrorMessage name="descripcion" component="p" className="pn-field-error" />
                  </div>
                </div>
                <footer className="pn-modal-foot">
                  <button type="button" className="pn-btn-ghost" onClick={() => dispatch(toggleFormulario(false))}>Cancelar</button>
                  <button type="submit" className="pn-btn" disabled={isSubmitting}>
                    <i className="fas fa-check" aria-hidden="true"></i>{isSubmitting ? 'Creando…' : 'Crear actividad'}
                  </button>
                </footer>
              </Form>
            )}
          </Formik>
        </ModalCard>
      </Modal>

      {/* Ventana pequeña: cambiar fecha de entrega o poner nota */}
      <Modal isOpen={!!dialog} onClose={cerrarDialog}>
        {dialog && (
          <ModalCard
            icon={dialog.tipo === 'fecha' ? 'fa-calendar-pen' : 'fa-star'}
            title={dialog.tipo === 'fecha' ? 'Fecha de entrega' : 'Calificar entrega'}
            subtitle={dialog.tipo === 'fecha' ? actividadSeleccionada?.titulo : dialog.ae.estudiante_nombre}
            titleId="dialogo-titulo"
          >
            <form
              onSubmit={(e) => { e.preventDefault(); (dialog.tipo === 'fecha' ? guardarFecha : guardarNota)(); }}
              aria-labelledby="dialogo-titulo"
            >
              <div className="pn-form-grid pn-one-col">
                <div className="pn-field">
                  <label htmlFor="valor-dialogo">{dialog.tipo === 'fecha' ? 'Nueva fecha' : 'Nota (0 a 5)'}</label>
                  {dialog.tipo === 'fecha' ? (
                    <input id="valor-dialogo" type="date" value={valorDialog} onChange={(e) => setValorDialog(e.target.value)} autoFocus />
                  ) : (
                    <input id="valor-dialogo" type="number" min="0" max="5" step="0.1" value={valorDialog} onChange={(e) => setValorDialog(e.target.value)} autoFocus />
                  )}
                </div>
              </div>
              <footer className="pn-modal-foot">
                <button type="button" className="pn-btn-ghost" onClick={cerrarDialog}>Cancelar</button>
                <button type="submit" className="pn-btn"><i className="fas fa-check" aria-hidden="true"></i>Guardar</button>
              </footer>
            </form>
          </ModalCard>
        )}
      </Modal>

      {confirmDialog}
    </div>
  );
};

export default Activities;
