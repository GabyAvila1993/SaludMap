import React, { useState, useEffect } from 'react';
import './ModalAuth.css';
import { useAuth } from './AuthContext';

/**
 * Modal de autenticación que permite login y registro
 * @param {Object} props - Props del componente
 * @param {boolean} props.open - Si el modal está abierto o cerrado
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {boolean} props.showRegister - Si muestra formulario de registro
 * @param {Function} props.setShowRegister - Función para alternar entre login/registro
 * @returns {JSX.Element|null} Modal de autenticación o null si está cerrado
 */
export default function ModalAuth({ open, onClose, showRegister, setShowRegister }) {
	const { login, register } = useAuth();
	const [form, setForm] = useState({ 
		mail: '', 
		contrasenia: '', 
		nombre: '', 
		apellido: '' 
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	/**
	 * Maneja los cambios en los campos del formulario
	 * @param {Event} e - Evento del input
	 */
	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	/**
	 * Maneja el envío del formulario (login o registro)
	 * @param {Event} e - Evento del formulario
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			if (showRegister) {
				// Validación para registro
				if (!form.nombre || !form.apellido || !form.mail || !form.contrasenia) {
					setError('Completa todos los campos');
					setLoading(false);
					return;
				}
				await register(form);
				onClose();
			} else {
				// Validación para login
				if (!form.mail || !form.contrasenia) {
					setError('Completa todos los campos');
					setLoading(false);
					return;
				}
				await login({ mail: form.mail, contrasenia: form.contrasenia });
				onClose();
			}
		} catch (err) {
			setError(err?.response?.data?.message || 'Error de autenticación');
		} finally {
			setLoading(false);
		}
	};

	// Limpiar formulario y errores cuando se cierra el modal
	useEffect(() => {
		if (!open) {
			setError('');
			setForm({ mail: '', contrasenia: '', nombre: '', apellido: '' });
			setLoading(false);
		}
	}, [open]);

	if (!open) return null;

	return (
		<div className="modal-overlay">
			<div className="modal-panel small">
				<div className="h1">{showRegister ? 'Registro' : 'Login'}</div>
				<form onSubmit={handleSubmit}>
					{showRegister && (
						<>
							<input 
								placeholder="Nombre" 
								name="nombre" 
								type="text" 
								value={form.nombre} 
								onChange={handleChange}
								disabled={loading}
							/>
							<input 
								placeholder="Apellido" 
								name="apellido" 
								type="text" 
								value={form.apellido} 
								onChange={handleChange}
								disabled={loading}
							/>
						</>
					)}
					<input
						pattern="^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$"
						placeholder="Email"
						name="mail"
						type="text"
						value={form.mail}
						onChange={handleChange}
						disabled={loading}
					/>
					<input
						placeholder="Contraseña"
						name="contrasenia"
						type="password"
						value={form.contrasenia}
						onChange={handleChange}
						disabled={loading}
					/>
					<input 
						value={loading ? 'Procesando...' : (showRegister ? 'Registrarse' : 'Login')} 
						className="btn" 
						type="submit"
						disabled={loading}
					/>
				</form>
				{error && <div className="modal-error">{error}</div>}
				<div className="modal-footer modal-auth-footer">
					{showRegister ? (
						<span>
							¿Ya tienes cuenta?{' '}
							<button 
								type="button" 
								className="btn-link" 
								onClick={() => setShowRegister(false)}
								disabled={loading}
							>
								Iniciar sesión
							</button>
						</span>
					) : (
						<span>
							¿No tienes cuenta?{' '}
							<button 
								type="button" 
								className="btn-link" 
								onClick={() => setShowRegister(true)}
								disabled={loading}
							>
								Registrarse
							</button>
						</span>
					)}
				</div>
				<button 
					className="modal-close" 
					onClick={onClose}
					disabled={loading}
					aria-label="Cerrar"
				>
					×
				</button>
			</div>
		</div>
	);
}
