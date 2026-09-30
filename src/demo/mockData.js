// src/demo/mockData.js
/*
  DATOS DE EJEMPLO de la versión demo.
  Aquí se construye, una sola vez, una "base de datos" en memoria con lo mismo que tendría el
  backend real: personas, estudiantes, cursos, materias, asignaciones profesor-curso-materia,
  eventos, actividades con sus evaluaciones, asistencias y logros.

  Todos los nombres son inventados. Las fechas son RELATIVAS a hoy (por ejemplo, los eventos
  siempre quedan "próximos") para que la demo se vea viva sin importar cuándo se abra.

  Evaluación CUALITATIVA (igual que el proyecto real): 1 = Deficiente, 2 = Aceptable, 3 = Sobresaliente.
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
const mkPersona = (id, nombre, apellido, username, rol) => ({
  id,
  nombre,
  apellido,
  telefono: `31${String(20000000 + id * 137311).slice(0, 8)}`,
  tipo_documento: 'CC',
  numero_documento: String(1000000000 + id * 7919),
  direccion: `Calle ${10 + id} # ${3 + id}-${20 + id}, Bogotá`,
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

/* ---------- Estudiantes: 8 por curso ---------- */
const NOMBRES = [
  // Párvulos A
  ['Sofía', 'Martínez', 1], ['Mateo', 'Martínez', 1], ['Valentina', 'Pérez', 1], ['Santiago', 'López', 1],
  ['Isabella', 'Castro', 1], ['Emilio', 'Vargas', 1], ['Luciana', 'Mejía', 1], ['Samuel', 'Silva', 1],
  // Párvulos B
  ['Mariana', 'Ortiz', 2], ['Tomás', 'Rojas', 2], ['Antonia', 'Duarte', 2], ['Julián', 'Herrera', 2],
  ['Gabriela', 'Cárdenas', 2], ['Nicolás', 'Bermúdez', 2], ['Renata', 'Salazar', 2], ['Martín', 'Pardo', 2],
  // Pre-Jardín
  ['Emma', 'Niño', 3], ['Lucas', 'Cuesta', 3], ['Salomé', 'Suárez', 3], ['Dylan', 'Romero', 3],
  ['Amelia', 'Forero', 3], ['Thiago', 'Acosta', 3], ['Juliana', 'Patiño', 3], ['Benjamín', 'Quintero', 3],
  // Jardín
  ['Mía', 'Zapata', 4], ['Joaquín', 'Ríos', 4], ['Catalina', 'Ospina', 4], ['Felipe', 'Arango', 4],
  ['Victoria', 'Gil', 4], ['Sebastián', 'Mora', 4], ['Olivia', 'Paz', 4], ['Andrés', 'Lara', 4],
  // Transición
  ['Paulina', 'Vega', 5], ['Maximiliano', 'Cortés', 5], ['Violeta', 'Ibarra', 5], ['David', 'Navarro', 5],
  ['Lola', 'Prieto', 5], ['Gael', 'Montoya', 5], ['Regina', 'Calderón', 5], ['Ian', 'Bustos', 5],
];

const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const estudiantes = NOMBRES.map(([nombre, apellido, curso], i) => ({
  id: i + 1,
  nombre,
  apellido,
  tipo_documento: 'RC',
  numero_documento: String(1100000000 + (i + 1) * 4177),
  telefono: `32${String(10000000 + (i + 1) * 91357).slice(0, 8)}`,
  direccion: `Carrera ${5 + i} # ${12 + i}-${30 + i}, Bogotá`,
  correo_electronico: `familia.${sinTildes(apellido)}${i + 1}@ejemplo.com`,
  fecha_nacimiento: `${ANIO - 2 - curso}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
  curso,
  foto: null,
  foto_url: null,
}));

/* ---------- Relación acudiente ↔ estudiante ---------- */
// Diana Martínez (la cuenta "acudiente" de la demo) tiene 3 hijos: Sofía y Mateo (Párvulos A) y Emma (Pre-Jardín)
const acudientes = [
  { persona: 5, estudiante: 1, parentesco: 'Madre' },
  { persona: 5, estudiante: 2, parentesco: 'Madre' },
  { persona: 5, estudiante: 17, parentesco: 'Madre' },
];
// Al resto de los niños se les asigna un acudiente de las otras familias (6 a 12), de forma rotativa
estudiantes.forEach((e) => {
  if (acudientes.some((a) => a.estudiante === e.id)) return;
  acudientes.push({ persona: 6 + (e.id % 7), estudiante: e.id, parentesco: e.id % 2 ? 'Madre' : 'Padre' });
});

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

/* ---------- Periodos del año (4 trimestres) ---------- */
const periodos = [1, 2, 3, 4].map((n) => {
  const ini = new Date(ANIO, (n - 1) * 3, 1);
  const fin = new Date(ANIO, n * 3, 0);
  return { id: n, anio: ANIO, numero: n, nombre: `Periodo ${n}`, fecha_inicio: iso(ini), fecha_fin: iso(fin), activo: n === 3 };
});

/* ---------- Actividades: 4 por trimestre (T1, T2, T3) y por asignación = 12 ---------- */
const TITULOS = {
  1: [ // Arte y Creatividad
    ['Dactilopintura con las manos', 'Collage de hojas y flores', 'Mi familia en plastilina', 'Mezclamos colores primarios'],
    ['Sellos con frutas', 'Móvil de figuras', 'Pintura con esponjas', 'Mi animal favorito'],
    ['Títeres de papel', 'Mural de la clase', 'Modelado con arcilla', 'Mi autorretrato'],
  ],
  2: [ // Lectoescritura
    ['Reconozco mi nombre', 'Las vocales con canciones', 'Trazos y líneas', 'Letras en arena'],
    ['Rimas y trabalenguas', 'Mi cuento favorito', 'Sílabas con palmas', 'Cartas para un amigo'],
    ['Escribo mi nombre', 'Buscamos la letra M', 'Tarjeta para mamá', 'Palabras con dibujos'],
  ],
  3: [ // Pensamiento Matemático
    ['Cuento con números', 'Clasificamos por colores', 'Contamos hasta diez', 'Grande y pequeño'],
    ['Figuras geométricas', 'Patrones con bloques', 'Sumamos jugando', 'Formas en casa'],
    ['Contamos hasta veinte', 'Tren de los números', 'Más y menos', 'Medimos con pasos'],
  ],
  4: [ // Música y Movimiento
    ['Ritmo con instrumentos', 'Baile de los animales', 'Canción del saludo', 'Sonidos del cuerpo'],
    ['Rondas tradicionales', 'Tambores de la selva', 'Bailamos con pañuelos', 'Silencio y sonido'],
    ['Coro de la primavera', 'Maracas caseras', 'Estatuas musicales', 'Mi canción favorita'],
  ],
  5: [ // Inglés Inicial
    ['Colors and shapes', 'My family', 'Numbers 1 to 5', 'Hello and goodbye'],
    ['Animals song', 'Fruits and vegetables', 'Body parts', 'Weather today'],
    ['Toys in my room', 'Days of the week', 'Happy birthday', 'Numbers 6 to 10'],
  ],
  6: [ // Exploración del Medio
    ['Mi huerta en casa', 'Los animales de la granja', 'El ciclo del agua', 'Las plantas crecen'],
    ['Día y noche', 'Los cinco sentidos', 'Cuidamos el planeta', 'Las estaciones'],
    ['Insectos del jardín', 'Reciclamos juntos', 'Mi barrio', 'Oficios y profesiones'],
  ],
};

// Cada niño tiene una "tendencia" que hace las notas más realistas: fuerte, media o por apoyar
// Los hijos de la cuenta "acudiente" tienen una historia fija para que el boletín se vea interesante
const FIJOS = {
  1: { base: 'media', trayectoria: 'mejora' },    // Sofía: va mejorando cada trimestre
  2: { base: 'media', trayectoria: 'baja' },      // Mateo: empezó bien y necesita apoyo
  17: { base: 'fuerte', trayectoria: 'estable' }, // Emma: siempre destacada
};
const tendencia = (id) => {
  if (FIJOS[id]) return FIJOS[id].base;
  const r = (id * 37) % 100;
  return r < 35 ? 'fuerte' : r < 80 ? 'media' : 'apoyo';
};
// Los demás niños: un tercio mejora, un tercio baja un poco y un tercio se mantiene
const trayectoria = (id) => FIJOS[id]?.trayectoria || ['estable', 'mejora', 'baja'][id % 3];
const PESOS = { fuerte: [0.05, 0.25, 0.7], media: [0.12, 0.6, 0.28], apoyo: [0.5, 0.4, 0.1] };
// k = trimestre (0, 1, 2): el nivel base se desplaza según la trayectoria del niño
const nivelPara = (id, k = 0) => {
  const [a, b] = PESOS[tendencia(id)];
  const r = rnd();
  const base = r < a ? 1 : r < a + b ? 2 : 3;
  const t = trayectoria(id);
  const desplazo = t === 'mejora' ? (k >= 2 ? 1 : 0) : t === 'baja' ? (k >= 2 ? -1 : 0) : 0;
  return Math.min(3, Math.max(1, base + desplazo));
};

const actividades = [];
const entregas = [];
let idAct = 1;
let idEnt = 1;

cpms.forEach((cpm) => {
  const est = estudiantes.filter((e) => e.curso === cpm.curso);
  const porPeriodo = TITULOS[cpm.materia];
  porPeriodo.forEach((titulos, k) => {
    const p = periodos[k];
    titulos.forEach((titulo, j) => {
      const inicio = new Date(`${p.fecha_inicio}T00:00:00`);
      const fecha = new Date(inicio.getTime() + (12 + j * 20) * 864e5);
      const esLaUltima = k === 2 && j === titulos.length - 1; // la más reciente del T3: a medio evaluar
      const a = {
        id: idAct++,
        titulo,
        descripcion: `Actividad de ${materias.find((m) => m.id === cpm.materia).nombre.toLowerCase()} para trabajar en clase y reforzar en casa.`,
        fecha: iso(fecha),
        fecha_entrega: iso(new Date(fecha.getTime() + 5 * 864e5)),
        cpm: cpm.id,
        curso: cpm.curso,
        periodo: p.numero,
      };
      actividades.push(a);
      est.forEach((e, n) => {
        const sinEvaluar = esLaUltima && n % 2 === 1;
        entregas.push({
          id: idEnt++,
          actividad: a.id,
          estudiante: e.id,
          entregado_en: sinEvaluar ? null : new Date(fecha.getTime() + 864e5).toISOString(),
          calificacion: sinEvaluar ? null : nivelPara(e.id, k),
          entregable_url: null,
        });
      });
    });
  });
});

// Asistencia: 5 clases recientes (días de semana) para cada asignación
const asistencias = [];
const fechasAsistencia = [];
for (let d = 1; fechasAsistencia.length < 5; d++) {
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

// Logros que se muestran en el boletín del acudiente (por materia)
const logros = {
  'Arte y Creatividad': ['Explora colores y texturas con entusiasmo.', 'Expresa sus ideas mediante el dibujo y la pintura.', 'Comparte materiales con sus compañeros.'],
  'Lectoescritura': ['Reconoce su nombre escrito.', 'Identifica las vocales en canciones y rimas.', 'Realiza trazos controlados con el lápiz.'],
  'Pensamiento Matemático': ['Cuenta objetos hasta diez.', 'Clasifica por color, forma y tamaño.', 'Reconoce figuras geométricas básicas.'],
  'Música y Movimiento': ['Sigue el ritmo con su cuerpo.', 'Participa en rondas y canciones.', 'Disfruta explorando instrumentos.'],
  'Inglés Inicial': ['Reconoce palabras básicas en inglés.', 'Canta canciones sencillas en inglés.', 'Saluda y se despide en inglés.'],
  'Exploración del Medio': ['Observa y describe lo que ve en la naturaleza.', 'Cuida las plantas y los animales.', 'Hace preguntas sobre su entorno.'],
};

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

// Contraseña de todas las cuentas de la demo
export const DEMO_PASSWORD = 'Demo2026*';
