// src/components/views/Admin/ImportEstudiantes.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useImportarEstudiantesMutation } from '../../../features/people/personApi';
import '../../../styles/panel.css';

/*
  Importar estudiantes (y su acudiente) desde un archivo Excel o CSV.
  Es una pantalla completa (no vive dentro del menú lateral), por eso lleva su propio
  contenedor "pn-layout pn-solo" para heredar los colores del panel.
*/

const HEADERS = [
  'curso_id', 'curso_nombre', 'estudiante_nombre', 'estudiante_apellido',
  'estudiante_fecha_nacimiento', 'estudiante_direccion', 'estudiante_telefono', 'estudiante_correo',
  'acudiente_tipo_documento', 'acudiente_numero_documento', 'acudiente_nombre', 'acudiente_apellido',
  'acudiente_telefono', 'acudiente_direccion', 'acudiente_email', 'parentesco',
];

const ImportEstudiantes = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false); // ¿se está arrastrando un archivo encima?
  const [importar, { data, isLoading, isError, error }] = useImportarEstudiantesMutation();

  const acceptFile = (f) => {
    if (!f) return;
    if (!/\.(xlsx|csv)$/i.test(f.name)) {
      toast.error('El archivo debe ser .xlsx o .csv');
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Selecciona un archivo .xlsx o .csv');
    try {
      await importar(file).unwrap();
      toast.success('Archivo procesado');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo importar el archivo');
    }
  };

  const descargarPlantillaCSV = () => {
    const blob = new Blob([HEADERS.join(',') + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_estudiantes_acudiente.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pn-layout pn-solo" data-role="admin">
      <main className="pn-main pn-narrow">
        <Link to="/admin" className="pn-back">
          <i className="fas fa-arrow-left" aria-hidden="true"></i> Volver al panel
        </Link>

        <header className="pn-header">
          <div className="pn-header-text">
            <h1>Importar estudiantes</h1>
            <p>Carga de una vez los estudiantes y sus acudientes desde un archivo Excel o CSV.</p>
          </div>
          <button type="button" className="pn-btn-ghost" onClick={descargarPlantillaCSV}>
            <i className="fas fa-download" aria-hidden="true"></i> Descargar plantilla
          </button>
        </header>

        <form onSubmit={onSubmit} className="pn-card pn-panel">
          {/* Zona para soltar o elegir el archivo */}
          <label
            className={`pn-drop pn-drop-big ${dragging ? 'is-dragging' : ''}`}
            htmlFor="archivo-import"
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files?.[0]); }}
          >
            <i className={`fas ${file ? 'fa-file-excel' : 'fa-cloud-arrow-up'}`} aria-hidden="true"></i>
            {file ? (
              <span><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(1)} KB · clic para cambiar</small></span>
            ) : (
              <span><strong>Arrastra tu archivo aquí</strong><small>o haz clic para elegirlo (.xlsx o .csv)</small></span>
            )}
            <input id="archivo-import" type="file" accept=".xlsx,.csv"
              onChange={(e) => acceptFile(e.target.files?.[0])} />
          </label>

          <div className="pn-form-actions">
            <button type="submit" className="pn-btn" disabled={isLoading || !file}>
              {isLoading ? (
                <><span className="pn-spinner-sm" aria-hidden="true"></span>Importando…</>
              ) : (
                <><i className="fas fa-upload" aria-hidden="true"></i>Subir archivo</>
              )}
            </button>
          </div>
        </form>

        {isError && (
          <section className="pn-card pn-panel pn-result is-error" role="alert">
            <h2><i className="fas fa-circle-exclamation" aria-hidden="true"></i> No se pudo importar</h2>
            <pre>{JSON.stringify(error?.data || error, null, 2)}</pre>
          </section>
        )}

        {data && (
          <section className="pn-card pn-panel pn-result" aria-live="polite">
            <h2><i className="fas fa-circle-check" aria-hidden="true"></i> Resultado</h2>
            <div className="pn-kpis">
              <div className="pn-kpi"><div><strong>{data.procesadas}</strong><span>Filas procesadas</span></div></div>
              <div className="pn-kpi"><div><strong>{data.estudiantes_creados}</strong><span>Estudiantes creados</span></div></div>
              <div className="pn-kpi"><div><strong>{data.acudientes_creados}</strong><span>Acudientes creados</span></div></div>
              <div className="pn-kpi"><div><strong>{data.links_creados}</strong><span>Relaciones creadas</span></div></div>
            </div>

            {Array.isArray(data.errores) && data.errores.length > 0 && (
              <>
                <h3>Filas con errores</h3>
                <div className="pn-table-wrap">
                  <table className="pn-table">
                    <thead><tr><th>Fila</th><th>Detalle</th></tr></thead>
                    <tbody>
                      {data.errores.map((e, i) => (
                        <tr key={i}><td>{e.fila}</td><td>{e.error}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}

        <section className="pn-card pn-panel" aria-label="Formato del archivo">
          <h2>Encabezados requeridos</h2>
          <p className="pn-muted">
            Incluye <code>curso_id</code> <em>o</em> <code>curso_nombre</code> (si envías ambos se usa <code>curso_id</code>), y además:
          </p>
          <ul className="pn-bullets">
            <li><code>estudiante_nombre</code>, <code>estudiante_apellido</code>, <code>estudiante_fecha_nacimiento</code></li>
            <li><code>estudiante_direccion</code>, <code>estudiante_telefono</code>, <code>estudiante_correo</code></li>
            <li><code>acudiente_tipo_documento</code>, <code>acudiente_numero_documento</code></li>
            <li><code>acudiente_nombre</code>, <code>acudiente_apellido</code>, <code>acudiente_telefono</code></li>
            <li><code>acudiente_direccion</code>, <code>acudiente_email</code>, <code>parentesco</code></li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default ImportEstudiantes;
