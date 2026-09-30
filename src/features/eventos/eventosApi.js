import { api } from '../api/apiSlicer';

/**
 * Endpoints para CRUD de eventos.
 * Nota:
 * - Crear/Editar usan FormData (multipart); NO setear Content-Type manualmente.
 * - El PK del modelo es `id_evento`.
 */
export const eventosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Listar todos (admin)
    getEventos: builder.query({
      query: () => 'eventos/',
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: 'Eventos', id: e.id_evento })),
              { type: 'Eventos', id: 'LIST' },
            ]
          : [{ type: 'Eventos', id: 'LIST' }],
    }),

    // Listar próximos (landing/carrusel)
    getEventosProximos: builder.query({
      query: ({ limit = 10 } = {}) => `eventos/proximos/?limit=${limit}`,
      providesTags: [{ type: 'Eventos', id: 'PROX' }],
    }),

    // Crear (multipart)
    createEvento: builder.mutation({
      query: (payload) => {
        const fd = new FormData();
        // payload: { titulo, descripcion, fecha_inicio_local, file? }
        fd.append('titulo', payload.titulo);
        if (payload.descripcion) fd.append('descripcion', payload.descripcion);
        if (payload.fecha_inicio_iso) fd.append('fecha_inicio', payload.fecha_inicio_iso);
        if (payload.file) fd.append('imagen', payload.file);
        return { url: 'eventos/', method: 'POST', body: fd };
      },
      invalidatesTags: [{ type: 'Eventos', id: 'LIST' }, { type: 'Eventos', id: 'PROX' }],
    }),

    // Actualizar (PATCH multipart)
    updateEvento: builder.mutation({
      query: ({ id_evento, ...payload }) => {
        const fd = new FormData();
        if (payload.titulo !== undefined) fd.append('titulo', payload.titulo);
        if (payload.descripcion !== undefined) fd.append('descripcion', payload.descripcion);
        if (payload.fecha_inicio_iso !== undefined)
          fd.append('fecha_inicio', payload.fecha_inicio_iso);
        // Si viene file, se reemplaza; si NO viene, no se toca imagen.
        if (payload.file) fd.append('imagen', payload.file);
        return { url: `eventos/${id_evento}/`, method: 'PATCH', body: fd };
      },
      invalidatesTags: (r, e, { id_evento }) => [
        { type: 'Eventos', id: id_evento },
        { type: 'Eventos', id: 'LIST' },
        { type: 'Eventos', id: 'PROX' },
      ],
    }),

    // Eliminar
    deleteEvento: builder.mutation({
      query: (id_evento) => ({ url: `eventos/${id_evento}/`, method: 'DELETE' }),
      invalidatesTags: (r, e, id_evento) => [
        { type: 'Eventos', id: id_evento },
        { type: 'Eventos', id: 'LIST' },
        { type: 'Eventos', id: 'PROX' },
      ],
    }),
  }),
});

export const {
  useGetEventosQuery,
  useGetEventosProximosQuery,
  useCreateEventoMutation,
  useUpdateEventoMutation,
  useDeleteEventoMutation,
} = eventosApi;
