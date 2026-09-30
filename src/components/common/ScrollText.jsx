// src/components/common/ScrollText.jsx
import { Fragment } from "react";

/*
  <Words> divide un texto en palabras, cada una dentro de su propia "caja".
  Con eso el CSS puede animar palabra por palabra (efecto de títulos que
  suben una tras otra, o texto que se enciende al hacer scroll).

  Props:
    text       → el texto a dividir
    className  → clase extra para cada palabra (p. ej. la del degradado)
    start      → número de la primera palabra; sirve para continuar la cuenta
                 cuando un título se arma con varios <Words> seguidos
    scrub      → true = modo "se enciende con el scroll" (sin máscara)

  Cada palabra recibe --w (su número). El CSS lo usa para el retraso escalonado:
    palabra 0 → sin retraso, palabra 1 → 70 ms, palabra 2 → 140 ms...

  Estructura que genera:
    <span class="sw">            ← "ventana" que recorta (máscara)
      <span class="sw-in">…</span>  ← la palabra, que es la que se mueve
    </span>
*/
export function Words({ text, className = "", start = 0, scrub = false }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      <span className={scrub ? "sw-scrub" : "sw"}>
        <span className={`sw-in ${className}`.trim()} style={{ "--w": start + i }}>
          {word}
        </span>
      </span>
      {" "}
    </Fragment>
  ));
}
