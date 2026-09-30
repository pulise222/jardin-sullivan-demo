import React from 'react';
import './css/FilePreview.css'; // opcional para estilos del visor

const isPreviewable = (mime) =>
  !!mime && (mime.startsWith('image/') || mime === 'application/pdf');

const FilePreview = ({ open, onClose, file }) => {
  if (!open) return null;
  const { url, mime, filename, downloadUrl } = file || {};

const withApiBase = (u) => {
  if (!u) return u;
  return u.startsWith('/')
  ? `${import.meta.env.VITE_API_BASE?.replace(/\/$/, '')}${u}`
  : u;
};

// ...
const src = withApiBase(url);

  return (
    <div className="fp-backdrop" onClick={onClose}>
      <div className="fp-modal" onClick={(e) => e.stopPropagation()}>
        <header className="fp-header">
          <div className="fp-title">
            <strong>{filename || 'Archivo'}</strong>
            <span className="fp-mime">{mime || ''}</span>
          </div>
          <div className="fp-actions">
            {downloadUrl && (
              <a className="btn" href={downloadUrl}>
                Descargar
              </a>
            )}
            <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </header>

        <div className="fp-body">
          {isPreviewable(mime) && url ? (
            mime.startsWith('image/')
              ? <img className="fp-image" src={src} alt={filename || 'archivo'} />
              : <iframe className="fp-frame" src={src} title="vista-archivo" />
          ) : (
            <div className="fp-fallback">
              <p>Este tipo de archivo no tiene vista previa.</p>
              {downloadUrl && (
                <a className="btn" href={downloadUrl}>Descargar archivo</a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
