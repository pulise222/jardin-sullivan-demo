//src/components/views/Home/Home.jsx
import { useEffect, useState, useRef, useMemo } from "react";
// Link navega entre páginas de React SIN recargar el navegador (a diferencia de <a href>)
import { Link } from "react-router-dom";
import "./Home.css";
// Hook que anima cosas según el scroll y componente que divide títulos en palabras
import useScrollEffects from "../../../hooks/useScrollEffects";
import { Words } from "../../common/ScrollText";
import Logo from "../../common/Logo";
import { GROUPS } from "../../../data/groups";
import useFreeScroll from "../../../hooks/useFreeScroll";
import pelados from "../../../assets/pelados.png";
import pelados2 from "../../../assets/pelados2.png";
import jugando from "../../../assets/niños-jugando.png";
import baile from "../../../assets/baile.png";

/*
  ENLACES DEL MENÚ: una sola lista que usamos para dibujar el menú Y para
  saber en qué sección estás. `id` debe coincidir con el id de cada <section>.
*/
const NAV_LINKS = [
  { id: "inicio", label: "Inicio" },
  { id: "eventos", label: "Eventos" },
  { id: "Nosotros", label: "Nosotros" },
  { id: "programas", label: "Programas" },
  { id: "contacto", label: "Contacto" },
];

/*
  HERO CONTENT: aquí editas fácilmente los textos, enlaces e imagen del
  'hero' (la primera pantalla). El JSX de más abajo solo "lee" estos datos,
  así cambias el contenido sin tocar la estructura.
*/
const HERO = {
  badgeText: 'Jardín Infantil • Desde 1 año',
  titlePrefix: 'Bienvenidos al',
  titleHighlight: 'Jardín Sullivan',
  lead:
    'Un espacio donde la educación y el corazón se unen. Acompañamos a cada niño en su desarrollo único a través del juego, la exploración y el respeto.',
  ctaPrimary: { href: '#contacto', text: 'Conocer más' },
  ctaSecondary: { href: '#programas', text: 'Ver programas' },
  image: pelados,
  // Etiquetas flotantes sobre la imagen
  chips: [
    { icon: '🌱', title: 'Aprendizaje activo', subtitle: 'Modelo pedagógico lúdico' },
    { icon: '💛', title: 'Atención personalizada', subtitle: 'Cada niño, a su ritmo' },
  ],
}

/*
  FOTOS DE LOS EVENTOS: por ahora usan fotos del jardín que ya están en src/assets.
  Para poner una foto real de cada evento: guárdala en src/assets/eventos/, impórtala arriba
  (import cienciaImg from '../../../assets/eventos/ciencia.jpg') y cambia el campo `image`.
  `position` decide qué parte de la foto se ve en la tarjeta (ej. "50% 30%" = centro y un poco arriba).

  EVENTOS: datos de ejemplo. Más adelante estos datos vendrán de la API del
  backend (la app `eventos` de Django); por ahora viven aquí para diseñar.
  `color` es el color de la fecha y del botón de cada tarjeta (paleta de la marca).
*/
const EVENTS = [
  {
    title: "Feria de la ciencia",
    day: "12", month: "Oct", time: "9:00 a.m.",
    place: "Auditorio Principal",
    description: "Muestras de proyectos y experimentos de los niños.",
    image: pelados, position: "50% 40%", link: "#", color: "#FEBF22",
  },
  {
    title: "Día de la familia",
    day: "20", month: "Oct", time: "8:00 a.m.",
    place: "Patio Central",
    description: "Juegos, picnic y actividades colaborativas.",
    image: jugando, position: "50% 35%", link: "#", color: "#28A8E3",
  },
  {
    title: "Muestra artística",
    day: "28", month: "Oct", time: "10:00 a.m.",
    place: "Sala Multiusos",
    description: "Exposición de arte y música.",
    image: baile, position: "55% 30%", link: "#", color: "#93C524",
  },
  {
    title: "Charla de nutrición",
    day: "05", month: "Nov", time: "4:00 p.m.",
    place: "Aula 3",
    description: "Hábitos saludables en la primera infancia.",
    image: pelados, position: "88% 55%", link: "#", color: "#F25141",
  },
  {
    title: "Festival de lectura",
    day: "15", month: "Nov", time: "9:30 a.m.",
    place: "Biblioteca",
    description: "Cuentacuentos y trueque de libros.",
    image: pelados2, position: "50% 25%", link: "#", color: "#FF8A00",
  },
];

/*
  NOSOTROS: los cuatro pilares del jardín (antes eran cuatro párrafos largos).
  `color` tiñe el círculo del ícono de cada tarjeta (colores de la paleta).
*/
const PILLARS = [
  {
    icon: "🏡",
    title: "Ambiente cálido y seguro",
    text: "Un espacio acogedor y afectivo donde los niños desarrollan habilidades sociales, emocionales y cognitivas de forma natural y divertida.",
    color: "#FEBF22",
  },
  {
    icon: "💛",
    title: "Atención personalizada",
    text: "Un equipo de profesionales capacitados acompaña a cada niño para asegurar su desarrollo integral y un crecimiento saludable.",
    color: "#F25141",
  },
  {
    icon: "🌈",
    title: "Entorno inclusivo",
    text: "Cada niño se siente valorado y respetado. Promovemos la diversidad y valores como la empatía, el respeto y la colaboración.",
    color: "#28A8E3",
  },
  {
    icon: "🎨",
    title: "Programas especializados",
    text: "Actividades artísticas, musicales y deportivas que estimulan el desarrollo físico y mental de los niños.",
    color: "#93C524",
  },
];


// Palabras de la banda que se desliza (todas salen de los textos del jardín)
// Cada fila repite solo 3 palabras: así, mirando cualquier tramo de la fila, siempre se leen las 3.
const MARQUEE_ROW_1 = ["Juego", "Curiosidad", "Creatividad"];
const MARQUEE_ROW_2 = ["Respeto", "Exploración", "Empatía"];

/*
  BENEFICIOS: las tres razones para confiar en el jardín. `color` es el fondo de la
  tarjeta y `ink` el color del texto encima (blanco sobre rojo para que se lea bien).
*/
const BENEFITS = [
  {
    icon: "🎓",
    title: "Excelentes docentes",
    text: "Todos nuestros educadores son profesionales en pedagogía infantil con amplia experiencia en primera infancia.",
    color: "#F25141",
    ink: "#FFFFFF",
  },
  {
    icon: "🍎",
    title: "Alimentación saludable",
    text: "Cada día servimos menús balanceados preparados con ingredientes frescos y seguimos estrictos protocolos de higiene.",
    color: "#93C524",
    ink: "#1B3158",
  },
  {
    icon: "🎮",
    title: "Aprendizaje jugando",
    text: "Usamos juegos y actividades creativas para que los niños aprendan naturalmente y con alegría.",
    color: "#28A8E3",
    ink: "#0F2240",
  },
];
const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollerRef = useRef(null);
  const [activeId, setActiveId] = useState("inicio");
  // Qué tarjeta de evento tiene abierta su tarjetita de información (se usa al TOCAR, en celular)
  const [openEv, setOpenEv] = useState(null);

  // Cierra la tarjetita al tocar fuera o al pulsar Esc
  useEffect(() => {
    if (openEv === null) return;
    const close = () => setOpenEv(null);
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [openEv]);
  const heroRef = useRef(null);

  // Efectos ligados al scroll: parallax, texto que se enciende, tarjetas apiladas, barra de progreso
  useScrollEffects();

  

  // ---- Carrusel de eventos ----
  // Un "paso" = el ancho de una tarjeta + el espacio entre tarjetas
  const getStep = () => {
    const el = scrollerRef.current;
    const slide = el?.querySelector(".ev-slide");
    if (!el || !slide) return 0;
    const gap = parseFloat(getComputedStyle(el.firstElementChild).columnGap) || 0;
    return slide.offsetWidth + gap;
  };

  // Las flechas avanzan o retroceden una tarjeta
  const scrollByStep = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: getStep() * dir, behavior: "smooth" });
  };

  // Recalcula qué flechas se pueden usar y cuántos indicadores mostrar
  const updateArrows = () => {
    const el = scrollerRef.current;
    const step = getStep();
    if (!el || !step) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < maxScroll - 2);

    // un indicador por cada posición a la que se puede llegar
    const stops = Math.max(1, Math.round(maxScroll / step) + 1);
    setTotalPages(stops);
    setCurrentPage(Math.min(stops - 1, Math.round(el.scrollLeft / step)));
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows(); // estado inicial
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  // IntersectionObserver para animar las tarjetas del carrusel cuando entran al viewport
  useEffect(() => {
    const cards = document.querySelectorAll('.ev-card');
    if (!cards || cards.length === 0) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 0.12 });

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  // Aparecer al hacer scroll (reutilizable): cualquier elemento con el atributo
  // data-reveal (bloque) o data-split (título palabra por palabra) empieza invisible y, cuando entra en pantalla, recibe la clase
  // "is-visible". El CSS se encarga de la animación (ver "REVEAL" en Home.css).
  useEffect(() => {
    const items = document.querySelectorAll("[data-reveal], [data-split]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target); // ya apareció: dejamos de vigilarlo
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((item) => io.observe(item));
    return () => io.disconnect();
  }, []);

  // Scroll normal en la landing (corrige overflow/ancho del #root; ver hooks/useFreeScroll.js)
  useFreeScroll();

  // Cerrar el menú móvil: al ensanchar la pantalla o al pulsar Escape (accesibilidad)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 900) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Scroll: (1) cambia el estilo del nav y (2) mueve el fondo/imagen del hero (parallax).
  // Usamos requestAnimationFrame para actualizar como máximo 1 vez por fotograma.
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Guardamos el scroll en una variable CSS (--py); el CSS decide cuánto mover cada capa
      heroRef.current?.style.setProperty("--py", Math.min(y, 900));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "Scrollspy": marca en el menú la sección que está cruzando el centro de la pantalla
  useEffect(() => {
    const sections = NAV_LINKS
      .map((l) => document.getElementById(l.id))
      .filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div className="home">
      {/* Barra de progreso de lectura (arriba del todo) */}
      <div className="scroll-progress" aria-hidden="true"></div>

      {/* ============ NAV: barra flotante tipo "píldora" ============ */}
      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-shell">
          <a className="brand" href="#inicio" aria-label="Jardín Sullivan, ir al inicio">
            {/* Logo reutilizable: sol sonriente + nombre (ver components/common/Logo.jsx) */}
            <Logo />
          </a>

          {/* Botón hamburguesa (solo móvil): muestra ≡ o × según el estado del menú */}
          <button
            className="hamburger"
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-controls="mainmenu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>

          {/* Enlaces: se generan desde NAV_LINKS. `--i` sirve para escalonar la animación */}
          <nav
            id="mainmenu"
            aria-label="Principal"
            className={`nav-links ${menuOpen ? "open" : ""}`}
            onClick={(e) => {
              // Si el clic fue sobre un enlace, cerramos el menú móvil
              if (e.target instanceof Element && e.target.closest("a")) {
                setMenuOpen(false);
              }
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                style={{ "--i": i }}
                className={activeId === link.id ? "is-active" : undefined}
                aria-current={activeId === link.id ? "location" : undefined}
              >
                {link.label}
              </a>
            ))}
            <Link className="btn-login" to="/login" style={{ "--i": NAV_LINKS.length }}>
              <span>Inicia Sesión</span>
              <span className="btn-login-icon" aria-hidden="true">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ============ HERO: primera pantalla ============ */}
      <section id="inicio" className="hero-section" ref={heroRef}>
        <div className="wrap hero-inner">

          {/* Columna de texto: cada bloque entra con un pequeño retraso (--d) */}
          <div className="hero-text">
            <div className="hero-badge reveal" style={{ "--d": ".05s" }}>
              <span className="hero-badge-dot" aria-hidden="true"></span>
              <span>{HERO.badgeText}</span>
            </div>

            {/* data-split + <Words>: cada palabra sube desde una "ventana" oculta, una tras otra */}
            <h1 className="hero-title" data-split style={{ "--d": ".1s" }}>
              <Words text={HERO.titlePrefix} />
              <Words
                text={HERO.titleHighlight}
                className="hero-title-highlight"
                start={HERO.titlePrefix.split(" ").length}
              />
            </h1>

            <p className="hero-lead reveal" style={{ "--d": ".28s" }}>{HERO.lead}</p>

            <div className="hero-actions reveal" style={{ "--d": ".4s" }}>
              <a href={HERO.ctaPrimary.href} className="hero-cta-primary">
                {HERO.ctaPrimary.text}
                <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </a>
              <a href={HERO.ctaSecondary.href} className="hero-cta-secondary">
                {HERO.ctaSecondary.text}
              </a>
            </div>
          </div>

          {/* Columna de imagen con etiquetas flotantes */}
          <div className="hero-media">
            <div className="hero-media-inner reveal" style={{ "--d": ".2s" }}>
              <div className="hero-img-frame">
                <img src={HERO.image} alt="Niños jugando en el Jardín Sullivan" />
              </div>

              {HERO.chips.map((chip, i) => (
                // data-parallax: cada etiqueta se mueve a distinta velocidad que la foto (efecto de profundidad)
                <div
                  key={chip.title}
                  className={`hero-chip hero-chip-${i + 1}`}
                  data-parallax={i === 0 ? "0.09" : "-0.06"}
                >
                  <span className="hero-chip-icon" aria-hidden="true">{chip.icon}</span>
                  <div>
                    <strong>{chip.title}</strong>
                    <span>{chip.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Indicador para bajar (solo escritorio) */}
        <a href="#eventos" className="hero-scroll" aria-label="Bajar a la sección Eventos">
          <span></span>
        </a>
      </section>

      {/* ==========================================================
          EVENTOS: sección oscura con un carrusel de tarjetas.
          Estructura:
            section.events-section
              ├─ encabezado (etiqueta + título + frase)
              ├─ .ev-scroller  → la "ventana" que se desliza horizontalmente
              │    └─ ul.ev-track → fila de tarjetas (una <li> por evento)
              └─ .ev-footer   → flecha ‹ + indicadores + flecha ›
          ========================================================== */}
      <section id="eventos" className="events-section">
        <div className="wrap">

          {/* --- Encabezado de la sección --- */}
          <div className="events-header">
            {/* "Eyebrow": textito pequeño sobre el título que da contexto */}
            <span className="events-eyebrow">Agenda</span>
            <h2 className="events-title" data-split><Words text="Eventos" /></h2>
            <p className="events-sub">
              Momentos para aprender, jugar y compartir en familia.
            </p>
          </div>

          {/* --- Carrusel ---
              ref={scrollerRef}: nos deja controlar este elemento desde JavaScript
              (para mover el scroll con las flechas y saber en qué tarjeta estamos).
              tabIndex={0}: permite enfocarlo con el teclado y moverlo con ← →. */}
          <div className="ev-scroller" ref={scrollerRef} tabIndex={0} aria-label="Carrusel de eventos">
            <ul className="ev-track">
              {/* .map() recorre la lista EVENTS y dibuja una tarjeta por cada evento.
                  `ev` es el evento actual e `i` su posición (0, 1, 2...). */}
              {EVENTS.map((ev, i) => (
                <li className="ev-slide" key={ev.title}>
                  {/* Pasamos datos a CSS con variables:
                      --accent → color propio de esta tarjeta
                      --i      → posición, para que las tarjetas entren una tras otra */}
                  <article className="ev-card" style={{ "--accent": ev.color, "--i": i }}>
                    <div className="ev-card-inner">
                      {/* Foto de fondo. alt="" porque es decorativa (el texto ya dice todo) */}
                      <img className="ev-card-img" src={ev.image} alt="" loading="lazy" style={{ objectPosition: ev.position }} />

                      {/* Fecha tipo calendario. aria-hidden: los lectores de pantalla
                          la saltan, porque la fecha completa ya está en .ev-meta */}
                      <div className="ev-date-chip" aria-hidden="true">
                        <strong>{ev.day}</strong>
                        <span>{ev.month}</span>
                      </div>

                      {/* Datos del evento: fecha · hora · lugar */}
                      <p className="ev-meta">{ev.day} {ev.month} · {ev.time} · {ev.place}</p>
                      <h3 className="ev-title">{ev.title}</h3>

                      {/* Botón "Ver detalle": muestra una tarjetita con los datos del evento.
                          - Con mouse: aparece al pasar el cursor (CSS :hover)
                          - Con teclado: aparece al enfocar el botón (CSS :focus-visible)
                          - En celular: aparece al tocarlo (estado openEv) */}
                      <div className={`ev-more ${openEv === i ? "is-open" : ""}`}>
                        <button
                          type="button"
                          className="ev-link"
                          aria-expanded={openEv === i}
                          aria-describedby={`ev-pop-${i}`}
                          onClick={(e) => {
                            e.stopPropagation(); // evita que el "clic fuera" la cierre al instante
                            setOpenEv(openEv === i ? null : i);
                          }}
                        >
                          Ver detalle
                          <span className="ev-link-icon" aria-hidden="true">
                            <i className="fas fa-arrow-right"></i>
                          </span>
                        </button>

                        <div className="ev-pop" id={`ev-pop-${i}`} role="tooltip">
                          <strong>{ev.title}</strong>
                          <ul>
                            <li><i className="fas fa-calendar-day" aria-hidden="true"></i> {ev.day} {ev.month} · {ev.time}</li>
                            <li><i className="fas fa-location-dot" aria-hidden="true"></i> {ev.place}</li>
                          </ul>
                          <p>{ev.description}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Controles: ‹ flecha · indicadores · flecha › ---
              Van DEBAJO del carrusel para que el menú flotante nunca los tape. */}
          <div className="ev-footer">
            {/* Flecha anterior. `disabled` la apaga cuando ya estamos en la primera tarjeta */}
            <button
              type="button"
              className="ev-btn"
              aria-label="Evento anterior"
              onClick={() => scrollByStep(-1)}
              disabled={!canPrev}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Indicadores: un punto por cada posición del carrusel.
                Array.from({ length: n }) crea una lista de n elementos para recorrer.
                El punto activo (currentPage) se alarga y se pinta de amarillo. */}
            <div className="ev-indicators" role="group" aria-label="Posición en el carrusel">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`ev-indicator ${currentPage === i ? "is-active" : ""}`}
                  aria-label={`Ir al evento ${i + 1}`}
                  aria-current={currentPage === i ? "true" : undefined}
                  onClick={() => {
                    // Al pulsar un punto, desliza el carrusel hasta esa tarjeta
                    const el = scrollerRef.current;
                    if (!el) return;
                    el.scrollTo({ left: getStep() * i, behavior: "smooth" });
                  }}
                />
              ))}
            </div>

            {/* Flecha siguiente. Se apaga al llegar a la última tarjeta */}
            <button
              type="button"
              className="ev-btn"
              aria-label="Siguiente evento"
              onClick={() => scrollByStep(1)}
              disabled={!canNext}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================================
          NOSOTROS: presentación del jardín.
          Estructura:
            .nos-intro    → mosaico de fotos + texto principal
            .nos-pillars  → 4 tarjetas con lo que nos define
            .nos-quote    → frase destacada de cierre
          Los elementos con `data-reveal` aparecen animados al hacer scroll
          (el retraso de cada uno se controla con la variable --d).
          ========================================================== */}
      <section className="nos-section" id="Nosotros">
        <div className="wrap">

          {/* --- Fotos + texto --- */}
          <div className="nos-intro">
            {/* Mosaico: una foto grande y otra pequeña que se superpone */}
            <div className="nos-media" data-reveal="left">
              <div className="nos-photo nos-photo-main" data-parallax="0.04">
                <img src={pelados2} alt="Profesora y niños disfrazados posando en el jardín" loading="lazy" />
              </div>
              <div className="nos-photo nos-photo-small" data-parallax="0.13">
                <img src={jugando} alt="Niños jugando al aire libre" loading="lazy" />
              </div>
            </div>

            <div className="nos-text">
              <span className="nos-eyebrow" data-reveal>Nosotros</span>
              <h2 className="nos-title" data-split style={{ "--d": ".08s" }}>
                <Words text="Creemos en aprender" />
                <Words text="jugando" className="nos-title-highlight" start={3} />
              </h2>
              <p className="nos-lead" data-reveal style={{ "--d": ".16s" }}>
                En Jardín Sullivan creemos en el aprendizaje activo, el juego y
                la atención personalizada. Nuestro equipo trabaja en equipo para
                crear experiencias que fomenten la curiosidad, la creatividad y
                el respeto por los demás.
              </p>
              <p className="nos-body" data-reveal style={{ "--d": ".24s" }}>
                Nuestro proyecto educativo integra actividades artísticas,
                experimentos y salidas presenciales que enriquecen el desarrollo
                integral de los niños.
              </p>
            </div>
          </div>

          {/* --- Pilares: PILLARS.map() dibuja una tarjeta por cada elemento ---
              --tone le pasa al CSS el color de esa tarjeta */}
          <ul className="nos-pillars">
            {PILLARS.map((pillar, i) => (
              <li
                key={pillar.title}
                className="nos-pillar"
                data-reveal
                style={{ "--tone": pillar.color, "--d": `${i * 0.08}s` }}
              >
                <span className="nos-pillar-icon" aria-hidden="true">{pillar.icon}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </li>
            ))}
          </ul>

          {/* --- Frase de cierre --- */}
          <blockquote className="nos-quote" data-reveal>
            {/* data-scrub: las palabras se "encienden" una a una mientras bajas */}
            <p className="nos-quote-text" data-scrub>
              <Words scrub text="Prepararlos no solo para la escuela," />
              <Words scrub text="sino para la vida." className="nos-title-highlight" start={6} />
            </p>
            <p className="nos-quote-sub">
              Ayudándoles a construir una base sólida de confianza y autoestima.
            </p>
          </blockquote>
        </div>
      </section>

      {/* ==========================================================
          BANDA DE PALABRAS: dos filas gigantes que se deslizan de lado
          mientras bajas (data-slide-x). Es decorativa: aria-hidden.
          ========================================================== */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-row" data-slide-x="0.35">
          {/* Array(4).fill(...).flat(): repite las 3 palabras 4 veces para llenar el ancho */}
          {Array(4).fill(MARQUEE_ROW_1).flat().map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </div>
        <div className="marquee-row marquee-row-warm" data-slide-x="-0.35">
          {Array(4).fill(MARQUEE_ROW_2).flat().map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </div>
      </div>

      {/* ==========================================================
          GRUPOS: una tarjeta por edad. Se apilan al hacer scroll
          (data-stack + position: sticky). --i, --tone y --ink llegan al CSS.
          ========================================================== */}
      <section className="grupos-section" id="programas">
        <div className="wrap">
          <div className="grupos-head">
            <span className="nos-eyebrow" data-reveal>Programas</span>
            {/* data-split: el título sube palabra por palabra al aparecer */}
            <h2 className="grupos-title" data-split>
              <Words text="Un grupo para cada" />
              <Words text="etapa" className="nos-title-highlight" start={4} />
            </h2>
            <p className="grupos-sub" data-reveal style={{ "--d": ".16s" }}>
              Cada grupo acompaña a los niños según su edad, con actividades
              pensadas para su momento de desarrollo.
            </p>
          </div>

          <div className="grupos-stack">
            {GROUPS.map((group, i) => (
              <article
                key={group.name}
                className="grupo-card"
                data-stack
                style={{ "--i": i, "--tone": group.color, "--ink": group.ink }}
              >
                <div className="grupo-card-inner">
                  {/* La edad se parte en dos números ("1–3" → "1" y "3") para separarlos bien.
                      La parte visual se oculta a los lectores de pantalla (aria-hidden) y
                      se les da un texto claro con .sr-only: "De 1 a 3 años". */}
                  <div className="grupo-age">
                    <span className="sr-only">
                      De {group.age.split("–")[0]} a {group.age.split("–")[1]} años
                    </span>
                    <span className="grupo-age-num" aria-hidden="true">
                      {group.age.split("–")[0]}
                      <span className="grupo-age-dash">–</span>
                      {group.age.split("–")[1]}
                    </span>
                    <span className="grupo-age-label" aria-hidden="true">años</span>
                  </div>

                  <div className="grupo-info">
                    <p className="grupo-num">Grupo {i + 1}</p>
                    <h3>{group.name}</h3>
                    <p className="grupo-desc">{group.description}</p>
                    <ul className="grupo-tags">
                      {group.activities.map((activity) => (
                        <li key={activity}>{activity}</li>
                      ))}
                    </ul>
                  </div>

                  <span className="grupo-icon" aria-hidden="true">{group.icon}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
          BENEFICIOS: sección "anclada" con deslizamiento horizontal.
          Mientras bajas, el marco (.hs-sticky) se queda fijo en pantalla y
          la fila (.hs-track) se desplaza de lado. Lo controla el hook
          useScrollEffects gracias al atributo data-hscroll.
          Estructura:
            section[data-hscroll]  → alta: su altura es el "recorrido" del scroll
              └─ .hs-sticky        → marco fijo del tamaño de la pantalla
                   ├─ .hs-track    → fila que se mueve: introducción + 3 tarjetas
                   └─ .hs-progress → barrita de avance
          ========================================================== */}
      <section className="beneficios-section" id="beneficios" data-hscroll>
        <div className="hs-sticky">
          <div className="hs-track">

            {/* Primer panel: título de la sección */}
            <div className="hs-intro">
              <span className="nos-eyebrow" data-reveal>Beneficios</span>
              <h2 className="hs-title" data-split>
                <Words text="Lo que hace especial" />
                <Words text="nuestro jardín" className="nos-title-highlight" start={3} />
              </h2>
              <p className="hs-hint" data-reveal style={{ "--d": ".16s" }}>
                Sigue bajando
                <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </p>
            </div>

            {/* Una tarjeta por beneficio. --tone y --ink llegan al CSS */}
            {BENEFITS.map((benefit, i) => (
              <article
                key={benefit.title}
                className="beneficio-card"
                style={{ "--tone": benefit.color, "--ink": benefit.ink }}
              >
                <span className="beneficio-num" aria-hidden="true">0{i + 1}</span>
                {/* El círculo del emoji gira un poco según el avance (--hs) */}
                <span className="beneficio-circulo" aria-hidden="true">{benefit.icon}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>

          {/* Barrita que se llena según el avance de la sección */}
          <div className="hs-progress" aria-hidden="true"><span></span></div>
        </div>
      </section>

      {/* ==========================================================
          MATRÍCULA: llamada a la acción. El botón lleva a la página /matricula
          (ruta definida en routes/index.jsx). Usamos <Link> para navegar sin recargar.
          ========================================================== */}
      <section className="matricula-section" id="matricula">
        <div className="wrap">
          <div className="matricula-panel" data-reveal>
            <div className="matricula-copy">
              <span className="matricula-eyebrow">Inscripciones</span>
              <h2 className="matricula-title" data-split>
                <Words text="¿Deseas matricular a tu hijo" />
                <Words text="en nuestro jardín?" className="nos-title-highlight" start={5} />
              </h2>
              <p className="matricula-sub">
                Cuéntanos sobre tu familia y el jardín se pondrá en contacto contigo.
              </p>
              <div className="matricula-actions">
                <Link to="/matricula" className="matricula-btn">
                  Inscribir ahora
                  <span className="matricula-btn-icon" aria-hidden="true">
                    <i className="fas fa-arrow-right"></i>
                  </span>
                </Link>
                <a href="#contacto" className="matricula-link">Ver datos de contacto</a>
              </div>
            </div>

            {/* Sol gigante decorativo: gira según cuánto has bajado (--scroll) y se mueve con parallax */}
            <div className="matricula-art" aria-hidden="true" data-parallax="0.06">
              <Logo showText={false} />
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          METODOLOGÍA: el párrafo se "enciende" palabra por palabra al bajar (data-scrub)
          y un sello circular gira con el scroll.
          ========================================================== */}
      <section className="metodologia-section" id="metodologia">
        <div className="wrap metodo-grid">
          <div className="metodo-text">
            <span className="nos-eyebrow" data-reveal>Nuestra metodología</span>
            <h2 className="metodo-title" data-split>
              <Words text="Aprendizaje" />
              <Words text="activo" className="nos-title-highlight" start={1} />
            </h2>
            <p className="metodo-lead" data-scrub>
              <Words
                scrub
                text="Nuestro enfoque educativo está basado en el método de aprendizaje activo, donde los niños son los protagonistas de su propio desarrollo. Creemos en la importancia del juego como herramienta fundamental para el aprendizaje, ya que permite desarrollar habilidades sociales, emocionales y cognitivas de manera natural."
              />
            </p>
            <ul className="metodo-chips">
              {["Habilidades sociales", "Habilidades emocionales", "Habilidades cognitivas"].map((chip, i) => (
                <li key={chip} data-reveal style={{ "--d": `${i * 0.1}s`, "--dot": ["#28A8E3", "#F25141", "#93C524"][i] }}>
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <div className="metodo-media" data-reveal="right">
            <div className="metodo-photo" data-parallax="0.04">
              <img
                src={baile}
                alt="Niños del jardín con trajes típicos colombianos en una actividad"
                loading="lazy"
              />
            </div>

            {/* Sello circular: el texto sigue un círculo (textPath) y gira con el scroll */}
            <svg className="metodo-badge" viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="98" fill="#FEBF22" />
              <defs>
                <path id="metodoCirculo" d="M100,100 m-70,0 a70,70 0 1,1 140,0 a70,70 0 1,1 -140,0" />
              </defs>
              <g className="metodo-badge-ring">
                <text fill="#1B3158" fontSize="15" fontWeight="800" letterSpacing="1">
                  {/* textLength estira el texto para que dé justo una vuelta completa */}
                  <textPath href="#metodoCirculo" textLength="432" lengthAdjust="spacing">
                    APRENDIZAJE ACTIVO • JUEGO • EXPLORACIÓN •
                  </textPath>
                </text>
              </g>
              <path d="M100 76 L107 93 L124 100 L107 107 L100 124 L93 107 L76 100 L93 93 Z" fill="#1B3158" />
            </svg>
          </div>
        </div>
      </section>

      {/* ==========================================================
          FOOTER (pie de página). id="contacto": a él apuntan los botones
          "Conocer más" y "Ver datos de contacto".
          Estructura: logo + título → datos de contacto y mapa → enlaces → franja final.
          El nombre gigante del fondo es decorativo y se desliza de lado al bajar.
          ========================================================== */}
      <footer className="footer" id="contacto">
        <div className="footer-panel">
          <div className="wrap">

            <div className="footer-head">
              <Logo tone="light" />
              <h2 className="footer-title" data-split>
                <Words text="Ven a" />
                <Words text="conocernos" className="nos-title-highlight" start={2} />
              </h2>
              <p className="footer-sub" data-reveal style={{ "--d": ".12s" }}>
                Un espacio donde la educación y el corazón se unen.
              </p>
            </div>

            <div className="footer-grid">
              {/* Datos de contacto: cada fila tiene un ícono de color (--tone) */}
              <ul className="footer-list">
                <li data-reveal style={{ "--tone": "#FEBF22" }}>
                  <span className="footer-ico" aria-hidden="true"><i className="fas fa-location-dot"></i></span>
                  <div>
                    <strong>Dirección</strong>
                    <p>Carrera 87, Calle 53 Sur #49A, Bogotá</p>
                  </div>
                </li>

                <li data-reveal style={{ "--tone": "#28A8E3", "--d": ".08s" }}>
                  <span className="footer-ico" aria-hidden="true"><i className="fas fa-phone"></i></span>
                  <div>
                    <strong>Línea administrativa</strong>
                    {/* href="tel:..." hace que en el celular se pueda llamar con un toque */}
                    <a href="tel:+576015551324">Teléfono: (601) 555 1324</a>
                    <a href="tel:+573004557890">Celular: 300 455 7890</a>
                  </div>
                </li>

                <li data-reveal style={{ "--tone": "#93C524", "--d": ".16s" }}>
                  <span className="footer-ico" aria-hidden="true"><i className="fas fa-envelope"></i></span>
                  <div>
                    <strong>Correos</strong>
                    {/* href="mailto:..." abre el programa de correo */}
                    <a href="mailto:coordinacion@sullivan.edu.co">Coordinación: coordinacion@sullivan.edu.co</a>
                    <a href="mailto:psicologia@sullivan.edu.co">Psicología: psicologia@sullivan.edu.co</a>
                    <a href="mailto:secretaria@sullivan.edu.co">Secretaría: secretaria@sullivan.edu.co</a>
                  </div>
                </li>

                <li data-reveal style={{ "--tone": "#F25141", "--d": ".24s" }}>
                  <span className="footer-ico" aria-hidden="true"><i className="fas fa-clock"></i></span>
                  <div>
                    <strong>Horarios de atención</strong>
                    <p>Lunes a viernes: 7:30 a.m. - 5:00 p.m.</p>
                    <p>Sábados: 8:00 a.m. - 12:00 m.</p>
                  </div>
                </li>
              </ul>

              {/* Mapa de Google incrustado (loading="lazy": no se descarga hasta que te acercas) */}
              <div
                className="footer-map"
                role="region"
                aria-label="Mapa de ubicación Jardín Sullivan"
                data-reveal="right"
              >
                <iframe
                  title="Ubicación Jardín Sullivan"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Sullivan+Kinder%2C+Carrera+87%2C+Cl.+53+Sur+%2349A%2C+Bogot%C3%A1%2C+Cundinamarca%2C+Colombia&output=embed"
                ></iframe>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <nav className="footer-nav" aria-label="Enlaces del pie de página">
              <a href="#inicio">Inicio</a>
              <a href="#eventos">Eventos</a>
              <a href="#Nosotros">Nosotros</a>
              <a href="#programas">Programas</a>
              <Link to="/matricula">Inscripciones</Link>
              <Link to="/login">Inicia sesión</Link>
            </nav>

            {/* Franja final: derechos, privacidad y botón para volver arriba */}
            <div className="footer-bottom">
              {/* new Date().getFullYear() pone el año actual solo, sin tener que editarlo cada enero */}
              <p>© {new Date().getFullYear()} Jardín Infantil Sullivan</p>
              <a href="#inicio" className="footer-top" aria-label="Volver al inicio de la página">
                <i className="fas fa-arrow-up" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          {/* Nombre gigante de fondo (decorativo) */}
          <p className="footer-giant" aria-hidden="true" data-slide-x="0.08">JARDÍN SULLIVAN</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
