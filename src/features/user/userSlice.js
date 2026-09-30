import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  persona: null,
  access: null,
  refresh: null,
};

const normalizeStoredToken = (t) => {
  if (!t) return null;
  if (t === 'undefined' || t === 'null') return null;
  return t;
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, access, refresh } = action.payload;
      if (user !== undefined) state.user = user; // permite actualizar solo tokens
      if (access !== undefined) state.access = access || null;
      if (refresh !== undefined) state.refresh = refresh || null;
    },
    setPersona(state, action) {
      state.persona = action.payload || null;
    },
    hydrateFromStorage(state) {
      try {
        const stUser = sessionStorage.getItem('user');
        const stPersona = sessionStorage.getItem('persona');
        const access = normalizeStoredToken(localStorage.getItem('access'));
        const refresh = normalizeStoredToken(localStorage.getItem('refresh'));
        if (stUser) state.user = JSON.parse(stUser);
        if (stPersona) state.persona = JSON.parse(stPersona);
        state.access = access;
        state.refresh = refresh;
      } catch (err) {
        console.log('hydrateFromStorage: ', err);
      }
    },
    logoutUser(state) {
      state.user = null;
      state.persona = null;
      state.access = null;
      state.refresh = null;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('persona');
    },
  },
});

export const { setCredentials, setPersona, hydrateFromStorage, logoutUser } = userSlice.actions;
export default userSlice.reducer;
