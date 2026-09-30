// src/components/views/Acudiente/PerfilAcudiente.jsx
import Profile from '../Profe/Profile';

/*
  El perfil del acudiente es el mismo componente que el del profesor: datos personales, foto,
  cuenta y edición. Según el rol (user.rol) cambia solo el resumen de arriba.
  Antes eran dos pantallas casi idénticas con diseños distintos.
*/
const PerfilAcudiente = () => <Profile />;

export default PerfilAcudiente;
