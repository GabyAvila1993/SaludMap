import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class UsuariosService {
  constructor() {}
  async crearUsuario(data: { nombre: string; apellido: string; mail: string; contrasenia: string }) {
    const existe = await prisma.usuario.findUnique({ where: { mail: data.mail } });
    if (existe) throw new ConflictException('El mail ya está registrado');
    const hash = await bcrypt.hash(data.contrasenia, 10);
    return prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        mail: data.mail,
        contrasenia: hash,
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
}