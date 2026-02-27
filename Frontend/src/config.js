// Se acepta la variable histórica VITE_API_BASE_URL (usada en .env.production)
// y `VITE_API_URL` para mayor claridad. En modo dev ninguna puede estar definida,
// por lo que volvemos a una ruta relativa y dejamos que vite haga proxy.
export const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';
