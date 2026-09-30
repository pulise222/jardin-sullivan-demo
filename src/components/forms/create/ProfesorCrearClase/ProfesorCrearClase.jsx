// ProfesorCrearClase.jsx
import React, { useState } from 'react';
import {
  useGetCursosDelProfesorQuery,
  useGetEstudiantesDelCursoQuery,
  useCrearClaseMutation,
  useRegistrarAsistenciaMutation,
} from '../../../../features/classes/claseApi';

const ProfesorCrearClase = ({ profesorId }) => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [fecha, setFecha] = useState('');
  const [asistencia, setAsistencia] = useState({});
  
  const { data: cursos } = useGetCursosDelProfesorQuery(profesorId);
  const { data: estudiantes } = useGetEstudiantesDelCursoQuery(cursoSeleccionado, { skip: !cursoSeleccionado });

  const [crearClase] = useCrearClaseMutation();
  const [registrarAsistencia] = useRegistrarAsistenciaMutation();

  const handleCrearClase = async () => {
    const clase = await crearClase({ curso: cursoSeleccionado, fecha }).unwrap();
    for (const [estudianteId, estado] of Object.entries(asistencia)) {
      await registrarAsistencia({
        clase: clase.id,
        estudiante: estudianteId,
        estado
      });
    }
    alert("Clase y asistencia registradas.");
  };

  return (
    <div>
      <h3>Crear Clase</h3>
      <select onChange={(e) => setCursoSeleccionado(e.target.value)}>
        <option>Seleccione un curso</option>
        {cursos?.map(c => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

      {estudiantes?.map(est => (
        <div key={est.id}>
          <span>{est.nombre} {est.apellido}</span>
          <select onChange={(e) => setAsistencia({ ...asistencia, [est.id]: e.target.value })}>
            <option value="Presente">Presente</option>
            <option value="Ausente">Ausente</option>
            <option value="Justificado">Justificado</option>
          </select>
        </div>
      ))}

      <button  onClick={handleCrearClase}>Registrar Clase y Asistencia</button>
    </div>
  );
};

export default ProfesorCrearClase;
