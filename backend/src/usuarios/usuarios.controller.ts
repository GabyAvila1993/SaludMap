/* --------- INICIO DEL ARCHIVO src/usuarios/usuarios.controller.ts ----------- */
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from './usuarios.service';
import { RegisterDto, LoginDto } from './dto';

@Controller('usuarios')
export class UsuariosController {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
    ) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        const user = await this.usuariosService.crearUsuario(dto);
        
        // Generar token JWT
        const payload = { sub: user.id, mail: user.mail };
        const token = this.jwtService.sign(payload);
        
        return {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            mail: user.mail,
            token, // ← ESTE ES EL TOKEN QUE FALTA
        };
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const user = await this.usuariosService.validarUsuario(dto.mail, dto.contrasenia);
        if (!user) throw new UnauthorizedException('Credenciales incorrectas');
        
        // Generar token JWT
        const payload = { sub: user.id, mail: user.mail };
        const token = this.jwtService.sign(payload);
        
        return {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            mail: user.mail,
            token, // ← ESTE ES EL TOKEN QUE FALTA
        };
    }
}
/* --------- FIN DEL ARCHIVO src/usuarios/usuarios.controller.ts ----------- */