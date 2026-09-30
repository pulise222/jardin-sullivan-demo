// src/hooks/useFreeScroll.js
import { useEffect } from "react";

/*
  useFreeScroll: deja que la página haga scroll con normalidad.

  PROBLEMA: index.css le pone al elemento #root "overflow: hidden" y "width: 100vw"
  (pensado para los paneles de administración). En las páginas públicas eso rompe dos cosas:
    1) position: sticky no funciona dentro de un contenedor con overflow.
    2) 100vw + la barra de scroll vertical crea una barra horizontal molesta.

  SOLUCIÓN: mientras la página está abierta corregimos esos dos estilos, y al salir
  los devolvemos a como estaban (la función que retorna useEffect se llama "cleanup").
  Así no afectamos a los demás paneles. Lo usan la landing y la página de matrícula.
*/
export default function useFreeScroll() {
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    const prevOverflow = root.style.overflow;
    const prevWidth = root.style.width;
    root.style.overflow = "visible";
    root.style.width = "100%";
    root.classList.add("root-scroll-enabled");

    return () => {
      root.style.overflow = prevOverflow;
      root.style.width = prevWidth;
      root.classList.remove("root-scroll-enabled");
    };
  }, []);
}
