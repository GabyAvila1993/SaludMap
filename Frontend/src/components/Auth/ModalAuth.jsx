import React, { useState, useEffect } from 'react';
import './ModalAuth.css';
import { useAuth } from './AuthContext';


export default function ModalAuth({ open, onClose, showRegister, setShowRegister }) {
  const { login, register } = useAuth();
  const [form, setForm] = useState({ mail: "", contrasenia: "", nombre: "", apellido: "" });
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (showRegister) {
        if (!form.nombre || !form.apellido || !form.mail || !form.contrasenia) {
          setError('Completa todos los campos');
          return;
        }
        await register(form);
        onClose();
      } else {
        if (!form.mail || !form.contrasenia) {
          setError('Completa todos los campos');
          return;
        }
        await login(form);
        onClose();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Error de autenticación');
    }
  };

  useEffect(() => {
    if (!open) {
      setError('');
      setForm({ mail: "", contrasenia: "", nombre: "", apellido: "" });
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-auth-overlay">
      <div className="login wrap">
        <div className="h1">{showRegister ? 'Registro' : 'Login'}</div>
        <form onSubmit={handleSubmit}>
          {showRegister && (
            <>
              <input placeholder="Nombre" name="nombre" type="text" value={form.nombre} onChange={handleChange} />
              <input placeholder="Apellido" name="apellido" type="text" value={form.apellido} onChange={handleChange} />
            </>
          )}
          <input
            pattern="^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$"
            placeholder="Email"
            name="mail"
            type="text"
            value={form.mail}
            onChange={handleChange}
          />
          <input
            placeholder="Password"
            name="contrasenia"
            type="password"
            value={form.contrasenia}
            onChange={handleChange}
          />
          <input value={showRegister ? "Registrarse" : "Login"} className="btn" type="submit" />
        </form>
        {error && <div style={{ color: "#ff8080", marginTop: 10 }}>{error}</div>}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          {showRegister ? (
            <span>
              ¿Ya tienes cuenta?{" "}
              <button type="button" className="btn-link" onClick={() => setShowRegister(false)}>
                Iniciar sesión
              </button>
            </span>
          ) : (
            <span>
              ¿No tienes cuenta?{" "}
              <button type="button" className="btn-link" onClick={() => setShowRegister(true)}>
                Registrarse
              </button>
            </span>
          )}
        </div>
        <button className="btn-link" style={{ marginTop: 10 }} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
