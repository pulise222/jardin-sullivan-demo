import React from 'react'
import { useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import TablaEstudiantes from '../components/container/TablaEstudiantes/TablaEstudiantes'
import Admin from '../components/views/Admin/Admin'
import MenuAdmin from '../components/container/Menu/MenuAdmin/MenuAdmin'
import Login from '../components/views/Login/Login'
import RequireAuth from '../hooks/RequireAuth'
import Home from "../components/views/Home/Home"
import Matricula from "../components/views/Matricula/Matricula"

import Profe  from '../components/views/Profe/Profe'
import ResetPasswordConfirm from '../components/views/Auth/ResetPasswordConfirm'
import ResetPasswordRequest from '../components/views/Auth/ResetPasswordRequest'
import ImportEstudiantes from '../components/views/Admin/ImportEstudiantes'
import Acudiente from '../components/views/Acudiente/Acudiente'
import EstudianteDetalle from '../components/views/Acudiente/EstudianteDetalle'

/*
  ScrollToTop: cada vez que cambia la RUTA (por ejemplo de "/" a "/matricula") vuelve arriba.
  React Router navega sin recargar la página, y por eso el navegador conserva el scroll de la
  página anterior; sin esto, una página nueva se abría a mitad de camino.
  No hace nada si solo cambia el "#ancla" (los enlaces del menú como #eventos), que sí deben
  bajar a su sección.
*/
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    // behavior: 'instant' evita la animación suave que la landing activa con scroll-behavior
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

const index = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
          
        <Route path="/" element={<Home />} />

        {/* Página pública con el formulario de inscripción */}
        <Route path="/matricula" element={<Matricula />} />
        
        <Route path='/login' element={<Login></Login>}></Route>
        
        {/* La tabla suelta ya no existe: los estudiantes se gestionan dentro del panel de administración */}
        <Route path='/estudiantes' element={<Navigate to="/admin" replace />} />
        
        <Route path='/admin' element={
          <RequireAuth>
            <Admin/>
          </RequireAuth>
        } />
        <Route path="/admin/importar-estudiantes" element={
          <RequireAuth>
            <ImportEstudiantes/>
          </RequireAuth>
        } />

        <Route
          path="/acudiente/*" element={
            <RequireAuth>
              <Acudiente/>
            </RequireAuth>
          }
        />
        <Route path="/acudiente/estudiante/:id" element={
          <RequireAuth>
            <EstudianteDetalle/> 
          </RequireAuth>
        }/> 
        
        <Route path='/profesor' element={
          <RequireAuth>
            <Profe/>
          </RequireAuth>
        }/>


        <Route path='/cambiar-contraseña' element={
            <ResetPasswordRequest/>
        }/>
        <Route path='/reset-password/:uid/:token' element={
            <ResetPasswordConfirm/>
        }/>
      </Routes>
    </>  
      
  )
}

export default index