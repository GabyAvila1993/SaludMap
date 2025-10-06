/* --------- INICIO DEL ARCHIVO src/usuarios/usuarios.module.ts ----------- */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [UsuariosController],
  providers: [ UsuariosService],
  exports: [ UsuariosService],
})
export class UsuariosModule {}
/* --------- FIN DEL ARCHIVO src/usuarios/usuarios.module.ts ----------- */