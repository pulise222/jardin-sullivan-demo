// src/components/views/Login/Login.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginUserMutation } from '../../../features/user/userApi';
import { setCredentials, setPersona } from '../../../features/user/userSlice';
import { useLazyGetMyPersonaQuery } from '../../../features/people/personApi';
import useFreeScroll from '../../../hooks/useFreeScroll';
import logo from '../../../assets/logo.png';
// OJO: el archivo se llama "Login.css" (con L mayúscula). En Windows da igual, pero en
// Linux (donde se despliegan casi todos los servidores) las mayúsculas importan.
import './Login.css';

/*
  CUENTAS DE DEMOSTRACIÓN: las que verán las personas que revisen el portafolio para
  recorrer los tres paneles. Son cuentas de prueba creadas solo para esto, con datos
  ficticios (nunca pongas aquí contraseñas reales de nadie).
  Importante: estos usuarios y contraseñas deben existir de verdad en la base de datos.
*/
const DEMO_ACCOUNTS = [
  { role: 'Administrador', icon: 'fa-user-shield', color: '#F25141', username: 'admin', password: 'Demo2026*' },
  { role: 'Profesor', icon: 'fa-chalkboard-user', color: '#28A8E3', username: 'profesor', password: 'Demo2026*' },
  { role: 'Acudiente', icon: 'fa-heart', color: '#93C524', username: 'acudiente', password: 'Demo2026*' },
];

const Login = () => {
  useFreeScroll(); // scroll normal en esta página (ver hooks/useFreeScroll.js)

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // ojito para ver la contraseña
  const [error, setError] = useState(''); // mensaje de error que se muestra en la página
  const [demoOpen, setDemoOpen] = useState(false); // ventana de cuentas de prueba
  const [copied, setCopied] = useState(''); // qué dato se copió (para mostrar "copiado")
  const dialogRef = useRef(null);

  const [login, { isLoading }] = useLoginUserMutation();
  const [fetchMyPersona] = useLazyGetMyPersonaQuery(); // <- lazy para controlarlo

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(''); // al volver a escribir, quitamos el error anterior
  };

  /*
    Ventana de cuentas de prueba con el elemento nativo <dialog>.
    showModal() ya nos da: oscurecer el fondo, atrapar el foco dentro de la ventana
    y cerrar con la tecla Esc, sin escribir nada de eso a mano.
  */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (demoOpen && !dialog.open) dialog.showModal();
    if (!demoOpen && dialog.open) dialog.close();
  }, [demoOpen]);

  // Copiar un dato al portapapeles y mostrar "Copiado" por un momento
  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 1600);
    } catch {
      // Si el navegador no lo permite, el usuario aún puede seleccionar y copiar a mano
    }
  };

  // "Usar": rellena el formulario con la cuenta y cierra la ventana
  const fillAccount = (account) => {
    setForm({ username: account.username, password: account.password });
    setError('');
    setDemoOpen(false);
  };

  // ---- LÓGICA DE AUTENTICACIÓN (sin cambios respecto a la versión original) ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = form;
    if (!username || !password) {
      // antes: alert(...). Ahora mostramos el aviso dentro de la página.
      return setError('Escribe tu usuario y tu contraseña.');
    }

    try {
      const { access, refresh, usuario } = await login(form).unwrap();

      // guardamos tokens y user
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      sessionStorage.setItem('user', JSON.stringify(usuario));
      dispatch(setCredentials({ user: usuario, access, refresh }));

      // Traer la Persona asociada al usuario autenticado
      try {
        const persona = await fetchMyPersona().unwrap();
        sessionStorage.setItem('persona', JSON.stringify(persona));
        dispatch(setPersona(persona));
      } catch (e) {
        // Puede no existir Persona (por rol distinto); no es bloqueo
        console.log('Login: ', e);
        sessionStorage.removeItem('persona');
        dispatch(setPersona(null));
      }

      // Redirigir segun rol
      switch (usuario.rol) {
        case 'Administrador': navigate('/admin/'); break;
        case 'Profesor':      navigate('/profesor/'); break;
        case 'Acudiente':     navigate('/acudiente/'); break;
        default:              navigate('/');
      }
    } catch (err) {
      console.error(err);
      // FETCH_ERROR = el navegador no pudo ni llegar al servidor (está apagado o sin internet)
      setError(
        err?.status === 'FETCH_ERROR'
          ? 'No pudimos conectar con el servidor.'
          : 'Usuario o contraseña incorrectos.'
      );
    }
  };

  return (
    <div className="lg-page">
      {/* Fondo decorativo: formas que flotan suavemente (no tienen significado, por eso aria-hidden) */}
      <div className="lg-deco" aria-hidden="true">
        {/* Nubes que pasan despacio */}
        <span className="lg-cloud lg-cloud-1"></span>
        <span className="lg-cloud lg-cloud-2"></span>
        <span className="lg-cloud lg-cloud-3"></span>

        {/* Destellos y puntos de color que flotan */}
        <span className="lg-shape lg-star lg-star-1">✦</span>
        <span className="lg-shape lg-star lg-star-2">✦</span>
        <span className="lg-shape lg-dot lg-dot-red"></span>
        <span className="lg-shape lg-dot lg-dot-green"></span>
        <span className="lg-shape lg-dot lg-dot-blue"></span>

        {/* Colinas en tres capas (SVG): preserveAspectRatio="none" las estira a todo el ancho */}
        <svg className="lg-hills" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,170 C220,90 470,100 720,170 C980,245 1210,240 1440,150 L1440,320 L0,320 Z" fill="#c8e37a" opacity="0.55" />
          <path d="M0,235 C280,170 540,190 800,238 C1060,284 1260,262 1440,214 L1440,320 L0,320 Z" fill="#93c524" opacity="0.42" />
          <path d="M0,283 C300,250 560,262 840,286 C1100,308 1280,296 1440,272 L1440,320 L0,320 Z" fill="#2ec4b6" opacity="0.3" />
        </svg>
      </div>

      <Link to="/" className="lg-home">
        <i className="fas fa-arrow-left" aria-hidden="true"></i>
        Inicio
      </Link>

      {/* Acceso a las cuentas de prueba: arriba a la derecha para que se vea desde el primer momento
          (pensado para quien revisa el portafolio). Abre la ventana con las credenciales. */}
      <button type="button" className="lg-demo-btn" onClick={() => setDemoOpen(true)}>
        <span className="lg-demo-ico" aria-hidden="true"><i className="fas fa-key"></i></span>
        Cuentas de prueba
      </button>

      <div className="lg-layout">
        {/* Tu logo, a la izquierda de la tarjeta (estilo Facebook) */}
        <div className="lg-brand">
          <div className="lg-logo">
            <img src={logo} alt="Jardín Sullivan" />
          </div>
          <p className="lg-tagline">Un espacio donde la educación y el corazón se unen.</p>

          {/* Quiénes pueden entrar (un chip por tipo de usuario) */}
          <ul className="lg-roles">
            <li style={{ '--tone': '#F25141' }}><i className="fas fa-user-shield" aria-hidden="true"></i>Administración</li>
            <li style={{ '--tone': '#28A8E3' }}><i className="fas fa-chalkboard-user" aria-hidden="true"></i>Profesores</li>
            <li style={{ '--tone': '#93C524' }}><i className="fas fa-heart" aria-hidden="true"></i>Acudientes</li>
          </ul>
        </div>

        <div className="lg-side">
          <div className="lg-card">
            {/* Medallón que "cuelga" del borde superior de la tarjeta */}
            <span className="lg-lock" aria-hidden="true"><i className="fas fa-lock"></i></span>
            <h1>Iniciar sesión</h1>
            <p className="lg-card-sub">Ingresa con tu usuario y contraseña para continuar.</p>

            {/* role="alert": los lectores de pantalla leen el error en cuanto aparece */}

            {error && (
              <div className="lg-error" role="alert">
                <i className="fas fa-circle-exclamation" aria-hidden="true"></i>
                {error}
              </div>
            )}

            {/* noValidate: usamos nuestros propios mensajes en vez de los del navegador */}
            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                aria-invalid={error ? 'true' : 'false'}
                autoFocus
              />

              <label htmlFor="password">Contraseña</label>
              <div className="lg-pass">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  aria-invalid={error ? 'true' : 'false'}
                />
                {/* Botón para mostrar u ocultar la contraseña */}
                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                </button>
              </div>

              <button type="submit" className="lg-submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="lg-spinner" aria-hidden="true"></span>
                    Ingresando…
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>

            {/* Link de React Router: navega sin recargar la página (antes era un <a href>) */}
            <p className="lg-forgot">
              ¿No te acuerdas de tu contraseña? <Link to="/cambiar-contraseña">Recuperar contraseña</Link>
            </p>

            {/* Separador (como en el login de Facebook) y botón verde para familias nuevas.
                En este sistema las cuentas las crea el administrador, así que no hay registro
                abierto: el botón lleva al formulario de inscripción (/matricula). */}
            <div className="lg-divider" aria-hidden="true"></div>
            <Link to="/matricula" className="lg-register">
              <i className="fas fa-file-pen" aria-hidden="true"></i>
              Solicitar cupo
            </Link>
            <p className="lg-register-hint">¿Eres una familia nueva? El jardín creará tu cuenta al aceptar tu solicitud.</p>
          </div>
        </div>
      </div>

      <p className="lg-copy">© {new Date().getFullYear()} Jardín Infantil Sullivan</p>

      {/* ===== Ventana (dialog) con las credenciales de demostración ===== */}
      <dialog
        ref={dialogRef}
        className="lg-dialog"
        aria-labelledby="demo-title"
        onClose={() => setDemoOpen(false)}
        // clic en el fondo oscuro (fuera de la ventana) = cerrar
        onClick={(e) => e.target === dialogRef.current && setDemoOpen(false)}
      >
        <div className="lg-dialog-head">
          <h2 id="demo-title">Cuentas de prueba</h2>
          <button type="button" className="lg-dialog-x" onClick={() => setDemoOpen(false)} aria-label="Cerrar">
            <i className="fas fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <ul className="lg-accounts">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.role} style={{ '--tone': account.color }}>
              <div className="lg-account-top">
                <span className="lg-account-ico" aria-hidden="true">
                  <i className={`fas ${account.icon}`}></i>
                </span>
                <strong>{account.role}</strong>
              </div>

              {/* Cada dato tiene su botón para copiarlo */}
              {[
                ['Usuario', account.username, 'u'],
                ['Contraseña', account.password, 'p'],
              ].map(([label, value, k]) => {
                const key = `${account.role}-${k}`;
                return (
                  <div className="lg-cred" key={key}>
                    <span className="lg-cred-label">{label}</span>
                    <code>{value}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(value, key)}
                      aria-label={`Copiar ${label.toLowerCase()} de ${account.role}`}
                    >
                      <i className={`fas ${copied === key ? 'fa-check' : 'fa-copy'}`} aria-hidden="true"></i>
                      {copied === key ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                );
              })}

              <button type="button" className="lg-use" onClick={() => fillAccount(account)}>
                Usar esta cuenta
              </button>
            </li>
          ))}
        </ul>
      </dialog>
    </div>
  );
};

export default Login;
