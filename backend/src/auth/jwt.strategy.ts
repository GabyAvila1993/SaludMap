import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion',
    });
  }

  async validate(payload: any) {
    // MODIFICADO: ahora también incluye el rol en el objeto user del request
    return {
      userId: payload.sub,
      mail: payload.mail,
      rol: payload.rol, // NUEVO
    };
  }
}