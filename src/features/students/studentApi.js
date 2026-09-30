// src/features/students/studentApi.js
import { api } from "../api/apiSlicer";

export const studentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // LISTA
    getStudents: builder.query({
      query: () => 'estudiantes/', // ajusta si tu endpoint cambia
      refetchOnFocus: true,
      refetchOnReconnect: true,
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({ type: 'Students', id: s.id })),
              { type: 'Students', id: 'LIST' },
            ]
          : [{ type: 'Students', id: 'LIST' }],
    }),

    // DETALLE
    getStudentById: builder.query({
      query: (id) => `estudiantes/${id}/`,
      providesTags: (r, e, id) => [{ type: 'Students', id }],
    }),

    // CREAR (con optimistic update)
    createStudent: builder.mutation({
      query: (newStudent) => ({
        url: 'estudiantes/',
        method: 'POST',
        body: newStudent,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // 1) Optimista: inserta una fila temporal al inicio de la cache
        const tempId = Math.floor(Math.random() * -1e9); // id negativo temporal
        const patch = dispatch(
          studentApi.util.updateQueryData('getStudents', undefined, (draft) => {
            draft.unshift({ id: tempId, ...arg });
          })
        );
        try {
          // 2) Cuando llega la respuesta, reemplaza la fila temporal por la real
          const { data: created } = await queryFulfilled;
          patch.undo();
          dispatch(
            studentApi.util.updateQueryData('getStudents', undefined, (draft) => {
              draft.unshift(created);
            })
          );
        } catch {
          // 3) Si falla, deshace el optimista
          patch.undo();
        }
      },
      // Además invalidamos la LIST para asegurar consistencia (paginación, etc.)
      invalidatesTags: [{ type: 'Students', id: 'LIST' }],
    }),

    // ACTUALIZAR
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `estudiantes/${id}/`,
        method: 'PUT', // o 'PATCH' si tu API lo prefiere
        body: data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: 'Students', id },
        { type: 'Students', id: 'LIST' },
      ],
    }),

    // ELIMINAR
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `estudiantes/${id}/`,
        method: 'DELETE',
      }),
      // Quita por-id y la LIST para refrescar
      invalidatesTags: (r, e, id) => [
        { type: 'Students', id },
        { type: 'Students', id: 'LIST' },
      ],
    }),

    // ACUDIENTES (si lo usas en la tabla)
    getStudentGuardians: builder.query({
      query: (id) => `estudiantes/${id}/acudientes/`,
      providesTags: (r, e, id) => [{ type: 'Guardians', id }],
    }),
    addGuardianToStudent: builder.mutation({
      query: ({ studentId, persona_id, parentesco }) => ({
        url: `estudiantes/${studentId}/acudientes/`,
        method: 'POST',
        body: { persona_id, parentesco },
      }),
      invalidatesTags: (r, e, { studentId }) => [{ type: 'Guardians', id: studentId }],
    }),
    removeGuardianFromStudent: builder.mutation({
      query: ({ studentId, persona_id }) => ({
        url: `estudiantes/${studentId}/acudientes/${persona_id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (r, e, { studentId }) => [{ type: 'Guardians', id: studentId }],
    }),
    uploadStudentAvatar: builder.mutation({
      query: ({ estudianteId, file }) => {
        const formData = new FormData();
        formData.append('foto', file);
        return {
          url: `estudiantes/${estudianteId}/avatar/`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Students'],
    }),
    deleteStudentAvatar: builder.mutation({
      query: (estudianteId) => ({
        url: `estudiantes/${estudianteId}/avatar/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Students'],
    }),
    misEstudiantes: builder.query({
      query: () => 'estudiantes/acudientes/mis-estudiantes',
      providesTags: (result) =>
        result
          ? [
              ...result.map(s => ({ type: 'Students', id: s.id })),
              { type: 'Students', id: 'MIS' },
            ]
          : [{ type: 'Students', id: 'MIS' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useMisEstudiantesQuery,
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentGuardiansQuery,
  useAddGuardianToStudentMutation,
  useRemoveGuardianFromStudentMutation,
  useUploadStudentAvatarMutation,
  useDeleteStudentAvatarMutation,
} = studentApi;


// | Variable     | Tipo      | ¿Para qué sirve?                                                             |
// | ------------ | --------- | ---------------------------------------------------------------------------- |
// | `data`       | cualquier | Contiene los datos que devuelve tu endpoint (`estudiantes/`).                |
// | `error`      | objeto    | Contiene información del error si la petición falla.                         |
// | `isLoading`  | boolean   | `true` la **primera vez** que se ejecuta la petición.                        |
// | `isFetching` | boolean   | `true` mientras se está **realizando la petición**, incluso si ya hay caché. |
// | `isSuccess`  | boolean   | `true` si la petición fue exitosa.                                           |
// | `isError`    | boolean   | `true` si ocurrió un error en la petición.                                   |
// | `refetch`    | función   | Puedes usarla para **volver a hacer** la petición manualmente.               |
// | `status`     | string    | Puede ser: `'pending'`, `'fulfilled'`, o `'rejected'`.                       |
 