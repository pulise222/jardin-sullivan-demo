import React from 'react';
import { useMisEstudiantesQuery } from '../../../features/students/studentApi';
import { useGetContextoAcademicoQuery } from '../../../features/academico/academicoApi';
import BoletinCard from './BoletinCard';

const BoletinAcudiente = () => {
  const { data: hijos = [], isLoading: cargandoHijos } = useMisEstudiantesQuery();
  const { data: ctx, isLoading: cargandoCtx, isError } = useGetContextoAcademicoQuery();

  if (cargandoHijos || cargandoCtx) return <div className="acu-card"><p>Cargando…</p></div>;
  if (isError || !ctx) return <div className="acu-card"><p>No se pudo obtener contexto académico.</p></div>;

  return (
    <section className="acu-panel">
      <div className="acu-card">
        <h2 style={{marginTop:0}}>Boletines</h2>
        <p className="muted">
          Año actual: <strong>{ctx.anio_actual}</strong> · Período “actual”: <strong>{ctx.periodo_actual}</strong>
        </p>
        {ctx.periodos_disponibles?.length === 0 && (
          <p className="muted">Aún no hay períodos cerrados para descargar/visualizar.</p>
        )}
      </div>

      {hijos.length === 0 ? (
        <div className="acu-card">No tienes estudiantes vinculados.</div>
      ) : hijos.map(h => (
        <BoletinCard key={h.id} estudiante={h} ctx={ctx} />
      ))}
    </section>
  );
};

export default BoletinAcudiente;
