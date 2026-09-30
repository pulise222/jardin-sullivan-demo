// src/hooks/useConfirm.jsx
import { useCallback, useRef, useState } from 'react';
import Modal from '../components/container/Modal/Modal';

/*
  useConfirm: reemplaza el cuadro gris de window.confirm() por una ventana con el diseño del panel.

  Uso:
      const [confirm, confirmDialog] = useConfirm();

      const borrar = async () => {
        // confirm() devuelve una PROMESA: espera hasta que el usuario decida (true/false)
        if (await confirm({ title: '¿Eliminar?', message: '…', danger: true })) {
          // …borrar
        }
      };

      return (<>… {confirmDialog}</>);   // ← la ventana se dibuja donde pongas esto

  Opciones de confirm(): title, message, confirmLabel, cancelLabel, danger (botón rojo), icon.
*/
export default function useConfirm() {
  const [options, setOptions] = useState(null); // null = cerrada
  const resolver = useRef(null); // guarda la función que "resuelve" la promesa

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions(opts);
      }),
    []
  );

  const close = (answer) => {
    resolver.current?.(answer); // entrega la respuesta a quien llamó a confirm()
    resolver.current = null;
    setOptions(null);
  };

  const confirmDialog = (
    <Modal isOpen={!!options} onClose={() => close(false)}>
      {options && (
        <div className="pn-modal pn-confirm" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-msg">
          <span className={`pn-confirm-ico ${options.danger ? 'is-danger' : ''}`} aria-hidden="true">
            <i className={`fas ${options.icon || (options.danger ? 'fa-trash' : 'fa-circle-question')}`}></i>
          </span>
          <h2 id="confirm-title">{options.title || '¿Estás seguro?'}</h2>
          <p id="confirm-msg">{options.message}</p>
          <div className="pn-modal-foot pn-confirm-foot">
            <button type="button" className="pn-btn-ghost" onClick={() => close(false)}>
              {options.cancelLabel || 'Cancelar'}
            </button>
            <button
              type="button"
              className={`pn-btn ${options.danger ? 'is-danger' : ''}`}
              onClick={() => close(true)}
              autoFocus
            >
              {options.confirmLabel || 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );

  return [confirm, confirmDialog];
}
