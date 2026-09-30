// src/features/students/studentSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  modalActivo: false,
  selectedPerson: null,
  people: [],
  personasFiltradas: []
};

const peopleSlice = createSlice({
  name: 'people',
  initialState,
  reducers: {
     setPeople: (state, action) => {
      state.people = action.payload;
    },

    toggleModal: (state) => {
      state.modalActivo = !state.modalActivo;
    },

    setSelectedPerson: (state, action) => {
      state.selectedPerson = action.payload;
    },
    // Filtrar estudiantes por nombre
    filterByNamePerson: (state, action) => {
      const term = action.payload.toLowerCase();
      state.personasFiltradas = state.people.filter(s =>
        s.nombre.toLowerCase().includes(term)
      );
    }
  },
});

export const {
  setPeople,
  toggleModal,
  setSelectedPerson,
  filterByNamePerson
  
} = peopleSlice.actions;

export default peopleSlice.reducer;
