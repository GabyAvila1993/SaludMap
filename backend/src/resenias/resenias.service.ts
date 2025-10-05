import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CrearReseniaDto } from './dto/crear-resenia.dto';

@Injectable()
export class ReseniasService {
  private prisma = new PrismaClient();

  /**
   * Valida si un usuario puede dejar una reseña para un turno específico
   */
  async validarPuedeReseniar(usuarioId: number, turnoId: number) {
    // 1. Verificar que el turno existe
    const turno = await this.prisma.turno.findUnique({
      where: { id: turnoId },
      include: {
        usuario: true,
        resenia: true,
        establecimiento: true,
      },
    });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    // 2. Verificar que el turno pertenece al usuario
    if (turno.usuarioId !== usuarioId) {
      throw new ForbiddenException('El turno no pertenece al usuario');
    }

    // 3. Verificar que no existe reseña previa
    if (turno.resenia) {
      throw new ConflictException('Ya existe una reseña para este turno');
    }

    // 4. Verificar que el turno no está cancelado
    if (turno.estado === 'cancelled') {
      throw new BadRequestException('No puede reseñar un turno cancelado');
    }

    // 5. Verificar que la fecha y hora han pasado
    const fechaTurno = this.construirFechaTurno(turno.fecha, turno.hora);
    const ahora = new Date();

    if (fechaTurno > ahora) {
      throw new BadRequestException(
        'No puede reseñar un turno que aún no ha ocurrido',
      );
    }

    return {
      valido: true,
      turno,
      mensaje: 'Puede dejar una reseña',
    };
  }

  /**
   * Construye una fecha completa a partir de fecha y hora
   */
  private construirFechaTurno(fecha: Date, hora: string): Date {
    const fechaBase = new Date(fecha);
    const [horas, minutos] = hora.split(':').map(Number);
    
    fechaBase.setHours(horas || 0);
    fechaBase.setMinutes(minutos || 0);
    fechaBase.setSeconds(0);
    fechaBase.setMilliseconds(0);
    
    return fechaBase;
  }

  /**
   * Crea una nueva reseña
   */
  async crear(usuarioId: number, dto: CrearReseniaDto) {
    // Validar que puede reseñar
    const validacion = await this.validarPuedeReseniar(usuarioId, dto.turnoId);

    // Verificar que el establecimientoId coincide con el del turno
    if (validacion.turno.establecimientoId !== dto.establecimientoId) {
      throw new BadRequestException(
        'El establecimiento no coincide con el del turno',
      );
    }

    // Crear la reseña
    const resenia = await this.prisma.resenia.create({
      data: {
        usuarioId,
        turnoId: dto.turnoId,
        establecimientoId: dto.establecimientoId,
        puntuacion: dto.puntuacion,
        comentario: dto.comentario,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        establecimiento: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // Opcionalmente, actualizar el estado del turno a 'completed'
    await this.prisma.turno.update({
      where: { id: dto.turnoId },
      data: { estado: 'completed' },
    });

    return resenia;
  }

  /**
   * Obtiene las reseñas de un establecimiento
   */
  async findByEstablecimiento(establecimientoId: number) {
    return await this.prisma.resenia.findMany({
      where: { establecimientoId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtiene las reseñas de un usuario
   */
  async findByUsuario(usuarioId: number) {
    return await this.prisma.resenia.findMany({
      where: { usuarioId },
      include: {
        establecimiento: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
          },
        },
        turno: {
          select: {
            id: true,
            fecha: true,
            hora: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtiene los turnos del usuario que pueden ser reseñados
   */
  async getTurnosParaReseniar(usuarioId: number, establecimientoId?: number) {
    const ahora = new Date();

    const turnos = await this.prisma.turno.findMany({
      where: {
        usuarioId,
        estado: {
          not: 'cancelled',
        },
        resenia: null, // Sin reseña aún
        ...(establecimientoId && { establecimientoId }),
      },
      include: {
        establecimiento: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    // Filtrar solo turnos pasados
    const turnosPasados = turnos.filter((turno) => {
      const fechaTurno = this.construirFechaTurno(turno.fecha, turno.hora);
      return fechaTurno <= ahora;
    });

    return turnosPasados;
  }

  /**
   * Obtiene una reseña por ID
   */
  async findById(id: number) {
    const resenia = await this.prisma.resenia.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        establecimiento: true,
        turno: true,
      },
    });

    if (!resenia) {
      throw new NotFoundException('Reseña no encontrada');
    }

    return resenia;
  }
}
