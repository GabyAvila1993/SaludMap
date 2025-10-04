import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerData: { name: string; email: string; password: string }) {
    console.log('📝 Registro attempt:', registerData);
    
    const { user, token } = await this.authService.register(
      registerData.name,
      registerData.email,
      registerData.password,
    );
    
    return {
      message: 'Usuario registrado exitosamente',
      token: token, // Ahora usa el token JWT real
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    console.log('🔐 Login attempt:', loginData);
    
    const result = await this.authService.validateUser(
      loginData.email,
      loginData.password,
    );
    
    if (!result) {
      return {
        message: 'Credenciales inválidas',
        statusCode: 401,
      };
    }

    return {
      message: 'Login exitoso',
      token: result.token, // Ahora usa el token JWT real
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    };
  }
}