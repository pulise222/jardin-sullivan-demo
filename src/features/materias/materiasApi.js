// src/features/materias/materiasApi.js
import { api } from "../api/apiSlicer";

export const materiasApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // Listar Materias
    getMaterias: builder.query({
      query: () => 'materias/',
      providesTags: ['Materias'],
    }),

    // Crear Materia
    createMateria: builder.mutation({
      query: (newM) => ({
        url: 'materias/',
        method: 'POST',
        body: newM,
      }),
      invalidatesTags: ['Materias'],
    }),

    // Actualizar Materia
    updateMateria: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `materias/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Materias'],
    }),

    // Eliminar Materia
    deleteMateria: builder.mutation({
      query: (id) => ({
        url: `materias/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Materias'],
    }),
  }),
});

export const {
  useGetMateriasQuery,
  useCreateMateriaMutation,
  useUpdateMateriaMutation,
  useDeleteMateriaMutation,
} = materiasApi;