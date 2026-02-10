import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserWithoutPassword } from 'src/modules/users/types/user-without-pass.type';

export const User = createParamDecorator((data: string, ctx: ExecutionContext): UserWithoutPassword => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
});
