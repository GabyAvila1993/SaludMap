/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from './services/authService.js';

const AuthContext = createContext();

/**
 * Proveedor de contexto de autenticación
 * Maneja el estado global del usuario autenticado y proporciona funciones
 * para login, register y logout
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element} Proveedor de contexto
 */
export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Cargar usuario desde localStorage al iniciar la aplicación
		const stored = localStorage.getItem('saludmap_user');
		if (stored) {
			try {
				setUser(JSON.parse(stored));
			} catch (error) {
				console.error('Error al parsear usuario guardado:', error);
				localStorage.removeItem('saludmap_user');
			}
		}
		setLoading(false);
	}, []);

	/**
	 * Inicia sesión con las credenciales proporcionadas
	 * @param {Object} credentials - Credenciales de acceso
	 * @param {string} credentials.mail - Email del usuario
	 * @param {string} credentials.contrasenia - Contraseña del usuario
	 * @returns {Promise<void>}
	 */
	const login = async ({ mail, contrasenia }) => {
		try {
			const userData = await authService.login({ mail, contrasenia });
			setUser(userData);
			localStorage.setItem('saludmap_user', JSON.stringify(userData));
			// Guardar el token JWT separadamente para las peticiones API
			if (userData.token) {
				localStorage.setItem('token', userData.token);
			}
		} catch (error) {
			console.error('Error en login:', error);
			throw error;
		}
	};

	/**
	 * Registra un nuevo usuario en el sistema
	 * @param {Object} userData - Datos del usuario
	 * @param {string} userData.nombre - Nombre del usuario
	 * @param {string} userData.apellido - Apellido del usuario
	 * @param {string} userData.mail - Email del usuario
	 * @param {string} userData.contrasenia - Contraseña del usuario
	 * @returns {Promise<void>}
	 */
	const register = async ({ nombre, apellido, mail, contrasenia }) => {
		try {
			const userData = await authService.register({ nombre, apellido, mail, contrasenia });
			setUser(userData);
			localStorage.setItem('saludmap_user', JSON.stringify(userData));
			// Guardar el token JWT separadamente para las peticiones API
			if (userData.token) {
				localStorage.setItem('token', userData.token);
			}
		} catch (error) {
			console.error('Error en registro:', error);
			throw error;
		}
	};

	/**
	 * Cierra la sesión del usuario actual
	 * Limpia el estado y el localStorage
	 */
	const logout = () => {
		setUser(null);
		localStorage.removeItem('saludmap_user');
		localStorage.removeItem('token');
	};

	return (
		<AuthContext.Provider value={{ user, login, register, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} Objeto con el estado y funciones de autenticación
 * @returns {Object|null} returns.user - Usuario actual o null
 * @returns {Function} returns.login - Función para iniciar sesión
 * @returns {Function} returns.register - Función para registrar usuario
 * @returns {Function} returns.logout - Función para cerrar sesión
 * @returns {boolean} returns.loading - Estado de carga inicial
 */
export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth debe ser usado dentro de un AuthProvider');
	}
	return context;
}
