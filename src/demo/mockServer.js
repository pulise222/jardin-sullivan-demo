// src/demo/mockServer.js
/*
  SERVIDOR FALSO (solo para la versión demo).

  En el proyecto real, el front le habla a Django por HTTP. Aquí reemplazamos ese viaje por una
  función que contesta al instante con datos de ejemplo guardados en memoria. El truco es que
  RTK Query (la librería que hace las peticiones) acepta cualquier "baseQuery": una función que recibe
  { url, method, body } y devuelve { data } o { error }. Así NINGUNA pantalla tuvo que cambiar.

  - Los cambios que hagas (crear estudiantes, poner notas, tomar asistencia…) se guardan en el
    localStorage del navegador: sobreviven a recargar la página, pero solo los ves tú.
  - Para volver a los datos originales: botón "Restablecer demo" en la pantalla de login
    (o borrar el localStorage del sitio).
*/
import { seedDb, DEMO_PASSWORD } from './mockData';

const KEY = 'sullivan_demo_db_v1';

/* ---------- "Base de datos" en memoria + persistencia ---------- */
let db;
const cargar = () => {
  try {
    const guardada = localStorage.getItem(KEY);
    if (guardada) return JSON.parse(guardada);
  } catch {
    /* si el navegador bloquea el almacenamiento, usamos solo la memoria */
  }
  return seedDb();
};
db = cargar();

const guardar = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* sin almacenamiento: los cambios duran hasta recargar */
  }
};

export const restablecerDemo = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada */
  }
  db = seedDb();
};

const nextId = (tabla) => db.next[tabla]++;

/* ---------- Ayudas ---------- */
const ok = (data, status = 200) => ({ data, meta: { status } });
const fail = (status, detail) => ({ error: { status, data: { detail } } });
const sinTildes = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Quién está logueado: el "token" falso es demo.<id de usuario>
const usuarioActual = () => {
  const t = localStorage.getItem('access') || '';
  const id = Number(t.split('.')[1]);
  return db.personas.find((p) => p.usuario.id === id) || null;
};

// Convierte FormData a objeto simple (los archivos pasan a URL local temporal)
const leerBody = (body) => {
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const o = {};
    body.forEach((v, k) => {
      o[k] = v instanceof File ? { __file: URL.createObjectURL(v), name: v.name } : v;
    });
    return o;
  }
  return body || {};
};

const cursoMini = (id) => {
  const c = db.cursos.find((x) => x.id === Number(id));
  return c ? { id: c.id, nombre_curso: c.nombre_curso } : null;
};
const materiaMini = (id) => db.materias.find((x) => x.id === Number(id)) || null;
const personaMini = (id) => {
  const p = db.personas.find((x) => x.id === Number(id));
  return p ? { id: p.id, nombre: p.nombre, apellido: p.apellido } : null;
};

const cpmFull = (c) => ({
  id: c.id,
  curso: cursoMini(c.curso),
  materia: materiaMini(c.materia),
  persona: personaMini(c.persona),
});

const estudianteMini = (e) => ({
  id: e.id, nombre: e.nombre, apellido: e.apellido,
  tipo_documento: e.tipo_documento, numero_documento: e.numero_documento,
  telefono: e.telefono, direccion: e.direccion, correo_electronico: e.correo_electronico,
  fecha_nacimiento: e.fecha_nacimiento, curso: cursoMini(e.curso), foto_url: e.foto_url,
});

const desempeno = (n) => (n == null ? 'SIN NOTA' : n < 3 ? 'BAJO' : n < 4 ? 'BÁSICO' : n <= 4.5 ? 'ALTO' : 'SUPERIOR');
const redondear = (n) => (n == null ? null : Math.round(n * 10) / 10);

/* ---------- Tabla de rutas: [método, patrón, manejador] ---------- */
// El patrón se compara contra la ruta sin "/" inicial ni final. Los grupos () llegan como parámetros.
const rutas = [];
const ruta = (metodo, patron, fn) => rutas.push([metodo, new RegExp(`^${patron}$`), fn]);

/* --- Usuarios / autenticación --- */
ruta('POST', 'usuarios/login', ({ body }) => {
  const p = db.personas.find((x) => x.usuario.username === body.username);
  if (!p || body.password !== DEMO_PASSWORD) return fail(400, 'Credenciales incorrectas.');
  const { id, username, email, rol } = p.usuario;
  return ok({ access: `demo.${id}`, refresh: `demo.${id}`, usuario: { id, username, email, rol } });
});
ruta('POST', 'api/token/refresh', () => ok({ access: localStorage.getItem('access') }));
ruta('POST', 'registro', () => ok({ detail: 'Registro deshabilitado en la demo.' }, 201));
ruta('POST', 'usuarios/auth/password-reset', () => ok({ detail: 'Si el usuario existe, enviamos un correo (demo).' }));
ruta('POST', 'usuarios/auth/password-reset/confirm', () => ok({ detail: 'Contraseña actualizada (demo).' }));

/* --- Personas --- */
ruta('GET', 'personas/me', () => {
  const p = usuarioActual();
  return p ? ok(p) : fail(404, 'Persona no encontrada para este usuario.');
});
ruta('PATCH', 'personas/me', ({ body }) => {
  const p = usuarioActual();
  if (!p) return fail(404, 'Persona no encontrada.');
  const { usuario, ...resto } = body;
  Object.assign(p, resto);
  if (usuario?.email) p.usuario.email = usuario.email;
  guardar();
  return ok(p);
});
ruta('GET', 'personas', () => ok(db.personas));
ruta('POST', 'personas', ({ body }) => {
  const id = nextId('persona');
  const u = body.usuario || {};
  const p = { foto_url: null, ...body, id, usuario: { id, username: u.username || u.email, email: u.email, rol: u.rol } };
  db.personas.push(p);
  guardar();
  return ok(p, 201);
});
ruta('GET', 'personas/buscar', ({ query }) => {
  const q = sinTildes(query.get('q') || '');
  const res = db.personas.filter((p) =>
    /^\d+$/.test(q) ? p.numero_documento.includes(q) : sinTildes(`${p.nombre} ${p.apellido}`).includes(q)
  );
  return ok(res.slice(0, 20));
});
ruta('POST', 'personas/importar-estudiantes', () =>
  ok({ procesadas: 0, estudiantes_creados: 0, acudientes_creados: 0, links_creados: 0, errores: [
    { fila: 0, error: 'Modo demostración: el archivo no se procesa ni se guarda nada.' },
  ] })
);
ruta('GET', 'personas/(\\d+)/cursos-materias', ({ m }) =>
  ok(db.cpms.filter((c) => c.persona === Number(m[1])).map(cpmFull))
);
ruta('POST', 'personas/(\\d+)/cursos/(\\d+)/materias/(\\d+)/asignar', ({ m }) => {
  const [persona, curso, materia] = [1, 2, 3].map((i) => Number(m[i]));
  let c = db.cpms.find((x) => x.persona === persona && x.curso === curso && x.materia === materia);
  if (!c) { c = { id: nextId('cpm'), persona, curso, materia }; db.cpms.push(c); guardar(); }
  return ok(cpmFull(c), 201);
});
ruta('POST', 'personas/(\\d+)/avatar', ({ m, body }) => {
  const p = db.personas.find((x) => x.id === Number(m[1]));
  if (p && body.foto?.__file) p.foto_url = body.foto.__file;
  return ok(p);
});
ruta('DELETE', 'personas/(\\d+)/avatar', ({ m }) => {
  const p = db.personas.find((x) => x.id === Number(m[1]));
  if (p) p.foto_url = null;
  return ok(p);
});
ruta('GET', 'personas/(\\d+)', ({ m }) => {
  const p = db.personas.find((x) => x.id === Number(m[1]));
  return p ? ok(p) : fail(404, 'No encontrada.');
});
ruta('PATCH', 'personas/(\\d+)', ({ m, body }) => {
  const p = db.personas.find((x) => x.id === Number(m[1]));
  if (!p) return fail(404, 'No encontrada.');
  const { usuario, ...resto } = body;
  Object.assign(p, resto);
  if (usuario) Object.assign(p.usuario, { email: usuario.email ?? p.usuario.email, rol: usuario.rol ?? p.usuario.rol });
  guardar();
  return ok(p);
});
ruta('DELETE', 'personas/(\\d+)', ({ m }) => {
  const id = Number(m[1]);
  db.personas = db.personas.filter((p) => p.id !== id);
  db.acudientes = db.acudientes.filter((a) => a.persona !== id);
  db.cpms = db.cpms.filter((c) => c.persona !== id);
  guardar();
  return ok(null, 204);
});

/* --- Estudiantes --- */
ruta('GET', 'estudiantes', () => ok(db.estudiantes));
ruta('POST', 'estudiantes', ({ body }) => {
  const e = { foto: null, foto_url: null, ...body, id: nextId('estudiante'), curso: Number(body.curso) || null };
  db.estudiantes.unshift(e);
  guardar();
  return ok(e, 201);
});
ruta('GET', 'estudiantes/acudientes/mis-estudiantes', () => {
  const yo = usuarioActual();
  const ids = db.acudientes.filter((a) => a.persona === yo?.id).map((a) => a.estudiante);
  return ok(db.estudiantes.filter((e) => ids.includes(e.id)).map(estudianteMini));
});
ruta('GET', 'estudiantes/(\\d+)/acudientes', ({ m }) => {
  const ids = db.acudientes.filter((a) => a.estudiante === Number(m[1])).map((a) => a.persona);
  return ok(db.personas.filter((p) => ids.includes(p.id)));
});
ruta('POST', 'estudiantes/(\\d+)/acudientes', ({ m, body }) => {
  const estudiante = Number(m[1]);
  const persona = Number(body.persona_id);
  if (!db.acudientes.some((a) => a.estudiante === estudiante && a.persona === persona)) {
    db.acudientes.push({ persona, estudiante, parentesco: body.parentesco || 'Acudiente' });
    guardar();
  }
  const ids = db.acudientes.filter((a) => a.estudiante === estudiante).map((a) => a.persona);
  return ok(db.personas.filter((p) => ids.includes(p.id)), 201);
});
ruta('DELETE', 'estudiantes/(\\d+)/acudientes/(\\d+)', ({ m }) => {
  db.acudientes = db.acudientes.filter((a) => !(a.estudiante === Number(m[1]) && a.persona === Number(m[2])));
  guardar();
  return ok(null, 204);
});
ruta('POST', 'estudiantes/(\\d+)/avatar', ({ m, body }) => {
  const e = db.estudiantes.find((x) => x.id === Number(m[1]));
  if (e && body.foto?.__file) e.foto_url = body.foto.__file;
  return ok(e);
});
ruta('DELETE', 'estudiantes/(\\d+)/avatar', ({ m }) => {
  const e = db.estudiantes.find((x) => x.id === Number(m[1]));
  if (e) e.foto_url = null;
  return ok(e);
});
ruta('GET', 'estudiantes/(\\d+)', ({ m }) => {
  const e = db.estudiantes.find((x) => x.id === Number(m[1]));
  return e ? ok(e) : fail(404, 'No encontrado.');
});
ruta('PUT', 'estudiantes/(\\d+)', ({ m, body }) => {
  const e = db.estudiantes.find((x) => x.id === Number(m[1]));
  if (!e) return fail(404, 'No encontrado.');
  Object.assign(e, body, { curso: Number(body.curso) || null });
  guardar();
  return ok(e);
});
ruta('DELETE', 'estudiantes/(\\d+)', ({ m }) => {
  const id = Number(m[1]);
  db.estudiantes = db.estudiantes.filter((e) => e.id !== id);
  db.acudientes = db.acudientes.filter((a) => a.estudiante !== id);
  guardar();
  return ok(null, 204);
});

/* --- Cursos, materias y asignaciones (CRUD simples) --- */
const crud = (base, tabla, secuencia, alGuardar = (x) => x) => {
  ruta('GET', base, () => ok(db[tabla]));
  ruta('POST', base, ({ body }) => {
    const item = alGuardar({ ...body, id: nextId(secuencia) });
    db[tabla].push(item);
    guardar();
    return ok(item, 201);
  });
  ruta('PUT', `${base}/(\\d+)`, ({ m, body }) => {
    const item = db[tabla].find((x) => x.id === Number(m[1]));
    if (!item) return fail(404, 'No encontrado.');
    Object.assign(item, body);
    guardar();
    return ok(item);
  });
  ruta('DELETE', `${base}/(\\d+)`, ({ m }) => {
    db[tabla] = db[tabla].filter((x) => x.id !== Number(m[1]));
    guardar();
    return ok(null, 204);
  });
};
crud('cursos', 'cursos', 'curso');
crud('materias', 'materias', 'materia');
ruta('GET', 'cursos/(\\d+)/estudiantes', ({ m }) => ok(db.estudiantes.filter((e) => e.curso === Number(m[1]))));

ruta('GET', 'asignaciones', () => ok(db.cpms.map(cpmFull)));
ruta('POST', 'asignaciones', ({ body }) => {
  const c = { id: nextId('cpm'), curso: Number(body.curso_id), materia: Number(body.materia_id), persona: Number(body.persona_id) };
  db.cpms.push(c);
  guardar();
  return ok(cpmFull(c), 201);
});
ruta('PUT', 'asignaciones/(\\d+)', ({ m, body }) => {
  const c = db.cpms.find((x) => x.id === Number(m[1]));
  if (!c) return fail(404, 'No encontrada.');
  Object.assign(c, { curso: Number(body.curso_id), materia: Number(body.materia_id), persona: Number(body.persona_id) });
  guardar();
  return ok(cpmFull(c));
});
ruta('DELETE', 'asignaciones/(\\d+)', ({ m }) => {
  db.cpms = db.cpms.filter((c) => c.id !== Number(m[1]));
  guardar();
  return ok(null, 204);
});

/* --- Eventos --- */
const evento = (b, base = {}) => ({
  ...base,
  titulo: b.titulo ?? base.titulo,
  descripcion: b.descripcion ?? base.descripcion ?? '',
  fecha_inicio: b.fecha_inicio ?? base.fecha_inicio,
  imagen_url: b.imagen?.__file ?? base.imagen_url ?? null,
});
ruta('GET', 'eventos', () => ok([...db.eventos].sort((a, b) => b.fecha_inicio.localeCompare(a.fecha_inicio))));
ruta('GET', 'eventos/proximos', ({ query }) => {
  const limite = Math.max(1, Math.min(Number(query.get('limit')) || 10, 50));
  const ahora = new Date().toISOString();
  return ok(db.eventos.filter((e) => e.fecha_inicio >= ahora).sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio)).slice(0, limite));
});
ruta('POST', 'eventos', ({ body }) => {
  const e = evento(body, { id_evento: nextId('evento') });
  db.eventos.push(e);
  guardar();
  return ok(e, 201);
});
ruta('PATCH', 'eventos/(\\d+)', ({ m, body }) => {
  const i = db.eventos.findIndex((e) => e.id_evento === Number(m[1]));
  if (i < 0) return fail(404, 'No encontrado.');
  db.eventos[i] = evento(body, db.eventos[i]);
  guardar();
  return ok(db.eventos[i]);
});
ruta('DELETE', 'eventos/(\\d+)', ({ m }) => {
  db.eventos = db.eventos.filter((e) => e.id_evento !== Number(m[1]));
  guardar();
  return ok(null, 204);
});

/* --- Asistencia --- */
const resumenAsistencia = (cpmId) => {
  const c = db.cpms.find((x) => x.id === cpmId);
  if (!c) return null;
  const regs = db.asistencias.filter((a) => a.cpm === cpmId);
  const fechas = [...new Set(regs.map((r) => r.fecha))].sort();
  return {
    curso: cursoMini(c.curso),
    materia: materiaMini(c.materia),
    fechas,
    estudiantes: db.estudiantes.filter((e) => e.curso === c.curso).map((e) => ({
      id: e.id, nombre: e.nombre, apellido: e.apellido,
      asistencias: Object.fromEntries(regs.filter((r) => r.estudiante === e.id).map((r) => [r.fecha, r.estado])),
    })),
  };
};
ruta('GET', 'clases/asistencias/cpm/(\\d+)/resumen', ({ m }) => {
  const r = resumenAsistencia(Number(m[1]));
  return r ? ok(r) : fail(404, 'No encontrado.');
});
ruta('GET', 'clases/asistencias/cpm/(\\d+)/fechas', ({ m }) =>
  ok({ cpm_id: Number(m[1]), fechas: resumenAsistencia(Number(m[1]))?.fechas || [] })
);
ruta('POST', 'clases/asistencias/cpm/(\\d+)/upsert', ({ m, body }) => {
  const cpm = Number(m[1]);
  const estudiante = Number(body.estudiante_id);
  if (!['Presente', 'Tarde', 'Ausente'].includes(body.estado)) return fail(400, 'Estado inválido');
  const reg = db.asistencias.find((a) => a.cpm === cpm && a.estudiante === estudiante && a.fecha === body.fecha);
  if (reg) reg.estado = body.estado;
  else db.asistencias.push({ cpm, estudiante, fecha: body.fecha, estado: body.estado });
  guardar();
  return ok({ id: 1, created: !reg });
});

/* --- Actividades, entregas y notas --- */
// Un profesor solo ve las actividades de SUS asignaciones en ese curso
const actividadesDeCurso = (cursoId) => {
  const yo = usuarioActual();
  return db.actividades.filter((a) => {
    if (a.curso !== cursoId) return false;
    const cpm = db.cpms.find((c) => c.id === a.cpm);
    return !yo || yo.usuario.rol !== 'Profesor' || cpm?.persona === yo.id;
  });
};
const actividadPlana = (a) => ({ id: a.id, titulo: a.titulo, descripcion: a.descripcion, fecha: a.fecha, fecha_entrega: a.fecha_entrega, asignada_por: a.cpm });
const entregaPlana = (ae) => {
  const e = db.estudiantes.find((x) => x.id === ae.estudiante);
  return { id: ae.id, estudiante: ae.estudiante, estudiante_nombre: `${e?.nombre} ${e?.apellido}`, entregado_en: ae.entregado_en, calificacion: ae.calificacion, entregable_url: ae.entregable_url };
};

ruta('GET', 'actividades/curso/(\\d+)', ({ m }) => ok(actividadesDeCurso(Number(m[1])).map(actividadPlana)));
ruta('POST', 'actividades/curso/(\\d+)/crear', ({ m, body }) => {
  const curso = Number(m[1]);
  const a = { id: nextId('actividad'), titulo: body.titulo, descripcion: body.descripcion, fecha: body.fecha, fecha_entrega: body.fecha_entrega || null, cpm: Number(body.cpm_id), curso };
  db.actividades.push(a);
  // Cada estudiante del curso recibe su "entrega" pendiente, como hace el backend real
  db.estudiantes.filter((e) => e.curso === curso).forEach((e) =>
    db.entregas.push({ id: nextId('entrega'), actividad: a.id, estudiante: e.id, entregado_en: null, calificacion: null, entregable_url: null })
  );
  guardar();
  return ok(actividadPlana(a), 201);
});
ruta('PATCH', 'actividades/(\\d+)', ({ m, body }) => {
  const a = db.actividades.find((x) => x.id === Number(m[1]));
  if (!a) return fail(404, 'No encontrada.');
  Object.assign(a, body);
  guardar();
  return ok(actividadPlana(a));
});
ruta('DELETE', 'actividades/(\\d+)', ({ m }) => {
  const id = Number(m[1]);
  db.actividades = db.actividades.filter((a) => a.id !== id);
  db.entregas = db.entregas.filter((e) => e.actividad !== id);
  guardar();
  return ok(null, 204);
});
ruta('GET', 'actividades/actividad/(\\d+)/entregas', ({ m, query }) => {
  const estado = query.get('estado') || 'entregadas';
  let lista = db.entregas.filter((e) => e.actividad === Number(m[1]));
  if (estado === 'entregadas') lista = lista.filter((e) => e.entregado_en);
  if (estado === 'pendientes') lista = lista.filter((e) => !e.entregado_en);
  return ok(lista.map(entregaPlana));
});
ruta('PATCH', 'actividades/entrega/(\\d+)', ({ m, body }) => {
  const ae = db.entregas.find((x) => x.id === Number(m[1]));
  if (!ae) return fail(404, 'No encontrada.');
  Object.assign(ae, body);
  guardar();
  return ok(entregaPlana(ae));
});
ruta('POST', 'actividades/entrega/(\\d+)/archivo', ({ m }) => {
  const ae = db.entregas.find((x) => x.id === Number(m[1]));
  if (ae) ae.entregado_en = new Date().toISOString();
  guardar();
  return ok(ae ? entregaPlana(ae) : null);
});
ruta('GET', 'actividades/curso/(\\d+)/matriz', ({ m }) => {
  const curso = Number(m[1]);
  const acts = actividadesDeCurso(curso);
  const ests = db.estudiantes.filter((e) => e.curso === curso);
  const celdas = [];
  acts.forEach((a) =>
    ests.forEach((e) => {
      const ae = db.entregas.find((x) => x.actividad === a.id && x.estudiante === e.id);
      if (ae) celdas.push({ actividad_id: a.id, estudiante_id: e.id, actividad_estudiante_id: ae.id, calificacion: ae.calificacion != null ? String(ae.calificacion) : null, entregado_en: ae.entregado_en, entregable_url: null });
    })
  );
  return ok({ actividades: acts.map(actividadPlana), estudiantes: ests.map((e) => ({ id: e.id, nombre: e.nombre, apellido: e.apellido })), celdas });
});
ruta('GET', 'actividades/estudiante/(\\d+)', ({ m, query }) => {
  const estado = query.get('estado') || 'todas';
  let lista = db.entregas.filter((e) => e.estudiante === Number(m[1]));
  if (estado === 'pendientes') lista = lista.filter((e) => !e.entregado_en);
  if (estado === 'entregadas') lista = lista.filter((e) => e.entregado_en);
  return ok(lista.map((ae) => {
    const a = db.actividades.find((x) => x.id === ae.actividad) || {};
    return { id: ae.id, actividad_estudiante_id: ae.id, actividad_id: a.id, titulo: a.titulo, descripcion: a.descripcion, fecha: a.fecha, fecha_entrega: a.fecha_entrega, entregado_en: ae.entregado_en, calificacion: ae.calificacion != null ? String(ae.calificacion) : null, entregable_url: null, download_url: null, mime: null, filename: null };
  }));
});

/* --- Académico: contexto y boletín --- */
ruta('GET', 'academico/contexto', () => {
  const hoy = new Date();
  const actual = Math.floor(hoy.getMonth() / 3) + 1;
  return ok({ anio_actual: hoy.getFullYear(), periodo_actual: actual, periodos_disponibles: Array.from({ length: actual - 1 }, (_, i) => i + 1) });
});
ruta('GET', 'academico/boletin/curso/(\\d+)/periodo/(\\d+)', ({ m, query }) => {
  const curso = db.cursos.find((c) => c.id === Number(m[1]));
  const periodo = db.periodos.find((p) => p.numero === Number(m[2]));
  const est = db.estudiantes.find((e) => e.id === Number(query.get('estudiante_id')));
  if (!curso || !periodo || !est) return fail(404, 'No encontrado.');
  const materiasBoletin = db.cpms.filter((c) => c.curso === curso.id).map((cpm) => {
    const acts = db.actividades.filter((a) => a.cpm === cpm.id && a.fecha >= periodo.fecha_inicio && a.fecha <= periodo.fecha_fin);
    const notas = db.entregas.filter((e) => e.estudiante === est.id && acts.some((a) => a.id === e.actividad) && e.calificacion != null).map((e) => Number(e.calificacion));
    const prom = notas.length ? redondear(notas.reduce((s, n) => s + n, 0) / notas.length) : null;
    const prof = db.personas.find((p) => p.id === cpm.persona);
    return {
      materia_nombre: materiaMini(cpm.materia)?.nombre,
      profesor: prof ? `${prof.nombre} ${prof.apellido}` : '',
      promedio: prom,
      desempeno: desempeno(prom),
      inasistencias: db.asistencias.filter((a) => a.cpm === cpm.id && a.estudiante === est.id && a.estado === 'Ausente' && a.fecha >= periodo.fecha_inicio && a.fecha <= periodo.fecha_fin).length,
      observacion_docente: prom != null && prom >= 4 ? 'Excelente actitud y participación durante el periodo.' : '',
      logros: db.logros.map((descripcion, i) => ({ orden: i + 1, descripcion })),
    };
  });
  return ok({
    anio: periodo.anio, generado_el: new Date().toISOString().slice(0, 10),
    curso: { id: curso.id, nombre_curso: curso.nombre_curso }, periodo,
    estudiante: { id: est.id, nombre: est.nombre, apellido: est.apellido, tipo_documento: est.tipo_documento, numero_documento: est.numero_documento },
    materias: materiasBoletin, observaciones_generales: '',
  });
});
ruta('GET', 'academico/boletin/curso/(\\d+)/periodo/(\\d+)/pdf', () => fail(503, 'La descarga de PDF no está disponible en la demo.'));

/* ---------- El "baseQuery" que usa RTK Query ---------- */
export const mockBaseQuery = async (args) => {
  const req = typeof args === 'string' ? { url: args } : args;
  const metodo = (req.method || 'GET').toUpperCase();
  const [rutaCruda, qs = ''] = req.url.split('?');
  const limpia = rutaCruda.replace(/^\/+|\/+$/g, '');
  const query = new URLSearchParams(qs);

  // Pequeña espera para que se vean los estados de "cargando", como con un servidor real
  await new Promise((r) => setTimeout(r, 180));

  for (const [m, patron, fn] of rutas) {
    if (m !== metodo) continue;
    const match = limpia.match(patron);
    if (match) {
      const res = fn({ m: match, body: leerBody(req.body), query });
      // structuredClone: entregamos copias para que Redux no congele ni modifique nuestra "BD"
      return res.data !== undefined ? { ...res, data: res.data === null ? null : structuredClone(res.data) } : res;
    }
  }
  return fail(404, `La demo no implementa ${metodo} /${limpia}`);
};
