//src/features/people/personApi.js
import { api } from "../api/apiSlicer"; 

export const personApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyPersona: builder.query({
      query: () => 'personas/me/',
      providesTags: ['Persona'],
    }),

    updateMyPersona: builder.mutation({
      query: (patchBody) => ({
        url: 'personas/me/',
        method: 'PATCH',
        body: patchBody,
      }),
      invalidatesTags: ['Persona'],
    }),

    // LISTA
    getPeople: builder.query({
      query: () => 'personas/',
      refetchOnFocus: true,
      refetchOnReconnect: true,
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: 'People', id: p.id })),
              { type: 'People', id: 'LIST' },
            ]
          : [{ type: 'People', id: 'LIST' }],
    }),

    // DETALLE
    getPersonById: builder.query({
      query: (id) => `personas/${id}/`,
      providesTags: (r, e, id) => [{ type: 'People', id }],
    }),

    // CREAR
    createPerson: builder.mutation({
      query: (newPerson) => ({
        url: 'personas/',
        method: 'POST',
        body: newPerson,
      }),
      invalidatesTags: [{ type: 'People', id: 'LIST' }],
    }),

    // ACTUALIZAR  <<< CAMBIO: usar PATCH y no enviar 'usuario' desde el form
    updatePerson: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `personas/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: 'People', id },
        { type: 'People', id: 'LIST' },
      ],
    }),

    // ELIMINAR
    deletePerson : builder.mutation({
      query: (id) => ({
        url: `personas/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (r, e, id) => [
        { type: 'People', id },
        { type: 'People', id: 'LIST' },
      ],
    }),

    searchPeople: builder.query({
      query: (q) => `personas/buscar/?q=${encodeURIComponent(q)}`,
    }),

    importarEstudiantes: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: 'personas/importar-estudiantes/',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['People'],
    }),
     uploadPersonaAvatar: builder.mutation({
      query: ({ personaId, file }) => {
        const formData = new FormData();
        formData.append('foto', file);
        return {
          url: `personas/${personaId}/avatar/`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['People','Persona'],
    }),
    deletePersonaAvatar: builder.mutation({
      query: (personaId) => ({
        url: `personas/${personaId}/avatar/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['People','Persona'],
    }),


  }),
  overrideExisting: false,
});

export const {
  useGetMyPersonaQuery,
  useGetPeopleQuery,
  useGetPersonByIdQuery,
  useCreatePersonMutation,
  useUpdatePersonMutation,
  useDeletePersonMutation,
  useLazySearchPeopleQuery,
  useLazyGetMyPersonaQuery,
  useUpdateMyPersonaMutation,
  useImportarEstudiantesMutation,
  useUploadPersonaAvatarMutation,
  useDeletePersonaAvatarMutation,
} = personApi;
