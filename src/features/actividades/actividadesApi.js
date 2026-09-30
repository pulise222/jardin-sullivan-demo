import { api } from '../api/apiSlicer';

export const actividadesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActividadesPorCurso: builder.query({
      query: ({ cursoId, todas = 0 }) => `actividades/curso/${cursoId}/?todas=${todas}`,
    }),

    crearActividadEnCurso: builder.mutation({
      query: ({ cursoId, payload }) => ({
        url: `actividades/curso/${cursoId}/crear/`,
        method: 'POST',
        body: payload,
      }),
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
    }),

    eliminarActividad: builder.mutation({
      query: (actividadId) => ({
        url: `actividades/${actividadId}/`,
        method: 'DELETE',
      }),
    }),

    // Matriz de calificaciones por curso
    getMatrizCalificacionesPorCurso: builder.query({
      query: ({ cursoId, todas = 0 }) => `actividades/curso/${cursoId}/matriz/?todas=${todas}`,
    }),

     getEntregasPorEstudiante: builder.query({
      query: ({ estudianteId, estado = 'todas' }) =>
        `actividades/estudiante/${estudianteId}/?estado=${estado}`,
      providesTags: (r,e,args) => [{ type: 'Entregas', id: `est-${args.estudianteId}:${args.estado}` }],
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
