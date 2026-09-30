# Jardín Sullivan · Demo interactiva

Versión de **demostración** del sistema de gestión del Jardín Infantil Sullivan. Se puede recorrer
completo (landing, login y los paneles de **administrador**, **profesor** y **acudiente**) sin instalar nada
y **sin servidor**: los datos son de ejemplo y viven en el navegador.

**Ver la demo:** https://pulise222.github.io/jardin-sullivan-demo/

> El proyecto real (con backend Django + MySQL) está en
> [jardin-sullivan-gestion-crud](https://github.com/pulise222/jardin-sullivan-gestion-crud).
> Este repositorio es solo el front-end con un servidor simulado para poder mostrarlo.

## Cuentas de prueba

En la pantalla de login hay un botón **«Cuentas de prueba»** que las muestra. Todas usan la contraseña `Demo2026*`:

| Rol | Usuario |
| --- | --- |
| Administrador | `admin` |
| Profesor | `profesor` |
| Acudiente | `acudiente` |

## ¿Cómo funciona sin backend?

El front usa **RTK Query** para hablar con la API. En el proyecto real, esa capa envía peticiones HTTP a Django.
En esta demo se le cambió una sola pieza, el `baseQuery` (`src/features/api/apiSlicer.js`), por una función que
contesta directamente con datos de ejemplo (`src/demo/mockServer.js` y `src/demo/mockData.js`).

Gracias a eso **ninguna pantalla cambió**: siguen usando los mismos hooks y la misma lógica que en el proyecto real.

- Lo que crees o edites (estudiantes, notas, asistencia, eventos…) se guarda en el `localStorage` de **tu** navegador.
- El botón **Restablecer** (abajo a la derecha) vuelve a los datos originales.
- Las funciones que dependen de un servidor real (enviar correos, descargar el boletín en PDF, guardar archivos) están simuladas o deshabilitadas.

## Tecnologías

React 19 · Vite · React Router · Redux Toolkit + RTK Query · Formik + Yup · CSS propio (sistema de diseño de los paneles).

## Correrlo en local

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173/jardin-sullivan-demo/`.

## Publicación

Cada vez que se sube código a `main`, una acción de GitHub (`.github/workflows/deploy.yml`) compila el proyecto y lo
publica en GitHub Pages. Para activarlo la primera vez: *Settings → Pages → Source → GitHub Actions*.
