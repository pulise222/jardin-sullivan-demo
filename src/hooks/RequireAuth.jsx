//src/hooks/RequireAuth.jsx
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { setCredentials } from '../features/user/userSlice';

const RequireAuth = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const location = useLocation();

  useEffect(() => {
    if (!user && sessionStorage.getItem('user')) {
      const savedUser = JSON.parse(sessionStorage.getItem('user'));
      dispatch(setCredentials(savedUser));
    }
  }, [user, dispatch]);

  const path = location.pathname;

  if (!user && !sessionStorage.getItem('user')) {
    return <Navigate to="/login" replace />;
  }

  // Verifica rol según ruta
  const currentUser = user || JSON.parse(sessionStorage.getItem('user'));

  if (path.startsWith('/profesor') && currentUser.rol !== 'Profesor') {
    return <Navigate to="/" replace />;
  }

  if (path.startsWith('/acudiente') && currentUser.rol !== 'Acudiente') {
    return <Navigate to="/" replace />;
  }

  if (path.startsWith('/admin') && currentUser.rol !== 'Administrador') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAuth;
