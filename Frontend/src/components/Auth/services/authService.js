import axios from 'axios';

/** Registro de usuario */
export async function register({ nombre, apellido, mail, contrasenia }) {
  const res = await axios.post('/usuarios/register', { nombre, apellido, mail, contrasenia });
  return res.data;
}

/** Login de usuario */
export async function login({ mail, contrasenia }) {
  const res = await axios.post('/usuarios/login', { mail, contrasenia });
  return res.data; // { id, nombre, apellido, mail }
}

/** Logout local (si más adelante hay endpoint, úsalo aquí) */
export async function logout() {
  // Si tu backend tiene /usuarios/logout, llama aquí:
  // await axios.post('/usuarios/logout');
  return true;
}
