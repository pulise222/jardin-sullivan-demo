import { api } from "../api/apiSlicer";

export const courseApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // Obtener todos los cursos
    getCourses: builder.query({
      query: () => 'cursos/',
      providesTags: ['Courses'],
    }),

    // obtener estudiantes del curso 
    getCourseWithStudents: builder.query({
      query: (id) => `cursos/${id}/estudiantes`,
      providesTags: (result, error, id) => [{ type: 'Courses', id }],
    }),


    // Obtener curso por ID de profesor
    getCourseByTeacher: builder.query({
      query: (id) => `personas/${id}/cursos-materias/`,
      providesTags: (result, error, id) => [{ type: 'Courses', id }],      
    }),


    // Asignar Profesor Materia a Curso
    assignCursoProfesorMateria: builder.mutation({
      query: ({ curso_id, persona_id, materia_id }) => ({
        url: `personas/${persona_id}/cursos/${curso_id}/materias/${materia_id}/asignar/`,    // tu ruta de DRF
        method: 'POST',
        body: { curso_id, materia_id, persona_id },
      }),
      // invalidamos aquí para que se refresquen las listas relacionadas
      invalidatesTags: ['Asignaciones'],
    }),


    // Crear curso
    createCourse: builder.mutation({
      query: (newCourse) => ({
        url: 'cursos/',
        method: 'POST',
        body: newCourse,
      }),
      invalidatesTags: ['Courses'],
    }),

    // Actualizar curso
    updateCourse: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `cursos/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Courses', id }],
    }),

    // Eliminar curso
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `cursos/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Courses', id }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetCoursesQuery,
  useGetCourseWithStudentsQuery,
  useGetCourseByTeacherQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAssignCursoProfesorMateriaMutation,
} = courseApi;
