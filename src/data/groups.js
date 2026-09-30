// src/data/groups.js
// Datos de los grupos por edad. Se comparten entre la landing (Home) y la página de matrícula.

/*
  GRUPOS por edad. `color` es el fondo de la tarjeta y `ink` el color del texto
  encima (blanco sobre el rojo para que se lea bien).
*/
export const GROUPS = [
  {
    name: "Oruguitas",
    age: "1–3",
    description: "Pequeños exploradores que describen el mundo a través de los sentidos.",
    activities: ["Juegos sensoriales", "Rondas infantiles", "Manipulación de materiales", "Desarrollo de autonomía"],
    icon: "🐛",
    color: "#FEBF22",
    ink: "#1B3158",
  },
  {
    name: "Capullitos",
    age: "3–4",
    description: "Potentes comunicadores que expanden su mundo a través del lenguaje.",
    activities: ["Dramatizaciones", "Actividades artísticas", "Juegos colaborativos", "Desarrollo de independencia"],
    icon: "🦋",
    color: "#28A8E3",
    ink: "#0F2240",
  },
  {
    name: "Hormiguitas",
    age: "4–5",
    description: "Jóvenes científicos naturales que exploran mediante proyectos.",
    activities: ["Trabajo en equipo", "Resolución de desafíos", "Cultivo de huertas", "Pensamiento crítico"],
    icon: "🐜",
    color: "#93C524",
    ink: "#1B3158",
  },
  {
    name: "Colonizadores",
    age: "5–6",
    description: "Futuros líderes preparados para conquistar nuevos retos.",
    activities: ["Conceptos académicos", "Proyectos innovadores", "Tecnología responsable", "Desarrollo de resiliencia"],
    icon: "🚀",
    color: "#F25141",
    ink: "#FFFFFF",
  },
];
