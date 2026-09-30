// src/components/views/Acudiente/EventosAcudiente.jsx
import React from 'react';
import EventCarousel from '../../widgets/EventCarousel';

/*
  Los eventos que ve la familia son los mismos que ve el profesor: los próximos eventos que crea el
  administrador. Antes esta pantalla tenía su propia lista y un alert() feo; ahora reutiliza las
  tarjetas con ventana de detalle de EventCarousel.
*/
const EventosAcudiente = () => <EventCarousel />;

export default EventosAcudiente;
