//src/features/user/userApi.js
import { api } from '../api/apiSlicer';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: 'usuarios/login/',  // Asegúrate que coincida con la URL de tu backend
        method: 'POST',
        body: credentials,
      }),
    }),

    // Registro
    registerUser: builder.mutation({
      query: (userData) => ({
        url: 'registro/',
        method: 'POST',
        body: userData,
      }),
    }),


    requestPasswordReset: builder.mutation({
      query: (email_or_username) => ({
        url: 'usuarios/auth/password-reset/',
        method: 'POST',
        body: { email_or_username },
      }),
    }),

    confirmPasswordReset: builder.mutation({
      query: ({ uid, token, new_password }) => ({
        url: 'usuarios/auth/password-reset/confirm/',
        method: 'POST',
        body: { uid, token, new_password },
      }),
    }),
  }),
});

export const { useLoginUserMutation, 
  useRegisterUserMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
 } = userApi;
