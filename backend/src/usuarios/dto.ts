export class RegisterDto {
  nombre: string;
  apellido: string;
  mail: string;
  contrasenia: string;
  // rol NO se recibe desde el frontend — siempre se asigna "usuario" por defecto
}

export class LoginDto {
  mail: string;
  contrasenia: string;
}

// Solo para uso interno admin (no expuesto al registro normal)
export class CambiarRolDto {
  mail: string;
  rol: 'usuario' | 'admin';
}