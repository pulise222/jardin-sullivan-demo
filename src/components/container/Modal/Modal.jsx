import { useEffect } from "react";
import "./Modal.css";

/*
  Ventana emergente reutilizable.
  Props: isOpen (si se muestra), onClose (qué hacer al cerrar) y children (el contenido).
  Mejoras: se cierra con la tecla Esc y con un clic en el fondo oscuro, y avisa a los
  lectores de pantalla que es un diálogo (role="dialog" aria-modal).
*/
const Modal = ({ isOpen, onClose, children }) => {
  // Escuchar la tecla Esc solo mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      // clic en el fondo (no en el contenido) = cerrar
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button className="modal-close" onClick={onClose} aria-label="Cerrar ventana">
        <i className="fas fa-xmark" aria-hidden="true"></i>
      </button>
      {/* .modal-body: si el contenido es más alto que la pantalla, la ventana entera se desplaza */}
      <div className="modal-body">{children}</div>
    </div>
  );
};

export default Modal;
