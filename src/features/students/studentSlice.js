// src/features/students/studentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  modalActivo: false,
  estudianteSeleccionado: null,
  filtroCurso: '',
  estudiantes: [],
  estudiantesFiltrados: []
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
     setEstudiantes: (state, action) => {
      state.estudiantes = action.payload;
    },

    toggleModal: (state) => {
      state.modalActivo = !state.modalActivo;
    },

    setEstudianteSeleccionado: (state, action) => {
      state.estudianteSeleccionado = action.payload;
    },

    setFiltroCurso: (state, action) => {
      state.filtroCurso = action.payload;
    },

    // Filtrar estudiantes por nombre
    filterByNameStudents: (state, action) => {
      const term = action.payload.toLowerCase();
      state.estudiantesFiltrados = state.estudiantes.filter(s =>
        s.nombre.toLowerCase().includes(term)
      );
    }
  },
});

export const {
  setEstudiantes,
  toggleModal,
  setEstudianteSeleccionado,
  setFiltroCurso,
  filterByNameStudents,
} = studentSlice.actions;

export default studentSlice.reducer;
