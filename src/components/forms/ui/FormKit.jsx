// src/components/forms/ui/FormKit.jsx
/*
  Piezas reutilizables para TODOS los formularios del panel.
  Antes cada formulario repetía cientos de líneas de HTML casi iguales; ahora se arman
  con estas piezas y se ven idénticos. Los estilos (pn-modal, pn-field…) están en styles/panel.css.

    <ModalCard>    → tarjeta de la ventana: ícono + título + subtítulo
    <Field>        → etiqueta + campo (input, select o textarea) + mensaje de error, conectado a Formik
    <FormAlert>    → aviso rojo para errores del servidor
    <FormFooter>   → botones Cancelar / Guardar con estado "cargando"
*/

// Tarjeta de la ventana emergente
export function ModalCard({ icon = 'fa-pen', title, subtitle, titleId, children }) {
  return (
    <div className="pn-modal" role="document">
      <header className="pn-modal-head">
        <span className="pn-modal-ico" aria-hidden="true"><i className={`fas ${icon}`}></i></span>
        <div>
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </header>
      {children}
    </div>
  );
}

/*
  Campo de formulario conectado a Formik.
  Props:
    formik  → el objeto que devuelve useFormik()
    name    → nombre del campo (debe existir en initialValues)
    label   → texto de la etiqueta
    as      → "input" (por defecto), "select" o "textarea"
    type    → tipo del input (text, email, date…)
    span    → true para que ocupe las dos columnas
    hint    → texto de ayuda pequeño
    children→ las <option> si es un select
  Cualquier otra propiedad (placeholder, disabled, readOnly…) se pasa al campo.
*/
export function Field({ formik, name, label, as = 'input', type = 'text', span = false, hint, children, ...rest }) {
  const error = formik.touched[name] && formik.errors[name];
  const props = {
    id: name,
    name,
    value: formik.values[name] ?? '',
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': error ? `${name}-error` : undefined,
    ...rest,
  };

  return (
    <div className={`pn-field ${span ? 'pn-span-2' : ''}`.trim()}>
      <label htmlFor={name}>{label}</label>
      {as === 'select' && <select {...props}>{children}</select>}
      {as === 'textarea' && <textarea rows={4} {...props} />}
      {as === 'input' && <input type={type} autoComplete="off" {...props} />}
      {hint && !error && <p className="pn-field-hint">{hint}</p>}
      {error && <p className="pn-field-error" id={`${name}-error`} role="alert">{error}</p>}
    </div>
  );
}

// Aviso de error del servidor
export function FormAlert({ message }) {
  if (!message) return null;
  return (
    <div className="pn-form-alert" role="alert">
      <i className="fas fa-circle-exclamation" aria-hidden="true"></i>
      {message}
    </div>
  );
}

// Botones de abajo
export function FormFooter({ onCancel, loading, submitLabel, loadingLabel, icon = 'fa-check' }) {
  return (
    <footer className="pn-modal-foot">
      <button type="button" className="pn-btn-ghost" onClick={onCancel}>Cancelar</button>
      <button type="submit" className="pn-btn" disabled={loading}>
        {loading ? (
          <><span className="pn-spinner-sm" aria-hidden="true"></span>{loadingLabel}</>
        ) : (
          <><i className={`fas ${icon}`} aria-hidden="true"></i>{submitLabel}</>
        )}
      </button>
    </footer>
  );
}
