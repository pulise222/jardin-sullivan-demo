// src/components/common/AvatarUploader.jsx
import React, { useRef, useState } from 'react';

const AvatarUploader = ({
  src,
  onPickFile,     // (File) => Promise<void> | void
  onRemove,       // () => Promise<void> | void
  size = 64,
  alt = 'avatar'
}) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { await onPickFile(file); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <img
        src={src || `${import.meta.env.BASE_URL}avatar.svg`}
        alt={alt}
        style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', border:'1px solid #ddd' }}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display:'none' }}
        onChange={handlePick}
      />
      <button onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? 'Subiendo…' : 'Cambiar foto'}
      </button>
      {src && <button onClick={onRemove} disabled={busy}>Eliminar</button>}
    </div>
  );
};

export default AvatarUploader;
