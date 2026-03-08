import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '../../generated';
import { CrearEstablecimientoDto } from './dto/crear-establecimiento.dto';

@Injectable()
export class EstablecimientosService {
  private prisma = new PrismaClient();

  /**
   * Busca un establecimiento por coordenadas exactas
   */
  async findByCoordinates(lat: number, lng: number) {
    return await this.prisma.establecimiento.findFirst({
      where: { lat, lng },
      include: {
        resenias: {
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        // NUEVO: incluir especialidades asignadas
        especialidades: {
          include: {
            especialidad: true,
          },
        },
      },
    });
  }

  /**
   * Busca un establecimiento por ID
   */
  async findById(id: number) {
    const establecimiento = await this.prisma.establecimiento.findUnique({
      where: { id },
      include: {
        resenias: {
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        // NUEVO: incluir especialidades asignadas
        especialidades: {
          include: {
            especialidad: true,
          },
        },
      },
    });

    if (!establecimiento) {
      throw new NotFoundException('Establecimiento no encontrado');
    }
    return establecimiento;
  }

  /**
   * Crea un nuevo establecimiento
   */
  async create(dto: CrearEstablecimientoDto) {
    const existente = await this.findByCoordinates(dto.lat, dto.lng);
    if (existente) {
      throw new ConflictException('Ya existe un establecimiento en esas coordenadas');
    }

    return await this.prisma.establecimiento.create({
      data: {
        lat: dto.lat,
        lng: dto.lng,
        nombre: dto.nombre,
        tipo: dto.tipo,
        direccion: dto.direccion,
        telefono: dto.telefono,
        horarios: dto.horarios,
        metadata: dto.metadata || {},
      },
    });
  }

  /**
   * Busca o crea un establecimiento
   */
  async findOrCreate(dto: CrearEstablecimientoDto) {
    const existente = await this.findByCoordinates(dto.lat, dto.lng);
    if (existente) {
      return existente;
    }

    try {
      return await this.prisma.establecimiento.create({
        data: {
          lat: dto.lat,
          lng: dto.lng,
          nombre: dto.nombre,
          tipo: dto.tipo,
          direccion: dto.direccion,
          telefono: dto.telefono,
          horarios: dto.horarios,
          metadata: dto.metadata || {},
        },
        include: {
          resenias: {
            include: {
              usuario: {
                select: { id: true, nombre: true, apellido: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          // NUEVO: incluir especialidades asignadas
          especialidades: {
            include: {
              especialidad: true,
            },
          },
        },
      });
    } catch (error) {
      // Si falla por duplicado (race condition), buscar de nuevo
      const retry = await this.findByCoordinates(dto.lat, dto.lng);
      if (retry) return retry;
      throw error;
    }
  }

  /**
   * Obtiene las reseñas de un establecimiento con estadísticas
   */
  async getResenias(id: number) {
    const establecimiento = await this.findById(id);
    const resenias = establecimiento.resenias;
    const totalResenias = resenias.length;

    let promedioEstrellas = 0;
    if (totalResenias > 0) {
      const sumaEstrellas = resenias.reduce((sum, r) => sum + r.puntuacion, 0);
      promedioEstrellas = sumaEstrellas / totalResenias;
    }

    return {
      resenias,
      estadisticas: {
        total: totalResenias,
        promedioEstrellas: Number(promedioEstrellas.toFixed(1)),
      },
    };
  }

  /**
   * NUEVO: Obtiene las especialidades de un establecimiento
   */
  async getEspecialidades(id: number) {
    const establecimiento = await this.prisma.establecimiento.findUnique({
      where: { id },
    });
    if (!establecimiento) {
      throw new NotFoundException('Establecimiento no encontrado');
    }

    const relaciones = await this.prisma.establecimientoEspecialidad.findMany({
      where: { establecimientoId: id },
      include: { especialidad: true },
      orderBy: { especialidad: { nombre: 'asc' } },
    });

    return relaciones.map((r) => ({
      id: r.especialidad.id,
      nombre: r.especialidad.nombre,
      descripcion: r.especialidad.descripcion,
      horariosDisponibles: r.horariosDisponibles,
    }));
  }

  /**
   * Lista todos los establecimientos con paginación
   */
  async findAll(skip?: number, take?: number) {
    return await this.prisma.establecimiento.findMany({
      skip: skip || 0,
      take: take || 50,
      include: {
        resenias: {
          select: { id: true, puntuacion: true },
        },
        // NUEVO: incluir especialidades en el listado general
        especialidades: {
          include: {
            especialidad: {
              select: { id: true, nombre: true },
            },
          },
        },
      },
    });
  }
}