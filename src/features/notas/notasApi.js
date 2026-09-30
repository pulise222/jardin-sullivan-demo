import { api } from '../api/apiSlicer';

/**
 * Supone endpoints en backend:
 *  GET  calificaciones/cpm/:cpmId/resumen/
 *  POST calificaciones/cpm/:cpmId/upsert/  { estudiante_id, rubro_id, nota }
 */
export const notasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getResumenNotas: builder.query({
      query: (cpmId) => `calificaciones/cpm/${cpmId}/resumen/`,
      providesTags: (r, e, cpmId) => [{ type: 'Notas', id: cpmId }],
    }),
    upsertNota: builder.mutation({
      query: ({ cpmId, estudiante_id, rubro_id, nota }) => ({
        url: `calificaciones/cpm/${cpmId}/upsert/`,
        method: 'POST',
        body: { estudiante_id, rubro_id, nota },
      }),
      invalidatesTags: (r, e, { cpmId }) => [{ type: 'Notas', id: cpmId }],
    }),
  }),
});

export const { useGetResumenNotasQuery, useUpsertNotaMutation } = notasApi;
