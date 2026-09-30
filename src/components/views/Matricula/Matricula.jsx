// src/components/views/Matricula/Matricula.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// react-hook-form maneja el estado, la validación y el envío del formulario por nosotros
import { useForm } from "react-hook-form";
import Logo from "../../common/Logo";
import { GROUPS } from "../../../data/groups";
import useFreeScroll from "../../../hooks/useFreeScroll";
import "./Matricula.css";

/*
  ======================================================================
  PÁGINA DE MATRÍCULA (/matricula)
  ======================================================================
  Formulario para solicitar cupo en el jardín. Tiene tres bloques:
    1) Datos del niño o niña
    2) Datos del acudiente
    3) Información adicional + autorización de datos

  IMPORTANTE: por ahora es solo la parte visual. Al enviar, el formulario valida,
  muestra una pantalla de éxito y deja los datos en la consola, pero NO los manda a
  ningún correo ni servidor. Conectarlo al backend es un paso posterior
  (ver el comentario "AQUÍ SE ENVIARÍA" más abajo).
*/

// Los tres bloques del formulario (sirven para el índice lateral y para saber dónde estás)
const STEPS = [
  { id: "nino", label: "Datos del niño o niña" },
  { id: "acudiente", label: "Datos del acudiente" },
  { id: "extra", label: "Información adicional" },
];

const DOC_NINO = ["Registro civil", "Tarjeta de identidad", "Otro"];
const DOC_ADULTO = ["Cédula de ciudadanía", "Cédula de extranjería", "Pasaporte"];
const PARENTESCOS = ["Mamá", "Papá", "Abuelo o abuela", "Tío o tía", "Otro familiar", "Tutor legal"];
const JORNADAS = ["Mañana", "Tarde", "Jornada completa"];
const FUENTES = ["Recomendación de otra familia", "Redes sociales", "Búsqueda en internet", "Pasé por el jardín", "Otro"];

// ---------- Utilidades ----------

// Calcula la edad en años cumplidos a partir de una fecha "AAAA-MM-DD"
function calcularEdad(fecha) {
  if (!fecha) return null;
  const nacimiento = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  // si todavía no ha cumplido años este año, restamos uno
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

// Busca el grupo que corresponde a una edad. Los rangos vienen como "1–3", "3–4"...
function grupoParaEdad(edad) {
  if (edad === null || edad < 1) return null;
  const encontrado = GROUPS.find((g) => {
    const [desde, hasta] = g.age.split("–").map(Number);
    return edad >= desde && edad < hasta;
  });
  // un niño de 6 años cumplidos todavía entra al último grupo
  return encontrado || (edad <= 6 ? GROUPS[GROUPS.length - 1] : null);
}

// Fecha de hoy y de hace 7 años en formato AAAA-MM-DD (límites del selector de fecha)
const toISO = (d) => d.toISOString().slice(0, 10);
const HOY = toISO(new Date());
const HACE_7 = toISO(new Date(new Date().setFullYear(new Date().getFullYear() - 7)));

// ---------- Componente reutilizable para cada campo ----------
// Dibuja la etiqueta, el control (children), la ayuda y el mensaje de error.
function Field({ id, label, required, error, hint, className = "", children }) {
  return (
    <div className={`mat-field ${error ? "has-error" : ""} ${className}`.trim()}>
      <label htmlFor={id}>
        {label}
        {required && <span className="mat-req" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mat-hint" id={`${id}-desc`}>{hint}</p>}
      {error && (
        <p className="mat-error" id={`${id}-desc`} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

// ---------- Página ----------
export default function Matricula() {
  useFreeScroll(); // scroll normal (ver hooks/useFreeScroll.js)

  const [enviado, setEnviado] = useState(null); // null = mostrando el formulario; objeto = ya enviado
  const [pasoActivo, setPasoActivo] = useState(STEPS[0].id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched", // valida cuando sales de un campo, y luego en vivo
    defaultValues: { jornada: "Jornada completa", visita: false },
  });

  // watch() nos deja "mirar" el valor de un campo mientras el usuario escribe
  const fechaNacimiento = watch("nacimiento");
  const edad = calcularEdad(fechaNacimiento);
  const grupoSugerido = grupoParaEdad(edad);

  // Devuelve los atributos de accesibilidad que comparten todos los campos
  const a11y = (name) => ({
    id: name,
    "aria-invalid": errors[name] ? "true" : "false",
    "aria-describedby": errors[name] ? `${name}-desc` : undefined,
  });

  // Cuando el formulario es válido, se ejecuta esta función con todos los datos
  const onSubmit = async (datos) => {
    // Simulamos el tiempo que tardaría el servidor
    await new Promise((resolve) => setTimeout(resolve, 1300));

    // AQUÍ SE ENVIARÍA la solicitud al backend (por ejemplo con fetch/axios a un endpoint de Django
    // que guarde la inscripción y mande un correo a la institución). Por ahora solo la mostramos:
    console.log("Solicitud de inscripción (demostración, no se envía a ningún lado):", datos);

    setEnviado({ nino: datos.nombres, grupo: grupoParaEdad(calcularEdad(datos.nacimiento)) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Índice lateral: marca el bloque que está cruzando el centro de la pantalla
  useEffect(() => {
    if (enviado) return;
    const secciones = STEPS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setPasoActivo(e.target.id)),
      { rootMargin: "-40% 0px -50% 0px" }
    );
    secciones.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [enviado]);

  return (
    <div className="mat-page">
      {/* Barra superior: volver + logo */}
      <header className="mat-top">
        <Link to="/" className="mat-back">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          Volver al inicio
        </Link>
        <Link to="/" aria-label="Jardín Sullivan, ir al inicio" className="mat-logo">
          <Logo />
        </Link>
      </header>

      <main className="mat-layout">
        {/* ===== Columna izquierda: información y pasos ===== */}
        <aside className="mat-aside">
          <span className="mat-eyebrow">Inscripciones</span>
          <h1>
            Inscribe a tu hijo en el <span>Jardín Sullivan</span>
          </h1>
          <p className="mat-aside-lead">
            Cuéntanos sobre tu familia. Es un formulario corto y nos ayuda a preparar la mejor bienvenida para tu peque.
          </p>

          <ol className="mat-steps" aria-label="Bloques del formulario">
            {STEPS.map((step, i) => (
              <li key={step.id} className={pasoActivo === step.id && !enviado ? "is-active" : ""}>
                <a href={`#${step.id}`}>
                  <span className="mat-step-num">{i + 1}</span>
                  {step.label}
                </a>
              </li>
            ))}
          </ol>

          <div className="mat-contact">
            <p className="mat-contact-title">¿Prefieres hablar con nosotros?</p>
            <p>Celular: 300 455 7890</p>
            <p>Lunes a viernes: 7:30 a.m. - 5:00 p.m.</p>
          </div>
        </aside>

        {/* ===== Columna derecha: formulario o pantalla de éxito ===== */}
        <section className="mat-card" aria-live="polite">
          {enviado ? (
            <div className="mat-success">
              <svg className="mat-check" viewBox="0 0 52 52" aria-hidden="true">
                <circle cx="26" cy="26" r="24" />
                <path d="M15 27 l8 8 l15 -17" />
              </svg>
              <h2>¡Solicitud recibida!</h2>
              <p className="mat-success-lead">
                Gracias por pensar en nosotros para <strong>{enviado.nino}</strong>.
                {enviado.grupo && (
                  <> Por su edad, lo más probable es que entre al grupo <strong>{enviado.grupo.name}</strong>.</>
                )}
              </p>

              <ol className="mat-next">
                <li><span>1</span> Revisamos tu solicitud.</li>
                <li><span>2</span> Te contactamos por teléfono o correo.</li>
                <li><span>3</span> Coordinamos una visita al jardín.</li>
              </ol>

              <p className="mat-demo-note">
                Versión de demostración: los datos de este formulario todavía no se envían a ningún servidor.
              </p>

              <div className="mat-success-actions">
                <Link to="/" className="mat-btn">Volver al inicio</Link>
                <button
                  type="button"
                  className="mat-btn-ghost"
                  onClick={() => {
                    reset();
                    setEnviado(null);
                  }}
                >
                  Inscribir a otro niño
                </button>
              </div>
            </div>
          ) : (
            // noValidate: desactiva los mensajes del navegador para usar los nuestros
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* ---------- 1. NIÑO ---------- */}
              <fieldset className="mat-section" id="nino">
                <legend>
                  <span className="mat-legend-num">1</span>
                  Datos del niño o niña
                </legend>

                <div className="mat-grid">
                  <Field id="nombres" label="Nombres" required error={errors.nombres}>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="Ej. Sofía"
                      {...a11y("nombres")}
                      {...register("nombres", {
                        required: "Escribe el nombre del niño o niña",
                        minLength: { value: 2, message: "Escribe al menos 2 letras" },
                      })}
                    />
                  </Field>

                  <Field id="apellidos" label="Apellidos" required error={errors.apellidos}>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="Ej. Gómez Rojas"
                      {...a11y("apellidos")}
                      {...register("apellidos", { required: "Escribe los apellidos" })}
                    />
                  </Field>

                  <Field
                    id="nacimiento"
                    label="Fecha de nacimiento"
                    required
                    error={errors.nacimiento}
                    hint="El jardín recibe niños de 1 a 6 años."
                  >
                    <input
                      type="date"
                      min={HACE_7}
                      max={HOY}
                      {...a11y("nacimiento")}
                      {...register("nacimiento", {
                        required: "Selecciona la fecha de nacimiento",
                        // validate: reglas propias; si devuelve un texto, ese es el error
                        validate: (valor) => {
                          const e = calcularEdad(valor);
                          if (e === null) return "Fecha no válida";
                          if (e < 0) return "La fecha no puede ser futura";
                          if (e < 1 || e > 6) return "El jardín recibe niños de 1 a 6 años";
                          return true;
                        },
                      })}
                    />
                  </Field>

                  <Field id="sexo" label="Sexo" error={errors.sexo}>
                    <select {...a11y("sexo")} {...register("sexo")} defaultValue="">
                      <option value="">Prefiero no indicarlo</option>
                      <option value="niña">Niña</option>
                      <option value="niño">Niño</option>
                    </select>
                  </Field>

                  <Field id="tipoDocNino" label="Tipo de documento" required error={errors.tipoDocNino}>
                    <select
                      {...a11y("tipoDocNino")}
                      {...register("tipoDocNino", { required: "Selecciona el tipo de documento" })}
                      defaultValue=""
                    >
                      <option value="" disabled>Selecciona una opción</option>
                      {DOC_NINO.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </Field>

                  <Field id="numDocNino" label="Número de documento" required error={errors.numDocNino}>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="Sin puntos ni espacios"
                      {...a11y("numDocNino")}
                      {...register("numDocNino", {
                        required: "Escribe el número de documento",
                        pattern: { value: /^[0-9A-Za-z-]{5,20}$/, message: "Revisa el número (5 a 20 caracteres)" },
                      })}
                    />
                  </Field>
                </div>

                {/* Sugerencia de grupo: aparece sola cuando la fecha de nacimiento es válida */}
                {grupoSugerido && (
                  <div className="mat-group-tip" style={{ "--tone": grupoSugerido.color, "--ink": grupoSugerido.ink }}>
                    <span className="mat-group-emoji" aria-hidden="true">{grupoSugerido.icon}</span>
                    <p>
                      Con {edad} {edad === 1 ? "año" : "años"}, le corresponde el grupo{" "}
                      <strong>{grupoSugerido.name}</strong>: {grupoSugerido.description.toLowerCase()}
                    </p>
                  </div>
                )}
              </fieldset>

              {/* ---------- 2. ACUDIENTE ---------- */}
              <fieldset className="mat-section" id="acudiente">
                <legend>
                  <span className="mat-legend-num">2</span>
                  Datos del acudiente
                </legend>

                <div className="mat-grid">
                  <Field id="acudiente-nombre" label="Nombre completo" required className="mat-span-2" error={errors["acudiente-nombre"]}>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Nombres y apellidos"
                      {...a11y("acudiente-nombre")}
                      {...register("acudiente-nombre", { required: "Escribe tu nombre completo" })}
                    />
                  </Field>

                  <Field id="parentesco" label="Parentesco con el niño" required error={errors.parentesco}>
                    <select
                      {...a11y("parentesco")}
                      {...register("parentesco", { required: "Selecciona el parentesco" })}
                      defaultValue=""
                    >
                      <option value="" disabled>Selecciona una opción</option>
                      {PARENTESCOS.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </Field>

                  <Field id="tipoDocAdulto" label="Tipo de documento" error={errors.tipoDocAdulto}>
                    <select {...a11y("tipoDocAdulto")} {...register("tipoDocAdulto")} defaultValue="">
                      <option value="" disabled>Selecciona una opción</option>
                      {DOC_ADULTO.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </Field>

                  <Field id="telefono" label="Celular" required error={errors.telefono}>
                    <input
                      type="tel"
                      autoComplete="tel"
                      placeholder="300 000 0000"
                      {...a11y("telefono")}
                      {...register("telefono", {
                        required: "Escribe un número de contacto",
                        pattern: { value: /^[0-9\s+()-]{7,15}$/, message: "Escribe un número de teléfono válido" },
                      })}
                    />
                  </Field>

                  <Field id="correo" label="Correo electrónico" required error={errors.correo}>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="nombre@correo.com"
                      {...a11y("correo")}
                      {...register("correo", {
                        required: "Escribe tu correo electrónico",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: "Escribe un correo válido" },
                      })}
                    />
                  </Field>

                  <Field id="direccion" label="Barrio o dirección" className="mat-span-2" error={errors.direccion}>
                    <input
                      type="text"
                      autoComplete="street-address"
                      placeholder="Opcional"
                      {...a11y("direccion")}
                      {...register("direccion")}
                    />
                  </Field>
                </div>
              </fieldset>

              {/* ---------- 3. INFORMACIÓN ADICIONAL ---------- */}
              <fieldset className="mat-section" id="extra">
                <legend>
                  <span className="mat-legend-num">3</span>
                  Información adicional
                </legend>

                {/* Opciones tipo "chip": cada radio real está oculto y su etiqueta se ve como botón */}
                <div className="mat-field">
                  <span className="mat-label" id="jornada-label">Jornada de preferencia</span>
                  <div className="mat-chips" role="radiogroup" aria-labelledby="jornada-label">
                    {JORNADAS.map((j) => (
                      <label key={j} className="mat-chip">
                        <input type="radio" value={j} {...register("jornada")} />
                        <span>{j}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mat-grid">
                  <Field id="ingreso" label="Fecha estimada de ingreso" error={errors.ingreso} hint="Puede ser aproximada.">
                    <input type="month" {...a11y("ingreso")} {...register("ingreso")} />
                  </Field>

                  <Field id="fuente" label="¿Cómo nos conociste?" error={errors.fuente}>
                    <select {...a11y("fuente")} {...register("fuente")} defaultValue="">
                      <option value="" disabled>Selecciona una opción</option>
                      {FUENTES.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </Field>

                  <Field
                    id="salud"
                    label="Alergias o condiciones de salud"
                    className="mat-span-2"
                    error={errors.salud}
                    hint="Cuéntanos si debemos tener en cuenta algo: alergias, medicamentos, necesidades especiales."
                  >
                    <textarea rows="3" placeholder="Opcional" {...a11y("salud")} {...register("salud")} />
                  </Field>

                  <Field id="mensaje" label="Comentarios o preguntas" className="mat-span-2" error={errors.mensaje}>
                    <textarea
                      rows="4"
                      placeholder="¿Algo más que quieras contarnos?"
                      {...a11y("mensaje")}
                      {...register("mensaje", { maxLength: { value: 600, message: "Máximo 600 caracteres" } })}
                    />
                  </Field>
                </div>

                <label className="mat-check-row">
                  <input type="checkbox" {...register("visita")} />
                  <span>Me gustaría agendar una visita al jardín.</span>
                </label>

                {/* Autorización de tratamiento de datos (obligatoria) */}
                <div className={`mat-consent ${errors.autorizacion ? "has-error" : ""}`}>
                  <label className="mat-check-row">
                    <input
                      type="checkbox"
                      aria-invalid={errors.autorizacion ? "true" : "false"}
                      aria-describedby={errors.autorizacion ? "autorizacion-desc" : undefined}
                      {...register("autorizacion", { required: "Debes autorizar el tratamiento de los datos para continuar" })}
                    />
                    <span>
                      Autorizo al Jardín Sullivan a usar estos datos únicamente para contactarme sobre la inscripción.
                      <span className="mat-req" aria-hidden="true"> *</span>
                    </span>
                  </label>
                  {errors.autorizacion && (
                    <p className="mat-error" id="autorizacion-desc" role="alert">
                      {errors.autorizacion.message}
                    </p>
                  )}
                </div>
              </fieldset>

              <div className="mat-submit">
                {/* disabled mientras se envía, para evitar dobles envíos */}
                <button type="submit" className="mat-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="mat-spinner" aria-hidden="true"></span>
                      Enviando…
                    </>
                  ) : (
                    <>
                      Enviar solicitud
                      <span className="mat-btn-icon" aria-hidden="true">
                        <i className="fas fa-arrow-right"></i>
                      </span>
                    </>
                  )}
                </button>
                <p className="mat-required-note">Los campos con <span className="mat-req">*</span> son obligatorios.</p>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
