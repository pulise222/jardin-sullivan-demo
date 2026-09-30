import { api } from '../api/apiSlicer';

export const asistenciaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAsistenciaByCPM: builder.query({
      query: ({ cpmId, fecha }) => `clases/asistencias/cpm/${cpmId}/?fecha=${fecha}`,
      providesTags: (r, e, args) => [{ type: 'Asistencia', id: `${args.cpmId}:${args.fecha}` }],
    }),

    upsertAsistencia: builder.mutation({
      query: ({ cpmId, fecha, estudiante_id, estado }) => ({
        url: `clases/asistencias/cpm/${cpmId}/upsert/`,
        method: 'POST',
        body: { fecha, estudiante_id, estado },
      }),
      // Importante: aunque invalidamos, hacemos también optimistic update en el componente
      invalidatesTags: (r, e, { cpmId, fecha }) => [
        { type: 'Asistencia', id: `${cpmId}:${fecha}` },
        { type: 'AsistenciaFechas', id: cpmId },
        { type: 'AsistenciaResumen', id: cpmId },
      ],
    }),

    getFechasConAsistencia: builder.query({
      query: (cpmId) => `clases/asistencias/cpm/${cpmId}/fechas/`,
      providesTags: (r, e, id) => [{ type: 'AsistenciaFechas', id }],
    }),

    getResumenAsistencia: builder.query({
      query: (cpmId) => `clases/asistencias/cpm/${cpmId}/resumen/`,
      // Sugerencia: añade 'AsistenciaResumen' a tagTypes en apiSlicer si usas invalidations
      providesTags: (r, e, cpmId) => [{ type: 'AsistenciaResumen', id: cpmId }],
    }),
  }),
});

export const {
  useGetAsistenciaByCPMQuery,
  useUpsertAsistenciaMutation,
  useGetFechasConAsistenciaQuery,
  useGetResumenAsistenciaQuery,
} = asistenciaApi;
