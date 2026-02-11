import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'generated/prisma/enums';
import { User } from 'generated/prisma/client';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user }: { user: Omit<User, 'password'> } = context.switchToHttp().getRequest();
        const hasRole = requiredRoles.some(role => user.role === role);
        if (!hasRole) {
            throw new ForbiddenException("You don't have permission to access this resource");
        }
        return hasRole;
    }
}
