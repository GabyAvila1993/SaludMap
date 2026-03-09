import {
  Controller,
  Post,
  Get,
  Body,
  UnauthorizedException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from './usuarios.service';
import { RegisterDto, LoginDto, CambiarRolDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.usuariosService.crearUsuario(dto);

    // MODIFICADO: el token ahora incluye el rol
    const payload = { sub: user.id, mail: user.mail, rol: user.rol };
    const token = this.jwtService.sign(payload);

    return {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      mail: user.mail,
      rol: user.rol,
      token,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.usuariosService.validarUsuario(dto.mail, dto.contrasenia);
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    // MODIFICADO: el token ahora incluye el rol
    const payload = { sub: user.id, mail: user.mail, rol: user.rol };
    const token = this.jwtService.sign(payload);

    return {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      mail: user.mail,
      rol: user.rol, // NUEVO: el frontend recibe el rol
      token,
    };
  }

  // NUEVO: endpoint para que un admin cambie el rol de otro usuario
  // Solo accesible con JWT válido + rol admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('cambiar-rol')
  async cambiarRol(@Body() dto: CambiarRolDto) {
    return this.usuariosService.cambiarRol(dto.mail, dto.rol);
  }

  // NUEVO: listar todos los usuarios (solo admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async listarUsuarios() {
    return this.usuariosService.listarUsuarios();
  }
}