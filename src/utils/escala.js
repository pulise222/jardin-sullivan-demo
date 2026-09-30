// src/utils/escala.js
/*
  Escala de evaluación CUALITATIVA del jardín (espejo de sullivan_django/academico/escala.py).
  A los niños no se les pone un número de 0 a 5 sino un nivel:

      1 = Deficiente      2 = Aceptable      3 = Sobresaliente

  Cada nivel se guarda como un código (1, 2 o 3) para poder promediarlo.
  `chip` es la clase de color de las etiquetas del panel (ver styles/panel.css):
  semáforo: rojo (Deficiente), amarillo (Aceptable) y verde (Sobresaliente); ver Profe.css.
*/
export const NIVELES = [
  { codigo: 1, etiqueta: 'Deficiente', chip: 'lvl-1' },
  { codigo: 2, etiqueta: 'Aceptable', chip: 'lvl-2' },
  { codigo: 3, etiqueta: 'Sobresaliente', chip: 'lvl-3' },
];

export const SIN_EVALUAR = 'Sin evaluar';

// código (1-3, número o texto) -> objeto del nivel, o undefined si no hay nota
export const nivelDe = (codigo) => NIVELES.find((n) => n.codigo === Number(codigo));

export const etiquetaDe = (codigo) => nivelDe(codigo)?.etiqueta ?? SIN_EVALUAR;

/*
  Promedio cualitativo: media de los códigos, redondeada al nivel más cercano.
  Los vacíos (sin evaluar) no cuentan. Devuelve el nivel o null si no hay ninguna nota.
  Ojo: Math.round(2.5) = 3 (sube), igual que ROUND_HALF_UP en el backend.
  Se usa para la vista previa mientras el profesor edita; el valor oficial lo calcula el backend.
*/
export const promedioNivel = (codigos) => {
  const validos = codigos.map(Number).filter((c) => c >= 1 && c <= 3);
  if (!validos.length) return null;
  const media = validos.reduce((a, b) => a + b, 0) / validos.length;
  return nivelDe(Math.round(media)) ?? null;
};
