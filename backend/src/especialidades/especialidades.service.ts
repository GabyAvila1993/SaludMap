import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '../../generated';
import { CrearEspecialidadDto, AsignarEspecialidadDto } from './dto/especialidad.dto';

const prisma = new PrismaClient();

@Injectable()
export class EspecialidadesService {

  /**
   * Lista todas las especialidades
   */
  async findAll() {
    return await prisma.especialidad.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Busca una especialidad por ID
   */
  async findById(id: number) {
    const especialidad = await prisma.especialidad.findUnique({
      where: { id },
    });
    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
    }
    return especialidad;
  }

  /**
   * Obtiene las especialidades de un establecimiento específico
   */
  async findByEstablecimiento(establecimientoId: number) {
    // Verificar que el establecimiento existe
    const establecimiento = await prisma.establecimiento.findUnique({
      where: { id: establecimientoId },
    });
    if (!establecimiento) {
      throw new NotFoundException(`Establecimiento con ID ${establecimientoId} no encontrado`);
    }

    const relaciones = await prisma.establecimientoEspecialidad.findMany({
      where: { establecimientoId },
      include: {
        especialidad: true,
      },
      orderBy: {
        especialidad: { nombre: 'asc' },
      },
    });

    // Devolver lista de especialidades con sus horarios en ese establecimiento
    return relaciones.map((r) => ({
      id: r.especialidad.id,
      nombre: r.especialidad.nombre,
      descripcion: r.especialidad.descripcion,
      horariosDisponibles: r.horariosDisponibles,
    }));
  }

  /**
   * Crea una nueva especialidad
   */
  async create(dto: CrearEspecialidadDto) {
    const existente = await prisma.especialidad.findUnique({
      where: { nombre: dto.nombre },
    });
    if (existente) {
      throw new ConflictException(`Ya existe una especialidad con el nombre "${dto.nombre}"`);
    }
    return await prisma.especialidad.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });
  }

  /**
   * Asigna una especialidad a un establecimiento
   */
  async asignarAEstablecimiento(dto: AsignarEspecialidadDto) {
    // Verificar que existen ambos
    const establecimiento = await prisma.establecimiento.findUnique({
      where: { id: dto.establecimientoId },
    });
    if (!establecimiento) {
      throw new NotFoundException(`Establecimiento con ID ${dto.establecimientoId} no encontrado`);
    }

    const especialidad = await prisma.especialidad.findUnique({
      where: { id: dto.especialidadId },
    });
    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${dto.especialidadId} no encontrada`);
    }

    // Verificar si ya está asignada
    const yaAsignada = await prisma.establecimientoEspecialidad.findUnique({
      where: {
        establecimientoId_especialidadId: {
          establecimientoId: dto.establecimientoId,
          especialidadId: dto.especialidadId,
        },
      },
    });
    if (yaAsignada) {
      throw new ConflictException('Esta especialidad ya está asignada a ese establecimiento');
    }

    return await prisma.establecimientoEspecialidad.create({
      data: {
        establecimientoId: dto.establecimientoId,
        especialidadId: dto.especialidadId,
        horariosDisponibles: dto.horariosDisponibles,
      },
      include: {
        especialidad: true,
        establecimiento: true,
      },
    });
  }

  /**
   * Desasigna una especialidad de un establecimiento
   */
  async desasignarDeEstablecimiento(establecimientoId: number, especialidadId: number) {
    const relacion = await prisma.establecimientoEspecialidad.findUnique({
      where: {
        establecimientoId_especialidadId: {
          establecimientoId,
          especialidadId,
        },
      },
    });
    if (!relacion) {
      throw new NotFoundException('Esta especialidad no está asignada a ese establecimiento');
    }

    return await prisma.establecimientoEspecialidad.delete({
      where: {
        establecimientoId_especialidadId: {
          establecimientoId,
          especialidadId,
        },
      },
    });
  }
}