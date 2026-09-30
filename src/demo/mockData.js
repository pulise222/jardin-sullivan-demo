// src/demo/mockData.js
/*
  DATOS DE EJEMPLO de la versión demo.
  Aquí se construye, una sola vez, una "base de datos" pequeña en memoria con lo mismo que
  tendría el backend real: personas, estudiantes, cursos, materias, asignaciones profesor-curso-materia,
  eventos, actividades con sus entregas y asistencias.

  Todos los nombres son inventados. Los datos de fechas son RELATIVOS a hoy (por ejemplo, los
  eventos siempre quedan "próximos") para que la demo se vea viva sin importar cuándo se abra.
*/
import pelados from '../assets/pelados.png';
import pelados2 from '../assets/pelados2.png';
import jugando from '../assets/niños-jugando.png';
import baile from '../assets/baile.png';
import evento01 from '../assets/evento01.jpeg';

const hoy = new Date();
const ANIO = hoy.getFullYear();
const iso = (d) => d.toISOString().slice(0, 10);
const enDias = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

// Generador pseudoaleatorio con semilla: siempre produce los mismos números (datos estables)
let seed = 7;
const rnd = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

/* ---------- Cursos y materias ---------- */
const cursos = [
  { id: 1, nombre_curso: 'Párvulos A', descripcion: 'Niños de 2 a 3 años. Primeros pasos en el juego y el lenguaje.' },
  { id: 2, nombre_curso: 'Párvulos B', descripcion: 'Niños de 2 a 3 años. Exploración sensorial y rutinas.' },
  { id: 3, nombre_curso: 'Pre-Jardín', descripcion: 'Niños de 3 a 4 años. Inicio de la pre-escritura y los números.' },
  { id: 4, nombre_curso: 'Jardín', descripcion: 'Niños de 4 a 5 años. Lectoescritura inicial y trabajo en equipo.' },
  { id: 5, nombre_curso: 'Transición', descripcion: 'Niños de 5 a 6 años. Preparación para primaria.' },
];

const materias = [
  { id: 1, nombre: 'Arte y Creatividad' },
  { id: 2, nombre: 'Lectoescritura' },
  { id: 3, nombre: 'Pensamiento Matemático' },
  { id: 4, nombre: 'Música y Movimiento' },
  { id: 5, nombre: 'Inglés Inicial' },
  { id: 6, nombre: 'Exploración del Medio' },
];

/* ---------- Personas (administrador, profesores y acudientes) ---------- */
const mkPersona = (id, nombre, apellido, username, rol, extra = {}) => ({
  id,
  nombre,
  apellido,
  telefono: `31${String(20000000 + id * 137311).slice(0, 8)}`,
  tipo_documento: 'CC',
  numero_documento: String(1000000000 + id * 7919),
  direccion: extra.direccion || `Calle ${10 + id} # ${3 + id}-${20 + id}, Bogotá`,
  fecha_nacimiento: `${1980 + (id % 15)}-${String((id % 12) + 1).padStart(2, '0')}-${String((id % 27) + 1).padStart(2, '0')}`,
  foto_url: null,
  usuario: { id, username, email: `${username}@ejemplo.com`, rol },
});

const personas = [
  mkPersona(1, 'Laura', 'Gómez', 'admin', 'Administrador'),
  mkPersona(2, 'Carlos', 'Ramírez', 'profesor', 'Profesor'),
  mkPersona(3, 'Marcela', 'Torres', 'marcela.torres', 'Profesor'),
  mkPersona(4, 'Andrés', 'Rojas', 'andres.rojas', 'Profesor'),
  mkPersona(5, 'Diana', 'Martínez', 'acudiente', 'Acudiente'),
  mkPersona(6, 'Jorge', 'Pérez', 'jorge.perez', 'Acudiente'),
  mkPersona(7, 'Sandra', 'López', 'sandra.lopez', 'Acudiente'),
  mkPersona(8, 'Felipe', 'Castro', 'felipe.castro', 'Acudiente'),
  mkPersona(9, 'Paola', 'Vargas', 'paola.vargas', 'Acudiente'),
  mkPersona(10, 'Ricardo', 'Mejía', 'ricardo.mejia', 'Acudiente'),
  mkPersona(11, 'Natalia', 'Silva', 'natalia.silva', 'Acudiente'),
  mkPersona(12, 'Camilo', 'Ortiz', 'camilo.ortiz', 'Acudiente'),
];

/* ---------- Estudiantes (4 a 5 por curso) ---------- */
const NOMBRES = [
  ['Sofía', 'Martínez', 1], ['Mateo', 'Martínez', 1], ['Valentina', 'Pérez', 1], ['Santiago', 'López', 1], ['Isabella', 'Castro', 1],
  ['Emilio', 'Vargas', 2], ['Luciana', 'Mejía', 2], ['Samuel', 'Silva', 2], ['Mariana', 'Ortiz', 2], ['Tomás', 'Rojas', 2],
  ['Antonia', 'Martínez', 3], ['Julián', 'Pérez', 3], ['Gabriela', 'López', 3], ['Nicolás', 'Castro', 3], ['Renata', 'Vargas', 3],
  ['Martín', 'Mejía', 4], ['Salomé', 'Silva', 4], ['Dylan', 'Ortiz', 4], ['Emma', 'Gómez', 4], ['Lucas', 'Torres', 4],
  ['Juliana', 'Ramírez', 5], ['Benjamín', 'Pérez', 5], ['Amelia', 'López', 5], ['Thiago', 'Castro', 5],
];

const estudiantes = NOMBRES.map(([nombre, apellido, curso], i) => ({
  id: i + 1,
  nombre,
  apellido,
  tipo_documento: 'RC',
  numero_documento: String(1100000000 + (i + 1) * 4177),
  telefono: `32${String(10000000 + (i + 1) * 91357).slice(0, 8)}`,
  direccion: `Carrera ${5 + i} # ${12 + i}-${30 + i}, Bogotá`,
  correo_electronico: `acudiente.${apellido.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}${i + 1}@ejemplo.com`,
  fecha_nacimiento: `${ANIO - 2 - curso}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
  curso,
  foto: null,
  foto_url: null,
}));

/* ---------- Relación acudiente ↔ estudiante ---------- */
// Diana Martínez (la cuenta "acudiente" de la demo) tiene a Sofía, Mateo y Antonia
const acudientes = [
  { persona: 5, estudiante: 1, parentesco: 'Madre' },
  { persona: 5, estudiante: 2, parentesco: 'Madre' },
  { persona: 5, estudiante: 11, parentesco: 'Madre' },
  { persona: 6, estudiante: 3, parentesco: 'Padre' },
  { persona: 6, estudiante: 12, parentesco: 'Padre' },
  { persona: 7, estudiante: 4, parentesco: 'Madre' },
  { persona: 7, estudiante: 13, parentesco: 'Madre' },
  { persona: 8, estudiante: 5, parentesco: 'Padre' },
  { persona: 8, estudiante: 14, parentesco: 'Padre' },
  { persona: 9, estudiante: 6, parentesco: 'Madre' },
  { persona: 9, estudiante: 15, parentesco: 'Madre' },
  { persona: 10, estudiante: 7, parentesco: 'Padre' },
  { persona: 10, estudiante: 16, parentesco: 'Padre' },
  { persona: 11, estudiante: 8, parentesco: 'Madre' },
  { persona: 11, estudiante: 17, parentesco: 'Madre' },
  { persona: 12, estudiante: 9, parentesco: 'Padre' },
  { persona: 12, estudiante: 18, parentesco: 'Padre' },
];

/* ---------- Asignaciones profesor-curso-materia (CPM) ---------- */
// La cuenta "profesor" (Carlos, persona 2) tiene 4 asignaciones: verá varios cursos
const cpms = [
  { id: 1, persona: 2, curso: 1, materia: 1 },
  { id: 2, persona: 2, curso: 1, materia: 2 },
  { id: 3, persona: 2, curso: 3, materia: 1 },
  { id: 4, persona: 2, curso: 4, materia: 3 },
  { id: 5, persona: 3, curso: 2, materia: 4 },
  { id: 6, persona: 3, curso: 5, materia: 5 },
  { id: 7, persona: 4, curso: 2, materia: 6 },
  { id: 8, persona: 4, curso: 3, materia: 3 },
];

/* ---------- Eventos (siempre en el futuro) ---------- */
const eventos = [
  { id_evento: 1, titulo: 'Día de la Familia', descripcion: 'Una mañana de juegos, música y almuerzo compartido con las familias del jardín.', fecha_inicio: enDias(12).toISOString(), imagen_url: pelados },
  { id_evento: 2, titulo: 'Muestra artística', descripcion: 'Los niños presentan sus trabajos de pintura, plastilina y collage del periodo.', fecha_inicio: enDias(26).toISOString(), imagen_url: jugando },
  { id_evento: 3, titulo: 'Festival de baile', descripcion: 'Presentaciones de danza por cursos. ¡Traer ropa cómoda y mucha energía!', fecha_inicio: enDias(40).toISOString(), imagen_url: baile },
  { id_evento: 4, titulo: 'Charla de nutrición', descripcion: 'Conversatorio con una nutricionista sobre loncheras saludables y hábitos de alimentación.', fecha_inicio: enDias(55).toISOString(), imagen_url: null },
  { id_evento: 5, titulo: 'Salida pedagógica al parque', descripcion: 'Jornada al aire libre para explorar la naturaleza: observar, tocar y descubrir.', fecha_inicio: enDias(70).toISOString(), imagen_url: pelados2 },
  { id_evento: 6, titulo: 'Graduación de Transición', descripcion: 'Ceremonia de cierre de año para los niños que pasan a primaria.', fecha_inicio: enDias(150).toISOString(), imagen_url: evento01 },
];

/* ---------- Periodos del año (trimestres) ---------- */
const periodos = [1, 2, 3, 4].map((n) => {
  const ini = new Date(ANIO, (n - 1) * 3, 1);
  const fin = new Date(ANIO, n * 3, 0);
  return { id: n, anio: ANIO, numero: n, nombre: `Periodo ${n}`, fecha_inicio: iso(ini), fecha_fin: iso(fin), activo: n === 3 };
});

/* ---------- Actividades, entregas y asistencia ---------- */
const TITULOS = {
  1: ['Dactilopintura con manos', 'Collage de hojas y flores', 'Mi familia en plastilina'],
  2: ['Reconozco mi nombre', 'Las vocales con canciones', 'Trazos y líneas'],
  3: ['Cuento con números', 'Clasificamos por colores', 'Contamos hasta diez'],
  4: ['Ritmo con instrumentos', 'Baile de los animales', 'Canción del saludo'],
  5: ['Colors and shapes', 'My family', 'Numbers 1 to 5'],
  6: ['Mi huerta en casa', 'Los animales de la granja', 'El ciclo del agua'],
};

const actividades = [];
const entregas = [];
let idAct = 1;
let idEnt = 1;

cpms.forEach((cpm) => {
  const est = estudiantes.filter((e) => e.curso === cpm.curso);
  (TITULOS[cpm.materia] || TITULOS[1]).forEach((titulo, k) => {
    // Una actividad por cada uno de los primeros tres periodos
    const p = periodos[k];
    const fecha = new Date(p.fecha_inicio);
    fecha.setDate(fecha.getDate() + 18);
    const esLaUltima = k === 2;
    const a = {
      id: idAct++,
      titulo,
      descripcion: `Actividad de ${materias.find((m) => m.id === cpm.materia).nombre.toLowerCase()} para trabajar en clase y reforzar en casa.`,
      fecha: iso(esLaUltima ? enDias(-6) : fecha),
      fecha_entrega: iso(esLaUltima ? enDias(8) : new Date(fecha.getTime() + 7 * 864e5)),
      cpm: cpm.id,
      curso: cpm.curso,
    };
    actividades.push(a);
    est.forEach((e, j) => {
      const entregada = esLaUltima ? j % 2 === 0 : true;
      const nota = entregada && (!esLaUltima || j % 4 === 0) ? Math.round((3.2 + rnd() * 1.8) * 10) / 10 : null;
      entregas.push({
        id: idEnt++,
        actividad: a.id,
        estudiante: e.id,
        entregado_en: entregada ? new Date(new Date(a.fecha).getTime() + 2 * 864e5).toISOString() : null,
        calificacion: nota,
        entregable_url: null,
      });
    });
  });
});

// Asistencia: 4 clases recientes (días de semana) para cada asignación
const asistencias = [];
const fechasAsistencia = [];
for (let d = 1; fechasAsistencia.length < 4; d++) {
  const f = enDias(-d);
  if (f.getDay() !== 0 && f.getDay() !== 6) fechasAsistencia.unshift(iso(f));
}
cpms.forEach((cpm) => {
  estudiantes.filter((e) => e.curso === cpm.curso).forEach((e) => {
    fechasAsistencia.forEach((f) => {
      const r = rnd();
      asistencias.push({ cpm: cpm.id, estudiante: e.id, fecha: f, estado: r < 0.78 ? 'Presente' : r < 0.9 ? 'Tarde' : 'Ausente' });
    });
  });
});

// Logros que se muestran en el boletín del acudiente
const logros = [
  'Participa con entusiasmo en las actividades propuestas.',
  'Sigue instrucciones sencillas y trabaja en equipo.',
  'Expresa sus ideas y emociones con confianza.',
];

export const seedDb = () => ({
  cursos,
  materias,
  personas,
  estudiantes,
  acudientes,
  cpms,
  eventos,
  periodos,
  actividades,
  entregas,
  asistencias,
  logros,
  next: { persona: 100, estudiante: 100, curso: 100, materia: 100, cpm: 100, evento: 100, actividad: 100, entrega: 10000 },
});

// Cuentas de la demo: usuario → contraseña (la misma para todas) y persona
export const DEMO_PASSWORD = 'Demo2026*';
