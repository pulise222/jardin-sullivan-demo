import { createApi } from '@reduxjs/toolkit/query/react';
import { mockBaseQuery } from '../../demo/mockServer';

/*
  VERSIÓN DEMO: en el proyecto real, aquí había un fetchBaseQuery apuntando a Django
  (http://127.0.0.1:8000/) con renovación automática del token JWT. En la demo no existe
  backend: todas las peticiones las contesta `mockBaseQuery` (src/demo/mockServer.js) con
  datos de ejemplo. Por eso las pantallas y los hooks de RTK Query funcionan sin cambios.
*/
export const api = createApi({
  reducerPath: 'api',
  baseQuery: mockBaseQuery,
  tagTypes: ['User', 'Courses', 'Students', 'Entregas', 'People', 'Materias', 'Eventos'],
  endpoints: () => ({}),
});

export const { useLoginUserMutation } = api;
