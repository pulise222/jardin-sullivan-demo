import { api } from "../api/apiSlicer";

export const academicoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getContextoAcademico: builder.query({
      query: () => 'academico/contexto/',
      providesTags: ['ContextoAcademico'],
    }),

    // NUEVO: trae el boletín para 1 estudiante, 1 curso y 1 periodo
    getBoletinEstudiante: builder.query({
      query: ({ cursoId, periodo, estudianteId, anio }) =>
        `academico/boletin/curso/${cursoId}/periodo/${periodo}/?estudiante_id=${estudianteId}&anio=${anio}`,
    }),
  }),
});

export const { useGetContextoAcademicoQuery, useGetBoletinEstudianteQuery } = academicoApi;
