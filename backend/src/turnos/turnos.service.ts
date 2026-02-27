import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient, Prisma } from '../../generated';
import { CrearTurnoDto, ActualizarTurnoDto } from './dto/turno.dto';

const prisma = new PrismaClient();

@Injectable()
export class TurnosService {
  async createTurno(data: CrearTurnoDto) {
    try {
      // console.log('[TurnosService] Creando turno con datos:', data);
      
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

      // console.log('[TurnosService] Turno creado exitosamente:', turno);
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

      // Marcar estados expirados en lectura (no persistente) como fallback
      const now = new Date();
      const mapped = (turnos || []).map(t => {
        let estado = t.estado;
        if (estado !== 'cancelado' && estado !== 'completado') {
            try {
              const base = new Date(t.fecha);
              let hh = 0, mm = 0, ss = 0;
              if (t.hora) {
                const parts = String(t.hora).split(':').map(p => parseInt(p, 10));
                hh = isNaN(parts[0]) ? 0 : parts[0];
                mm = isNaN(parts[1]) ? 0 : parts[1];
                ss = isNaN(parts[2]) ? 0 : (parts[2] || 0);
              }
              // Construir la fecha+hora usando los componentes UTC de `fecha` para respetar la fecha almacenada
              // y luego crear la fecha en horario local con esa fecha calendario + hora seleccionada.
              const y = base.getUTCFullYear();
              const m = base.getUTCMonth();
              const d = base.getUTCDate();
              const combined = new Date(y, m, d, hh, mm, ss, 0);
              if (combined.getTime() <= now.getTime()) {
                estado = 'completado';
              }
            } catch {
              // ignore parsing errors
            }
          }
        return { ...t, estado };
      });

      return mapped;
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

  // Cron: cada minuto busca turnos pendientes cuya fecha+hora ya pasó y los marca como completados
  @Cron('*/1 * * * *')
  async markExpiredTurnosCron() {
    try {
      const pendientes = await prisma.turno.findMany({ where: { estado: 'pendiente' } });
      if (!pendientes || pendientes.length === 0) return;

      const now = new Date();
      const toUpdateIds = [] as number[];

      for (const t of pendientes) {
        if (!t.fecha) continue;
        try {
          const base = new Date(t.fecha);
          let hh = 0, mm = 0, ss = 0;
          if (t.hora) {
            const parts = String(t.hora).split(':').map(p => parseInt(p, 10));
            hh = isNaN(parts[0]) ? 0 : parts[0];
            mm = isNaN(parts[1]) ? 0 : parts[1];
            ss = isNaN(parts[2]) ? 0 : (parts[2] || 0);
          }
          // Usar componentes UTC de `fecha` para obtener la fecha calendario correcta
          const y2 = base.getUTCFullYear();
          const m2 = base.getUTCMonth();
          const d2 = base.getUTCDate();
          const combined2 = new Date(y2, m2, d2, hh, mm, ss, 0);
          if (combined2.getTime() <= now.getTime()) toUpdateIds.push(t.id);
        } catch (e) {
          // ignore parse errors for this row
        }
      }

      if (toUpdateIds.length > 0) {
        const res = await prisma.turno.updateMany({
          where: { id: { in: toUpdateIds }, estado: 'pendiente' },
          data: { estado: 'completado' }
        });
        // console.log(`[TurnosService] markExpiredTurnosCron: marcados ${res.count} turnos como completado`);
      }
    } catch (err) {
      console.error('[TurnosService] markExpiredTurnosCron error', err);
    }
  }
}