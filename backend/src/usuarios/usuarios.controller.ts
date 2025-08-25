import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { RegisterDto, LoginDto } from './dto'; // Asegúrate de importar los DTOs correctamente

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.usuariosService.crearUsuario(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const user = await this.usuariosService.validarUsuario(dto.mail, dto.contrasenia);
        if (!user) throw new UnauthorizedException('Credenciales incorrectas');
        return { id: user.id, nombre: user.nombre, apellido: user.apellido, mail: user.mail };
    }
}