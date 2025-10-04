import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api.js';

/**
 * Registra un nuevo usuario en el sistema
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.nombre - Nombre del usuario
 * @param {string} userData.apellido - Apellido del usuario
 * @param {string} userData.mail - Email del usuario
 * @param {string} userData.contrasenia - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario registrado
 */
export async function register({ nombre, apellido, mail, contrasenia }) {
	try {
		const url = buildApiUrl(API_ENDPOINTS.USER_REGISTER);
		const res = await axios.post(url, { nombre, apellido, mail, contrasenia });
		return res.data;
	} catch (error) {
		console.error('Error en registro:', error);
		throw error;
	}
}

/**
 * Inicia sesión de un usuario
 * @param {Object} credentials - Credenciales de acceso
 * @param {string} credentials.mail - Email del usuario
 * @param {string} credentials.contrasenia - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario autenticado { id, nombre, apellido, mail }
 */
export async function login({ mail, contrasenia }) {
	try {
		const url = buildApiUrl(API_ENDPOINTS.USER_LOGIN);
		const res = await axios.post(url, { mail, contrasenia });
		return res.data;
	} catch (error) {
		console.error('Error en login:', error);
		throw error;
	}
}

/**
 * Cierra la sesión del usuario (logout local)
 * Si el backend implementa un endpoint de logout, se puede agregar aquí
 * @returns {Promise<boolean>} true si el logout fue exitoso
 */
export async function logout() {
	// Si tu backend tiene /usuarios/logout, descomentar y usar:
	// const url = buildApiUrl('/usuarios/logout');
	// await axios.post(url);
	return true;
}
