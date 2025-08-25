import { useState } from "react";
import ModalAuth from "./ModalAuth.jsx";
import { login, register } from "./services/authService.js";

export default function AuthProvider({ children }) {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    // ✅ Manejo de Login
    const handleLogin = async (form, setError) => {
        try {
            const user = await login(form); // llama a authService
            console.log("Usuario logueado:", user);

            setShowAuthModal(false); // cierra modal
            setShowRegister(false); // vuelve a login por si estaba en registro
        } catch (err) {
            console.error(err);
            setError("Credenciales incorrectas");
            setShowRegister(true); // cambia a formulario de registro si falla
        }
    };

    // ✅ Manejo de Registro
    const handleRegister = async (form, setError) => {
        try {
            const newUser = await register(form);
            console.log("Usuario registrado:", newUser);

            setShowAuthModal(false);
        } catch (err) {
            console.error(err);
            setError("No se pudo registrar el usuario");
        }
    };

    // ✅ Manejo cuando el usuario intenta pedir turno sin estar autenticado
    const handleSolicitarTurno = (usuarioAutenticado) => {
        if (!usuarioAutenticado) {
            setShowAuthModal(true);
            return;
        }
        // lógica de turno real
        console.log("Solicitando turno...");
    };

    return (
        <>
            {children}

            {showAuthModal && (
                <ModalAuth
                    onClose={() => setShowAuthModal(false)}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    showRegister={showRegister}
                    setShowRegister={setShowRegister}
                />
            )}
        </>
    );
}
