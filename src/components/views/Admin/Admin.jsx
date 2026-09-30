// src/components/views/Admin/Admin.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import MenuAdmin from '../../container/Menu/MenuAdmin/MenuAdmin';

import { StudentToolbar, PersonToolBar }from '../../container/StudentToolBar/StudentToolBar';
import TablaEstudiantes from '../../container/TablaEstudiantes/TablaEstudiantes';
import CreateStudentForm from '../../forms/create/CreateStudentForm/CreateStudentForm';
import UpdateStudentForm from '../../forms/update/UpdateStudentForm/UpdateStudentForm';

import TablaPersonas from '../../container/TablaPersonas/TablaPersonas';
import CreatePerson from '../../forms/create/CreatePerson/CreatePersonForm'
import UpdatePersonForm from '../../forms/update/UpdatePersonForm/UpdatePersonForm';

import Modal from '../../container/Modal/Modal';
// Sistema de diseño compartido de los paneles (menú lateral, tablas, botones, acentos por rol)
import "../../../styles/panel.css";
import "./css/Admin.css"
import MateriasManager from '../../container/MateriasManager/MateriasManager';
import AsignacionesCrud from './AsignacionesCrud';
import EventsAdmin from './EventsAdmin';

// Título y descripción que se muestran arriba según la sección elegida
const VIEW_INFO = {
  estudiantes: { title: 'Estudiantes', subtitle: 'Consulta y administra la ficha, el curso y los acudientes de cada estudiante.' },
  personas: { title: 'Personas', subtitle: 'Profesores, acudientes y directivos del jardín.' },
  materias: { title: 'Materias', subtitle: 'Las asignaturas que se dictan en el jardín.' },
  asignaciones: { title: 'Asignaciones', subtitle: 'Qué profesor dicta qué materia en cada curso.' },
  eventos: { title: 'Eventos', subtitle: 'Crea y gestiona los eventos que ven las familias.' },
};

const Admin = () => {
  // Estudiantes que ya cargó la tabla: de ahí salen los números de las tarjetas de resumen
  const estudiantesCargados = useSelector((s) => s.student.estudiantes);
  // En celular el menú lateral se abre y se cierra
  const [menuOpen, setMenuOpen] = useState(false);

  // Ventana Modal reutilizanle
  const [showModalToCreate, setShowModalToCreate] = useState(false);
  const [showModalToEdit, setShowModalToEdit] = useState(false);

  // Setear estudiante en el estado para obtenerlo en form de actualizar
  const [studentToEdit, setStudentToEdit] = useState(null);
  // Setear persona en el estado para obtenerlo en form de actualizar
  const [personToEdit, setPersonToEdit] = useState(null);
  

  //Editar Persona
  const handleEditStudent = (student) => {
    setStudentToEdit(student);
    setShowModalToEdit(true);
  };


  // Mostrar formulario para crear estudiante
  const handleAdd = () => {
    setShowModalToCreate(true); // o abrir modal
  };
  

  //Editar Persona
  const handleEditPerson = (person) => {
    setPersonToEdit(person);
    setShowModalToEdit(true);
  };

  

  const [view, setView] = useState('estudiantes');

  const renderView = () => {
    switch (view) {
      case 'eventos':
        return <EventsAdmin />
      case 'estudiantes':
        return <>
                     {/* Barra de búsqueda y botón de agregar */}
                    <StudentToolbar onAddClick={handleAdd}></StudentToolbar>
                    <TablaEstudiantes handleEdit={handleEditStudent} />
                    
                    {/* Formulario para crear Estudiante */}
                    <Modal isOpen={showModalToCreate} onClose={() => setShowModalToCreate(false)}>
                      <CreateStudentForm onClose={()=>setShowModalToCreate(false)}/>
                    </Modal>

                    {/* Formulario para Editar Estudiante */}
                    <Modal isOpen={showModalToEdit} onClose={()=> setShowModalToEdit(false)}>
                      <UpdateStudentForm student={studentToEdit} onClose={() => setShowModalToEdit(false) }></UpdateStudentForm>
                    </Modal>

                  </>


      case 'personas':
        return (
        <>
          <PersonToolBar onAddClick={handleAdd}></PersonToolBar>
          <TablaPersonas handleEdit={handleEditPerson}/>
          
          <Modal isOpen={showModalToCreate} onClose={() => setShowModalToCreate(false)}>
            <CreatePerson onClose={()=>setShowModalToCreate(false)}/>
          </Modal>

          <Modal isOpen={showModalToEdit} onClose={()=> setShowModalToEdit(false)}>
            <UpdatePersonForm person={personToEdit} onClose={() => setShowModalToEdit(false) }></UpdatePersonForm>
          </Modal>
        </>)


      case 'materias':
        return (
          <>
            <MateriasManager />
          </>)
      case 'asignaciones':
          return(
            <>
              <AsignacionesCrud></AsignacionesCrud>
            </>
          )
      default:
        // return <p>Seleccione una opción del menú</p>
        
        return <p>Seleccione una opción del menú</p>
      }

  
  };


  const info = VIEW_INFO[view] || VIEW_INFO.estudiantes;
  const cursosConEstudiantes = new Set(estudiantesCargados.map((e) => e.curso).filter(Boolean)).size;
  const sinCurso = estudiantesCargados.filter((e) => !e.curso).length;

  return (
    // data-role="admin" activa el color de acento rojo del panel (ver styles/panel.css)
    <div className={`pn-layout ${menuOpen ? 'is-menu-open' : ''}`} data-role="admin">
      <MenuAdmin setView={setView} currentView={view} onNavigate={() => setMenuOpen(false)} />
      {/* Fondo oscuro detrás del menú en celular: al tocarlo se cierra */}
      <div className="pn-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />

      {/* Avisos emergentes (éxito / error) de todo el panel */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: 'inherit', fontSize: '1.4rem', fontWeight: 600, borderRadius: '1.2rem', padding: '1.2rem 1.6rem', color: '#10323b' },
          success: { iconTheme: { primary: '#2ec4b6', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ff7a1a', secondary: '#fff' } },
        }}
      />

      <main className="pn-main">
        <header className="pn-header">
          <button
            type="button"
            className="pn-menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir el menú"
          >
            <i className="fas fa-bars" aria-hidden="true"></i>
          </button>
          <div className="pn-header-text">
            <h1>{info.title}</h1>
            <p>{info.subtitle}</p>
          </div>
        </header>

        {/* Tarjetas de resumen: solo en la sección de estudiantes */}
        {view === 'estudiantes' && (
          <section className="pn-kpis" aria-label="Resumen de estudiantes">
            <div className="pn-kpi">
              <span className="pn-kpi-ico" aria-hidden="true"><i className="fas fa-children"></i></span>
              <div><strong>{estudiantesCargados.length}</strong><span>Estudiantes registrados</span></div>
            </div>
            <div className="pn-kpi">
              <span className="pn-kpi-ico" aria-hidden="true"><i className="fas fa-school"></i></span>
              <div><strong>{cursosConEstudiantes}</strong><span>Cursos con estudiantes</span></div>
            </div>
            <div className="pn-kpi">
              <span className="pn-kpi-ico" aria-hidden="true"><i className="fas fa-user-clock"></i></span>
              <div><strong>{sinCurso}</strong><span>Sin curso asignado</span></div>
            </div>
          </section>
        )}

        {/* key={view}: al cambiar de sección React vuelve a dibujar y se repite la animación de entrada */}
        <div key={view} className="pn-fade">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Admin;