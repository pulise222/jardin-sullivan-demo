import React, { useMemo, useState } from 'react';
import { useGetBoletinEstudianteQuery } from '../../../features/academico/academicoApi';

const box = { border:'1px solid #ddd', borderRadius:8, padding:12, marginBottom:12 };
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 };
const tableWrap = { overflowX:'auto', marginTop:8 };
const tableCss = {
  width:'100%', borderCollapse:'collapse', fontSize:14,
  border:'1px solid #ccc'
};
const thtd = { border:'1px solid #ccc', padding:'6px 8px', verticalAlign:'top' };

const BoletinCard = ({ estudiante, ctx }) => {
  const periodos = ctx?.periodos_disponibles || [];
  // Por UX: preseleccionar el último período cerrado si existe
  const defaultPeriodo = useMemo(
    () => (periodos.length ? periodos[periodos.length - 1] : ''),
    [periodos]
  );
  const [periodoSel, setPeriodoSel] = useState(defaultPeriodo);

  const hasParams = !!(periodoSel && estudiante?.curso?.id && estudiante?.id);
  const { data, isFetching, isError } = useGetBoletinEstudianteQuery(
    hasParams
      ? {
          cursoId: estudiante.curso.id,
          periodo: periodoSel,
          estudianteId: estudiante.id,
          anio: ctx.anio_actual
        }
      : { skipToken: true },
    { skip: !hasParams }
  );

  return (
    <div className="acu-card" style={{ ...box }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <img
            src={estudiante.foto_url || `${import.meta.env.BASE_URL}avatar.svg`}
            alt=""
            style={{ width:56, height:56, borderRadius:8, objectFit:'cover' }}
          />
          <div>
            <div><strong>{estudiante.nombre} {estudiante.apellido}</strong></div>
            <div className="muted">Curso: {estudiante.curso?.nombre_curso || '—'}</div>
          </div>
        </div>

        <div>
          <label>
            Período:&nbsp;
            <select
              value={periodoSel}
              onChange={e => setPeriodoSel(Number(e.target.value))}
              disabled={periodos.length === 0}
            >
              {periodos.length === 0 ? (
                <option value="">(Sin períodos cerrados)</option>
              ) : (
                <>
                  <option value="" disabled>Elegir…</option>
                  {periodos.map(p => <option key={p} value={p}>P{p}</option>)}
                </>
              )}
            </select>
          </label>
          &nbsp;&nbsp;
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.print()}
            disabled={!data}
            title="Imprimir con el navegador"
          >
            Imprimir
          </button>
        </div>
      </div>

      {/* Encabezados tipo “ficha” */}
      {periodoSel && (
        <div style={{ ...grid2, marginTop:12 }}>
          <div style={box}>
            <div style={{ fontWeight:'bold', marginBottom:6 }}>Estudiante</div>
            <div><strong>{estudiante.nombre} {estudiante.apellido}</strong></div>
            {estudiante.tipo_documento && (
              <div className="muted">Documento: {estudiante.tipo_documento} {estudiante.numero_documento || ''}</div>
            )}
            {estudiante.curso?.nombre_curso && (
              <div className="muted">Curso: {estudiante.curso.nombre_curso}</div>
            )}
          </div>

          <div style={box}>
            <div style={{ fontWeight:'bold', marginBottom:6 }}>Periodo</div>
            <div>Año lectivo: {ctx.anio_actual}</div>
            {data?.periodo && (
              <div className="muted">
                Fechas: {data.periodo.fecha_inicio} — {data.periodo.fecha_fin}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla tipo Excel */}
      {periodoSel && (
        <div style={{ marginTop:8 }}>
          {isFetching && <p>Cargando boletín…</p>}
          {isError && <p>Error cargando el boletín.</p>}
          {!isFetching && !isError && data && (
            <>
              <div style={tableWrap}>
                <table style={tableCss}>
                  <thead>
                    <tr>
                      <th style={thtd}>Materia</th>
                      <th style={thtd}>Promedio</th>
                      <th style={thtd}>Desempeño</th>
                      <th style={thtd}>Inasistencias</th>
                      <th style={thtd}>Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.materias?.length ? data.materias.map((fila, idx) => (
                      <tr key={idx}>
                        <td style={thtd}>
                          <strong>{fila.materia_nombre}</strong>
                          {fila.profesor && <div className="muted">Docente: {fila.profesor}</div>}
                        </td>
                        <td style={thtd}>{fila.promedio ?? '—'}</td>
                        <td style={thtd}>{fila.desempeno || '—'}</td>
                        <td style={thtd}>{fila.inasistencias ?? 0}</td>
                        <td style={thtd}>{fila.observacion_docente || ''}</td>
                      </tr>
                    )) : (
                      <tr><td style={thtd} colSpan={5}>Sin datos de materias para este período.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bloques de logros por materia (opcional, como en el Excel) */}
              {data.materias?.map((fila, i) => (
                (fila.logros && fila.logros.length > 0) ? (
                  <div key={`lg-${i}`} style={{ marginTop:10 }}>
                    <div style={{ fontWeight:'bold', marginBottom:6 }}>
                      Logros — {fila.materia_nombre}
                    </div>
                    <ul style={{ margin:'6px 0 0 18px' }}>
                      {fila.logros.map((lg, j) => (
                        <li key={j}>
                          {typeof lg === 'string' ? lg : `${lg.orden}. ${lg.descripcion}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              ))}

              {data.observaciones_generales && (
                <div style={{ ...box, marginTop:12 }}>
                  <div style={{ fontWeight:'bold', marginBottom:6 }}>Observaciones generales</div>
                  <div>{data.observaciones_generales}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BoletinCard;
