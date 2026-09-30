// src/features/actividades/actividadesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  actividades: [],
  actividadSeleccionada: null,
  mostrarFormulario: false,
  filtroTodas: false, // si true => ver actividades de todos los profes en el curso
};

const actividadesSlice = createSlice({
  name: 'actividades',
  initialState,
  reducers: {
    setActividades(state, action) {
      state.actividades = action.payload || [];
    },
    setActividadSeleccionada(state, action) {
      state.actividadSeleccionada = action.payload;
    },
    toggleFormulario(state, action) {
      state.mostrarFormulario = action.payload ?? !state.mostrarFormulario;
      state.actividadSeleccionada = ''
    },
    setFiltroTodas(state, action) {
      state.filtroTodas = !!action.payload;
    },
    clearActividadesState() {
      return initialState;
    },
  },
});

export const {
  setActividades,
  setActividadSeleccionada,
  toggleFormulario,
  setFiltroTodas,
  clearActividadesState,
} = actividadesSlice.actions;

export default actividadesSlice.reducer;
