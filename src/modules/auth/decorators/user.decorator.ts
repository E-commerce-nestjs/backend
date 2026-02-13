import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from '../../users/dtos/user-response.dto';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
export const User = createParamDecorator((data: string, ctx: ExecutionContext): UserResponseDto => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
});
