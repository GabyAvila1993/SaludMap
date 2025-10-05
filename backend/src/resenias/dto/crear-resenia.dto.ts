import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';

export class CrearReseniaDto {
  @IsNumber()
  @IsNotEmpty()
  turnoId: number;

  @IsNumber()
  @IsNotEmpty()
  establecimientoId: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  puntuacion: number;

  @IsString()
  @IsNotEmpty()
  comentario: string;
}
