import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '../../generated';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class UsuariosService {
  constructor() {}

  async crearUsuario(data: {
    nombre: string;
    apellido: string;
    mail: string;
    contrasenia: string;
  }) {
    const existe = await prisma.usuario.findUnique({ where: { mail: data.mail } });
    if (existe) throw new ConflictException('El mail ya está registrado');

    const hash = await bcrypt.hash(data.contrasenia, 10);

    return prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        mail: data.mail,
        contrasenia: hash,
        rol: 'usuario', // siempre "usuario" por defecto al registrarse
      },
    });
  }

  async validarUsuario(mail: string, contrasenia: string) {
    const user = await prisma.usuario.findUnique({ where: { mail } });
    if (!user) return null;
    const match = await bcrypt.compare(contrasenia, user.contrasenia);
    if (!match) return null;
    return user;
  }

  // NUEVO: cambiar rol de un usuario (solo admin puede llamar esto)
  async cambiarRol(mail: string, nuevoRol: 'usuario' | 'admin') {
    const user = await prisma.usuario.findUnique({ where: { mail } });
    if (!user) throw new NotFoundException(`Usuario con mail ${mail} no encontrado`);

    return prisma.usuario.update({
      where: { mail },
      data: { rol: nuevoRol },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        mail: true,
        rol: true,
      },
    });
  }

  // NUEVO: listar todos los usuarios (solo admin)
  async listarUsuarios() {
    return prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        mail: true,
        rol: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}