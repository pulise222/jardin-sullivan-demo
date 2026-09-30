import { configureStore } from '@reduxjs/toolkit';
import { api } from './api/apiSlicer';
import  studentReducer  from "./students/studentSlice"
import  userReducer from './user/userSlice';
import  peopleReducer from './people/personSlice';
import courseReducer from './cursos/cursosSlice';
import actividadesReducer from './actividades/actividadesSlice'

// Leemos (si existe) el usuario previamente logueado
const savedUser = sessionStorage.getItem('user')
  ? JSON.parse(sessionStorage.getItem('user'))
  : null


const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    // root: rootReducer,
    user: userReducer,
    student: studentReducer,
    people: peopleReducer,
    courses: courseReducer,
    actividades: actividadesReducer,
  },
  preloadedState: {
    user: { user: savedUser }
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),

  // middleware se agrega automáticamente, incluyendo thunk
  // devTools: process.env.NODE_ENV !== 'production',
});


store.subscribe(() => {
  const state = store.getState()
  const usuario = state.user.user
  if (usuario) {
    sessionStorage.setItem('user', JSON.stringify(usuario))
  } else {
    sessionStorage.removeItem('user')
  }
})

export default store;