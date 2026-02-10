import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { JwtAuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';

export function Roles(...roles: Role[]) {
    return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(JwtAuthGuard, RolesGuard));
}
