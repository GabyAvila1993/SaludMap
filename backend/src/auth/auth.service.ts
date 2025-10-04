import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'saludmap-secret-key-2024';

  constructor(private usersService: UsersService) {}

  async register(name: string, email: string, password: string): Promise<any> {
    console.log('🔍 Buscando usuario existente:', email);
    const existingUser = await this.usersService.findByEmail(email);
    
    if (existingUser) {
      console.log('❌ Usuario ya existe:', email);
      throw new Error('El usuario ya existe');
    }

    console.log('✅ Creando nuevo usuario:', email);
    const user = await this.usersService.createUser(name, email, password);
    
    // Generar token JWT después del registro
    const token = this.generateToken(user);
    return { user, token };
  }

  async validateUser(email: string, password: string): Promise<any> {
    console.log('🔐 Validando usuario:', email);
    const user = await this.usersService.findByEmail(email);
    
    if (user && user.password === password) {
      console.log('✅ Credenciales válidas para:', email);
      const { password, ...result } = user;
      
      // Generar token JWT después de validar
      const token = this.generateToken(result);
      return { user: result, token };
    }
    
    console.log('❌ Credenciales inválidas para:', email);
    return null;
  }

  // 🔥 NUEVO MÉTODO: Generar token JWT
  generateToken(user: any): string {
    const payload = { 
      email: user.email, 
      sub: user.id,
      name: user.name 
    };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }

  // 🔥 NUEVO MÉTODO: Verificar token JWT (que necesita el JwtAuthGuard)
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
}