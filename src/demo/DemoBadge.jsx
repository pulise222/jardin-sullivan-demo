// src/demo/DemoBadge.jsx
import { useState } from 'react';
import { restablecerDemo } from './mockServer';

/*
  Etiqueta flotante que avisa que esto es una DEMOSTRACIÓN (sin servidor real) y permite
  volver a los datos originales. Se puede minimizar con la "x".
*/
const estilo = {
  position: 'fixed', right: 12, bottom: 12, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10,
  padding: '8px 10px 8px 14px', borderRadius: 999, background: 'rgba(16, 24, 40, 0.92)', color: '#fff',
  font: '600 12px/1.2 system-ui, sans-serif', boxShadow: '0 8px 24px rgba(0,0,0,.25)', maxWidth: 'calc(100vw - 24px)',
};
const boton = {
  border: 0, borderRadius: 999, padding: '5px 10px', background: '#ffd23f', color: '#10182b',
  font: 'inherit', fontWeight: 800, cursor: 'pointer',
};

const DemoBadge = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const reiniciar = () => {
    restablecerDemo();
    // Limpiamos la sesión y recargamos para que todo vuelva al estado original
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    sessionStorage.clear();
    window.location.assign(import.meta.env.BASE_URL);
  };

  return (
    <div style={estilo} role="note">
      <span>Versión demo · datos de ejemplo</span>
      <button type="button" style={boton} onClick={reiniciar}>Restablecer</button>
      <button type="button" style={{ ...boton, background: 'transparent', color: '#fff' }} onClick={() => setVisible(false)} aria-label="Ocultar aviso">✕</button>
    </div>
  );
};

export default DemoBadge;
