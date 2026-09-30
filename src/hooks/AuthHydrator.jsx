import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateFromStorage } from '../features/user/userSlice';

export default function AuthHydrator({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);
  return children;
}
