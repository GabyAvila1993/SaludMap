import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // AÑADE ESTOS LOGS TEMPORALES
      console.log('Token recibido:', token);
      console.log('JWT_SECRET configurado:', process.env.JWT_SECRET);
      
      const decoded = this.jwtService.verify(token);
      
      console.log('Token decodificado correctamente:', decoded);
      
      (req as any).user = {
        userId: decoded.sub,
        mail: decoded.mail
      };
      next();
    } catch (error) {
      // AÑADE ESTE LOG
      console.error('Error al verificar token:', error.message);
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  }
}