// src/hooks/useScrollEffects.js
import { useEffect } from "react";

/*
  ======================================================================
  useScrollEffects: animaciones que dependen de CUÁNTO has bajado.
  ======================================================================
  Un "hook personalizado" es una función que empieza con `use` y agrupa lógica
  de React reutilizable. Este no devuelve nada: al montarse, busca en la página
  los elementos marcados con ciertos atributos `data-*` y los anima al hacer scroll.

  Atributos que entiende (se escriben en el JSX):

    data-parallax="0.1"   El elemento se mueve en vertical a distinta velocidad
                          que el scroll (profundidad). Número positivo = sube
                          más lento; negativo = al revés. Usa la propiedad CSS
                          `translate`, que no choca con `transform`.
    data-slide-x="0.3"    Se desliza en HORIZONTAL mientras bajas (para las
                          bandas de palabras). Positivo = va a la izquierda.
    data-scrub            El texto "se enciende" palabra por palabra al bajar.
                          Necesita palabras dentro de <Words scrub />.
    data-stack            Tarjetas apiladas (sticky). La tarjeta que queda
                          debajo se encoge y oscurece cuando la siguiente
                          la cubre. Escribe la variable CSS --stack (0 a 1).
    data-hscroll          Sección "anclada": se queda fija en pantalla mientras
                          bajas y su contenido (.hs-track) se desliza de lado.
                          El hook le da a la sección una altura igual a la
                          distancia horizontal a recorrer + una pantalla, y
                          convierte el scroll vertical en movimiento horizontal.
                          Escribe --hs (0 a 1) con el avance.

  Además guarda cuánto has bajado (0 a 1) en la variable CSS --scroll, que usa
  la barra de progreso de arriba.

  Por rendimiento: (1) solo se calculan los elementos que están en pantalla y
  (2) se actualiza como máximo una vez por fotograma (requestAnimationFrame).
*/

// Limita un número entre un mínimo y un máximo
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export default function useScrollEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1) Buscamos los elementos de cada tipo (una sola vez, al montar)
    const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
    const slideEls = [...document.querySelectorAll("[data-slide-x]")];
    const scrubBlocks = [...document.querySelectorAll("[data-scrub]")].map((el) => ({
      el,
      words: [...el.querySelectorAll(".sw-in")],
    }));
    const stackCards = [...document.querySelectorAll("[data-stack]")];
    const hscrollBlocks = [...document.querySelectorAll("[data-hscroll]")].map((el) => ({
      el,
      track: el.querySelector(".hs-track"),
    }));

    // Mide cuánto hay que deslizar de lado y le da a cada sección esa altura de scroll.
    // (Se vuelve a medir al cambiar el tamaño de la ventana o al cargar las fuentes.)
    function measure() {
      if (reduceMotion) return; // sin animación no se ancla: queda como una rejilla normal
      hscrollBlocks.forEach(({ el, track }) => {
        const distance = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
        el.style.height = `${distance + window.innerHeight}px`;
      });
    }

    // 2) Vigilamos cuáles están en pantalla para no calcular de más
    const onScreen = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        });
        update();
      },
      { rootMargin: "20% 0px" }
    );
    [
      ...parallaxEls,
      ...slideEls,
      ...scrubBlocks.map((b) => b.el),
      ...stackCards,
      ...hscrollBlocks.map((b) => b.el),
    ].forEach((el) => io.observe(el));

    // 3) Lo que se recalcula en cada fotograma
    function update() {
      const vh = window.innerHeight;

      // Barra de progreso: 0 arriba del todo, 1 al llegar al final
      const maxScroll = root.scrollHeight - vh;
      root.style.setProperty("--scroll", maxScroll > 0 ? clamp(window.scrollY / maxScroll).toFixed(4) : 0);

      if (reduceMotion) return; // quien pide menos movimiento no ve estos efectos

      // --- Parallax vertical ---
      parallaxEls.forEach((el) => {
        if (!onScreen.has(el)) return;
        const rect = el.getBoundingClientRect();
        // rect ya incluye el desplazamiento anterior; lo restamos para medir la posición "real"
        const prev = Number(el.dataset.ty || 0);
        const distFromCenter = rect.top - prev + rect.height / 2 - vh / 2;
        const ty = -distFromCenter * Number(el.dataset.parallax);
        el.dataset.ty = ty;
        el.style.translate = `0 ${ty.toFixed(1)}px`;
      });

      // --- Deslizamiento horizontal (bandas de palabras) ---
      slideEls.forEach((el) => {
        if (!onScreen.has(el)) return;
        const rect = el.getBoundingClientRect();
        const distFromCenter = rect.top + rect.height / 2 - vh / 2;
        el.style.translate = `${(-distFromCenter * Number(el.dataset.slideX)).toFixed(1)}px 0`;
      });

      // --- Texto que se enciende palabra por palabra ---
      scrubBlocks.forEach(({ el, words }) => {
        if (!onScreen.has(el)) return;
        const rect = el.getBoundingClientRect();
        // Empieza a encenderse cuando el TOPE del bloque asoma al 85% de la pantalla y queda
        // totalmente encendido cuando ese tope llega al 30%. Así, mientras lo estás leyendo
        // (bloque en la mitad superior/media de la pantalla) ya se lee completo.
        const start = vh * 0.85;
        const end = vh * 0.3;
        const progress = clamp((start - rect.top) / (start - end));
        words.forEach((word, i) => {
          // cada palabra se enciende cuando el progreso "llega" a su turno
          const lit = clamp(progress * words.length - i);
          word.style.opacity = (0.16 + 0.84 * lit).toFixed(2);
        });
      });

      // --- Sección anclada con deslizamiento horizontal ---
      hscrollBlocks.forEach(({ el, track }) => {
        if (!onScreen.has(el)) return;
        // cuánto scroll vertical "sobra" mientras la sección está anclada
        const scrollable = el.offsetHeight - vh;
        const progress = clamp(-el.getBoundingClientRect().top / (scrollable || 1));
        const distance = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
        track.style.translate = `${(-progress * distance).toFixed(1)}px 0`;
        el.style.setProperty("--hs", progress.toFixed(3));
      });

      // --- Tarjetas apiladas ---
      stackCards.forEach((card, i) => {
        const next = stackCards[i + 1];
        if (!next) return; // la última no queda cubierta por nadie
        const cardBox = card.getBoundingClientRect();
        const nextTop = next.getBoundingClientRect().top;
        // dónde queda "pegada" (sticky) cada tarjeta: el valor de su propiedad top
        const stuckTop = parseFloat(getComputedStyle(card).top) || 0;
        const nextStuckTop = parseFloat(getComputedStyle(next).top) || 0;
        // p = 0 mientras la siguiente aún está lejos; p = 1 cuando ya la cubrió por completo
        const p = clamp((stuckTop + cardBox.height - nextTop) / (stuckTop + cardBox.height - nextStuckTop));
        card.style.setProperty("--stack", p.toFixed(3));
      });
    }

    // 4) Un solo "escuchador" de scroll, limitado a 1 cálculo por fotograma
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(onResize); // las fuentes cambian los anchos: medimos otra vez
    measure();
    update(); // estado inicial

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      hscrollBlocks.forEach(({ el }) => el.style.removeProperty("height"));
      io.disconnect();
      root.style.removeProperty("--scroll");
    };
  }, []);
}
