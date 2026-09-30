// src/features/acudiente/acudienteApi.js
import { api } from '../api/apiSlicer';

/**
 * Endpoints de ejemplo para el rol Acudiente.
 * Ajusta las rutas a tus endpoints reales del backend.
 */
export const acudienteApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Estudiantes asociados al acudiente autenticado
    getMisEstudiantes: builder.query({
      query: () => 'estudiantes/acudientes/mis-estudiantes/',
      providesTags: ['MisEstudiantes'],
    }),
    // Eventos próximos (públicos)
    getEventosProximos: builder.query({
      query: () => 'eventos/proximos/',
      providesTags: ['Eventos'],
    }),
  }),
});

export const { 
  useGetMisEstudiantesQuery, 
  useGetEventosProximosQuery, 
} = acudienteApi;
