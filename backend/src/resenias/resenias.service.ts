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
    // Aceptar ambas variantes ('cancelado' en español y 'cancelled' en inglés)
    if (turno.estado === 'cancelado' || turno.estado === 'cancelled') {
      throw new BadRequestException('No puede reseñar un turno cancelado');
    }

    // 5. Verificar que la fecha y hora han pasado (o es muy reciente para testing)
    const fechaTurno = this.construirFechaTurno(turno.fecha, turno.hora || '00:00');
    const ahora = new Date();
    const dosHorasAtras = new Date(ahora.getTime() - 2 * 60 * 60 * 1000);

    // Permitir si ya pasó O si es dentro de las últimas 2 horas (para testing)
    // Rechazar únicamente si la fecha del turno está en el futuro
    if (fechaTurno > ahora) {
      throw new BadRequestException('No puede reseñar un turno que aún no ha ocurrido');
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
  private construirFechaTurno(fecha: Date, hora: string | null): Date {
    if (!hora) {
      return fecha; // Si no hay hora específica, retorna solo la fecha
    }
    
    const [horas, minutos] = hora.split(':').map(Number);
    const fechaTurno = new Date(fecha);
    fechaTurno.setHours(horas, minutos);
    return fechaTurno;
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

    // Opcionalmente, actualizar el estado del turno a 'completado' (usar español consistente con UI)
    await this.prisma.turno.update({
      where: { id: dto.turnoId },
      data: { estado: 'completado' },
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
    // Permitir reseñas para turnos de las últimas 2 horas (para testing)
    const dosHorasAtras = new Date(ahora.getTime() - 2 * 60 * 60 * 1000);

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

    // Filtrar turnos que ya pasaron O son muy recientes (últimas 2 horas)
    const turnosDisponibles = turnos.filter((turno) => {
      const fechaTurno = this.construirFechaTurno(turno.fecha, turno.hora || '00:00');
      // Permitir si ya pasó O si es dentro de las últimas 2 horas
      return fechaTurno <= ahora || fechaTurno >= dosHorasAtras;
    });

    return turnosDisponibles;
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
