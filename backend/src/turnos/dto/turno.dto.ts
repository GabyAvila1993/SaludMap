export interface CrearTurnoDto {
  usuarioId: number;
  establecimientoId: number;
  especialidadId: number; // NUEVO: requerido
  fecha: Date;
  hora: string;
}

export interface ActualizarTurnoDto {
  action?: 'cancelar';
  fecha?: Date;
  hora?: string;
}