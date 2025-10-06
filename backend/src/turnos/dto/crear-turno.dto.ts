import { IsNotEmpty, IsNumber, IsDateString, IsString } from 'class-validator';

export class CrearTurnoDto {
  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @IsNotEmpty()
  @IsNumber()
  establecimientoId: number;

  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @IsNotEmpty()
  @IsString()
  hora: string;
}