// src/components/common/Logo.jsx
import "./Logo.css";

/*
  Logo del Jardín Sullivan: sol sonriente + nombre.

  Es un componente reutilizable: en vez de copiar este dibujo en cada página,
  lo escribimos una vez aquí y lo usamos donde haga falta con <Logo />.

  Props:
    showText → false para mostrar solo el sol (útil en espacios pequeños)
    tone     → "light" para usarlo sobre fondos oscuros (texto claro); por defecto, oscuro

  El sol es un SVG: un dibujo hecho con código que se ve nítido a cualquier
  tamaño. Los colores son los de la paleta del proyecto.
*/
export default function Logo({ showText = true, tone = "dark" }) {
  return (
    <span className={`sl-logo ${tone === "light" ? "sl-logo--light" : ""}`.trim()}>
      {/* aria-hidden: es decorativo; el nombre ya lo dice el texto de al lado */}
      <svg className="sl-logo-sun" viewBox="0 0 100 100" aria-hidden="true">
        {/* Rayos */}
        <g className="sl-logo-rays" stroke="#FEBF22" strokeWidth="9" strokeLinecap="round">
          <line x1="50" y1="5" x2="50" y2="17" />
          <line x1="50" y1="83" x2="50" y2="95" />
          <line x1="5" y1="50" x2="17" y2="50" />
          <line x1="83" y1="50" x2="95" y2="50" />
          <line x1="18" y1="18" x2="27" y2="27" />
          <line x1="73" y1="73" x2="82" y2="82" />
          <line x1="82" y1="18" x2="73" y2="27" />
          <line x1="27" y1="73" x2="18" y2="82" />
        </g>
        {/* Cara: círculo amarillo, dos ojos y una sonrisa */}
        <circle cx="50" cy="50" r="28" fill="#FEBF22" />
        <circle cx="41" cy="46" r="4" fill="#1B3158" />
        <circle cx="59" cy="46" r="4" fill="#1B3158" />
        <path d="M39 56 Q50 68 61 56" fill="none" stroke="#1B3158" strokeWidth="4.5" strokeLinecap="round" />
      </svg>

      {showText && (
        <span className="sl-logo-text">
          Jardín <span>Sullivan</span>
        </span>
      )}
    </span>
  );
}
