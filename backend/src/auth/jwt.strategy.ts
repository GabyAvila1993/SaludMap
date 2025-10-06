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
    // El payload contiene los datos que se firmaron en el token
    // Típicamente: { sub: userId, mail: userEmail }
    return { 
      userId: payload.sub, 
      mail: payload.mail 
    };
  }
}
