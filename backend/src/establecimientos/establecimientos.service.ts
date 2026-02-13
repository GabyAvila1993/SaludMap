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
      where: {
        lat: lat,
        lng: lng,
      },
      include: {
        resenias: {
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
    // Verificar si ya existe un establecimiento en esas coordenadas
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
    // Buscar primero
    const existente = await this.findByCoordinates(dto.lat, dto.lng);
    
    if (existente) {
      return existente;
    }

    // Intentar crear, pero manejar si otro request ya lo creó (race condition)
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
          },
        },
      });
    } catch (error) {
      // Si falla por duplicado (race condition), buscar de nuevo
      const retry = await this.findByCoordinates(dto.lat, dto.lng);
      if (retry) {
        return retry;
      }
      // Si aún así no existe, lanzar el error original
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
   * Lista todos los establecimientos (con paginación opcional)
   */
  async findAll(skip?: number, take?: number) {
    return await this.prisma.establecimiento.findMany({
      skip: skip || 0,
      take: take || 50,
      include: {
        resenias: {
          select: {
            id: true,
            puntuacion: true,
          },
        },
      },
    });
  }
}
