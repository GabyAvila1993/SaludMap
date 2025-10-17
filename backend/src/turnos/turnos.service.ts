import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { CrearTurnoDto, ActualizarTurnoDto } from './dto/turno.dto';

const prisma = new PrismaClient();

@Injectable()
export class TurnosService {
  async createTurno(data: CrearTurnoDto) {
    try {
      console.log('[TurnosService] Creando turno con datos:', data);
      
      // Validaciones
      if (!data.usuarioId) {
        throw new BadRequestException('usuarioId es requerido');
      }
      
      if (!data.establecimientoId) {
        throw new BadRequestException('establecimientoId es requerido');
      }

      // Verificar que el usuario existe
      const usuario = await prisma.usuario.findUnique({
        where: { id: data.usuarioId }
      });

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${data.usuarioId} no encontrado`);
      }

      // Verificar que el establecimiento existe
      const establecimiento = await prisma.establecimiento.findUnique({
        where: { id: data.establecimientoId }
      });

      if (!establecimiento) {
        throw new NotFoundException(`Establecimiento con ID ${data.establecimientoId} no encontrado`);
      }

      // Crear el turno
      const turno = await prisma.turno.create({
        data: {
          usuarioId: data.usuarioId,
          establecimientoId: data.establecimientoId,
          fecha: new Date(data.fecha),
          hora: data.hora,
          estado: 'pendiente'
        },
        include: {
          usuario: true,
          establecimiento: true
        }
      });

      console.log('[TurnosService] Turno creado exitosamente:', turno);
      return turno;
      
    } catch (error) {
      console.error('[TurnosService] Error al crear turno:', error);
      throw error;
    }
  }

  async listTurnos(userEmail?: string, includeCancelled = false) {
    try {
      const turnos = await prisma.turno.findMany({
        where: userEmail ? {
          usuario: {
            mail: userEmail
          },
          ...(includeCancelled ? {} : { NOT: { estado: 'cancelado' } })
        } : (
          includeCancelled ? {} : { NOT: { estado: 'cancelado' } }
        ),
        include: {
          usuario: true,
          establecimiento: true
        }
      });

      return turnos;
    } catch (error) {
      console.error('[TurnosService] Error al listar turnos:', error);
      throw error;
    }
  }

  async updateTurno(id: number, data: ActualizarTurnoDto) {
    try {
      const turno = await prisma.turno.findUnique({
        where: { id }
      });

      if (!turno) {
        throw new NotFoundException('Turno no encontrado');
      }

      const updateData: any = {};

      if (data.action === 'cancelar') {
        updateData.estado = 'cancelado';
      }

      if (data.fecha) {
        updateData.fecha = new Date(data.fecha);
      }

      if (data.hora) {
        updateData.hora = data.hora;
      }

      const turnoActualizado = await prisma.turno.update({
        where: { id },
        data: updateData,
        include: {
          usuario: true,
          establecimiento: true
        }
      });

      return turnoActualizado;

    } catch (error) {
      console.error('[TurnosService] Error al actualizar turno:', error);
      throw error;
    }
  }
}