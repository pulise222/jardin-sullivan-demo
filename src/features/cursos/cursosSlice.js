import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    coursesByTeacherId: [],
    selectedCourse: null,
    curso_profesor_materia: null
};

export const courseSlice = createSlice({
    name: "course",
    initialState,
    reducers: {
        setSelectedCourse: (state, action) => {
        state.selectedCourse = action.payload;
        },
        clearSelectedCourse: (state) => {
        state.selectedCourse = null;
        },
        coursesByTeacher: (state, action) => {
            state.coursesByTeacherId = action.payload;
        },
        setCursoProfesorMateria: (state, action) => {
            state.curso_profesor_materia = action.payload
        }
    }
});

export const { setSelectedCourse,
     clearSelectedCourse, 
     coursesByTeacher,
     setCursoProfesorMateria
    } = courseSlice.actions;
export default courseSlice.reducer;
