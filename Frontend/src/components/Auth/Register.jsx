import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function Register() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Aquí deberías llamar a tu API de registro
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }
    // Simulación de registro exitoso
    login({ email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input">
        <label className="input__label">Email</label>
        <input className="input__field" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="input">
        <label className="input__label">Contraseña</label>
        <input className="input__field" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <div className="turnos-error">{error}</div>}
      <button className="button button--primary" type="submit">Registrarse</button>
    </form>
  );
}
