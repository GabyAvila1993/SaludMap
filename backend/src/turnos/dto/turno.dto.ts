export interface CrearTurnoDto {
  usuarioId: number;
  establecimientoId: number;
  fecha: Date;
  hora: string;
}

export interface ActualizarTurnoDto {
  action?: 'cancelar';
  fecha?: Date;
  hora?: string;
}