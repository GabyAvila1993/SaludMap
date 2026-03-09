import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

// Decorador para marcar qué roles puede acceder a un endpoint
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos del decorador @Roles(...)
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si el endpoint no tiene @Roles(...), cualquiera puede acceder
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    // Obtener el usuario del request (puesto por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('No autenticado');
    }

    // Verificar si el rol del usuario está entre los requeridos
    const tieneRol = rolesRequeridos.includes(user.rol);
    if (!tieneRol) {
      throw new ForbiddenException(
        'No tenés permisos para realizar esta acción. Se requiere rol: ' +
          rolesRequeridos.join(', '),
      );
    }

    return true;
  }
}