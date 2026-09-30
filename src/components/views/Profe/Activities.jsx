import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

import {
  useGetActividadesPorCursoQuery,
  useCrearActividadEnCursoMutation,
  useActualizarActividadMutation,
  useEliminarActividadMutation,
  useGetMatrizCalificacionesPorCursoQuery,
} from '../../../features/actividades/actividadesApi';

import { toggleFormulario } from '../../../features/actividades/actividadesSlice';

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
  Actividades de UNA materia en UN curso: crear, cambiar la fecha o eliminar.
  Antes cada tarjeta tenía un botón «Ver entregas» con una segunda tabla para calificar;
  como la evaluación ya se hace en la pestaña «Notas» (una sola planilla), ese botón
  duplicaba el trabajo y se quitó. Aquí cada tarjeta solo muestra el avance:
  cuántos niños ya fueron evaluados en esa actividad.
*/
const Activities = () => {
  const dispatch = useDispatch();
  const [confirm, confirmDialog] = useConfirm();

  // Asignación (curso + materia) elegida en «Mis cursos»
  const cpm = useSelector((s) => s.courses?.curso_profesor_materia);
  const cursoId = cpm?.curso?.id;
  const cpmId = cpm?.id;

  const mostrarFormulario = useSelector((s) => s.actividades.mostrarFormulario);

  // cpmId: trae solo las actividades de ESTA materia (antes se mezclaban con las de otras materias)
  const { data: actividades, isLoading } = useGetActividadesPorCursoQuery(
    { cursoId, cpmId },
    { skip: !cursoId }
  );

  // La planilla se usa aquí solo para contar cuántos niños están evaluados por actividad
  const { data: planilla } = useGetMatrizCalificacionesPorCursoQuery(
    { cursoId, cpmId },
    { skip: !cursoId }
  );

  const avance = useMemo(() => {
    const total = planilla?.estudiantes?.length || 0;
    const evaluados = {};
    for (const c of planilla?.celdas || []) {
      if (c.calificacion != null) evaluados[c.actividad_id] = (evaluados[c.actividad_id] || 0) + 1;
    }
    return { total, evaluados };
  }, [planilla]);

  const [crearActividad] = useCrearActividadEnCursoMutation();
  const [actualizarActividad] = useActualizarActividadMutation();
  const [eliminarActividad] = useEliminarActividadMutation();

  // Ventana pequeña para cambiar la fecha de entrega: { actividad } | null
  const [dialogFecha, setDialogFecha] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState('');

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
      toast.success('Actividad creada');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo crear la actividad');
    }
  };

  const abrirFecha = (actividad) => {
    setNuevaFecha(actividad.fecha_entrega ?? '');
    setDialogFecha(actividad);
  };

  const guardarFecha = async () => {
    if (!nuevaFecha) return;
    try {
      await actualizarActividad({ actividadId: dialogFecha.id, data: { fecha_entrega: nuevaFecha } }).unwrap();
      toast.success('Fecha de entrega actualizada');
      setDialogFecha(null);
    } catch (e) {
      console.error(e);
      toast.error('No se pudo actualizar la fecha de entrega');
    }
  };

  const handleEliminar = async (actividad) => {
    const ok = await confirm({
      title: `¿Eliminar «${actividad.titulo}»?`,
      message: 'También se borrarán las evaluaciones de los niños en esta actividad.',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await eliminarActividad(actividad.id).unwrap();
      toast.success('Actividad eliminada');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo eliminar la actividad');
    }
  };

  if (!cpm) return <p className="pn-results-hint">Selecciona un curso para gestionar sus actividades.</p>;

  return (
    <div className="pf-activities">
      <div className="pn-toolbar pf-toolbar">
        <h2>Actividades de {cpm?.materia?.nombre}</h2>
        <div className="pn-toolbar-actions">
          <button type="button" className="pn-btn" onClick={() => dispatch(toggleFormulario(true))}>
            <i className="fas fa-plus" aria-hidden="true"></i> Nueva actividad
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="pn-state"><span className="pn-spinner" /><strong>Cargando actividades…</strong></div>
      ) : (actividades || []).length === 0 ? (
        <div className="pn-card pn-panel">
          <p className="pn-results-hint">Aún no hay actividades. Crea la primera con «Nueva actividad».</p>
        </div>
      ) : (
        <ul className="pf-act-grid">
          {(actividades || []).map((a) => {
            const evaluados = avance.evaluados[a.id] || 0;
            const completo = avance.total > 0 && evaluados === avance.total;
            return (
              <li key={a.id} className="pf-act">
                <h3>{a.titulo}</h3>
                <p>{a.descripcion}</p>
                <div className="pf-act-meta">
                  <span className="pn-chip is-teal"><i className="fas fa-calendar" aria-hidden="true"></i>&nbsp;{a.fecha}</span>
                  {a.fecha_entrega && (
                    <span className="pn-chip is-amber"><i className="fas fa-flag" aria-hidden="true"></i>&nbsp;Entrega {a.fecha_entrega}</span>
                  )}
                </div>

                {/* Avance: niños evaluados / total del curso */}
                <div className="pf-progress" title={`${evaluados} de ${avance.total} evaluados`}>
                  <div className="pf-progress-bar">
                    <span style={{ width: avance.total ? `${(evaluados / avance.total) * 100}%` : 0 }} className={completo ? 'is-full' : ''} />
                  </div>
                  <small>{evaluados} de {avance.total} evaluados</small>
                </div>

                <div className="pn-actions">
                  <button type="button" className="pn-btn-ghost pn-btn-small" onClick={() => abrirFecha(a)}>
                    <i className="fas fa-calendar-pen" aria-hidden="true"></i> Fecha de entrega
                  </button>
                  <button type="button" className="pn-btn-ghost pn-btn-small pf-danger" onClick={() => handleEliminar(a)} aria-label={`Eliminar ${a.titulo}`}>
                    <i className="fas fa-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
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

      {/* Ventana pequeña: cambiar la fecha de entrega */}
      <Modal isOpen={!!dialogFecha} onClose={() => setDialogFecha(null)}>
        {dialogFecha && (
          <ModalCard icon="fa-calendar-pen" title="Fecha de entrega" subtitle={dialogFecha.titulo} titleId="dialogo-fecha-titulo">
            <form onSubmit={(e) => { e.preventDefault(); guardarFecha(); }} aria-labelledby="dialogo-fecha-titulo">
              <div className="pn-form-grid pn-one-col">
                <div className="pn-field">
                  <label htmlFor="nueva-fecha">Nueva fecha</label>
                  <input id="nueva-fecha" type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} autoFocus />
                </div>
              </div>
              <footer className="pn-modal-foot">
                <button type="button" className="pn-btn-ghost" onClick={() => setDialogFecha(null)}>Cancelar</button>
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
