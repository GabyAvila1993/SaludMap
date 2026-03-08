export interface CrearEspecialidadDto {
  nombre: string;
  descripcion?: string;
}

export interface AsignarEspecialidadDto {
  establecimientoId: number;
  especialidadId: number;
  horariosDisponibles?: string;
}