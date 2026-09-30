import { api } from '../api/apiSlicer';

/*
  Arma la parte "?a=1&b=2" de la URL con los filtros que entiende el backend:
    cpmId   → solo las actividades de ESA asignación (curso + materia), así no se mezclan materias
    periodo → solo las del periodo N del año
    todas   → 1 = todas las materias del curso (por defecto 0)
  Los filtros vacíos no se envían.
*/
const filtros = ({ todas = 0, cpmId, periodo } = {}) => {
  const p = new URLSearchParams({ todas: String(todas) });
  if (cpmId) p.set('cpm', cpmId);
  if (periodo) p.set('periodo', periodo);
  return `?${p.toString()}`;
};

// Etiqueta de caché "Planilla": la comparten la lista de actividades y la planilla de notas.
// Al crear, evaluar o borrar algo se invalida y ambas pantallas se actualizan solas.
const PLANILLA = [{ type: 'Planilla', id: 'LIST' }];

export const actividadesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActividadesPorCurso: builder.query({
      query: ({ cursoId, ...resto }) => `actividades/curso/${cursoId}/${filtros(resto)}`,
      providesTags: PLANILLA,
    }),

    crearActividadEnCurso: builder.mutation({
      query: ({ cursoId, payload }) => ({
        url: `actividades/curso/${cursoId}/crear/`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: PLANILLA,
    }),

    getEntregasByActividad: builder.query({
      query: ({ actividadId, estado = 'entregadas' }) =>
        `actividades/actividad/${actividadId}/entregas/?estado=${estado}`,
      providesTags: (r, e, args) => [
        { type: 'Entregas', id: `${args.actividadId}:${args.estado}` },
      ],
    }),

    actualizarEntrega: builder.mutation({
      query: ({ actividadEstudianteId, data }) => ({
        url: `actividades/entrega/${actividadEstudianteId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (r, e, { actividadId }) => [
        ...PLANILLA,
        { type: 'Entregas', id: `${actividadId}:entregadas` },
        { type: 'Entregas', id: `${actividadId}:pendientes` },
        { type: 'Entregas', id: `${actividadId}:todas` },
      ],
    }),

    subirEntregable: builder.mutation({
      query: ({ actividadEstudianteId, formData }) => ({
        url: `actividades/entrega/${actividadEstudianteId}/archivo/`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (r, e, { estudianteId }) => [
        ...PLANILLA,
        { type: 'Entregas', id: `est-${estudianteId}:todas` },
        { type: 'Entregas', id: `est-${estudianteId}:pendientes` },
        { type: 'Entregas', id: `est-${estudianteId}:entregadas` },
      ],
    }),

    actualizarActividad: builder.mutation({
      query: ({ actividadId, data }) => ({
        url: `actividades/${actividadId}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: PLANILLA,
    }),

    eliminarActividad: builder.mutation({
      query: (actividadId) => ({
        url: `actividades/${actividadId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: PLANILLA,
    }),

    // Planilla de evaluaciones por curso (actividades × estudiantes + promedio de cada uno)
    getMatrizCalificacionesPorCurso: builder.query({
      query: ({ cursoId, ...resto }) => `actividades/curso/${cursoId}/matriz/${filtros(resto)}`,
      providesTags: PLANILLA,
    }),

    getEntregasPorEstudiante: builder.query({
      query: ({ estudianteId, estado = 'todas' }) =>
        `actividades/estudiante/${estudianteId}/?estado=${estado}`,
      providesTags: (r, e, args) => [{ type: 'Entregas', id: `est-${args.estudianteId}:${args.estado}` }],
    }),
  }),
});

export const {
  useGetActividadesPorCursoQuery,
  useCrearActividadEnCursoMutation,
  useGetEntregasByActividadQuery,
  useActualizarEntregaMutation,
  useSubirEntregableMutation,
  useActualizarActividadMutation,
  useEliminarActividadMutation,
  useGetMatrizCalificacionesPorCursoQuery,
  useGetEntregasPorEstudianteQuery,
} = actividadesApi;
