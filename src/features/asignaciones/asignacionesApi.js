// src/features/asignaciones/asignacionesApi.js
import { api } from '../api/apiSlicer';

export const asignacionesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAsignaciones: builder.query({
      query: () => 'asignaciones/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Asignacion', id })),
              { type: 'Asignacion', id: 'LIST' },
            ]
          : [{ type: 'Asignacion', id: 'LIST' }],
    }),

    createAsignacion: builder.mutation({
      query: (payload) => ({
        url: 'asignaciones/',
        method: 'POST',
        body: payload, // {curso_id, persona_id, materia_id}
      }),
      invalidatesTags: [{ type: 'Asignacion', id: 'LIST' }],
    }),

    updateAsignacion: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `asignaciones/${id}/`,
        method: 'PUT',
        body: payload, // {curso_id, persona_id, materia_id}
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: 'Asignacion', id },
        { type: 'Asignacion', id: 'LIST' },
      ],
    }),

    deleteAsignacion: builder.mutation({
      query: (id) => ({
        url: `asignaciones/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (r, e, id) => [
        { type: 'Asignacion', id },
        { type: 'Asignacion', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAsignacionesQuery,
  useCreateAsignacionMutation,
  useUpdateAsignacionMutation,
  useDeleteAsignacionMutation,
} = asignacionesApi;
