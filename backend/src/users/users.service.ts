import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  // Array temporal para almacenar usuarios (en producción usarías MongoDB)
  private users: any[] = [];

  async findByEmail(email: string): Promise<any> {
    return this.users.find(user => user.email === email);
  }

  async createUser(name: string, email: string, password: string): Promise<any> {
    const user = {
      id: 'user-' + Date.now(),
      name,
      email,
      password: password, // ✅ AGREGAR EL PASSWORD
      createdAt: new Date(),
    };
    
    this.users.push(user);
    console.log('👤 Usuario creado:', user.email);
    console.log('📊 Usuarios en memoria:', this.users.length);
    
    return user;
  }

  // Método opcional para debug
  async getAllUsers(): Promise<any[]> {
    return this.users;
  }
}