import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User as PrismaUser } from "generated/prisma/client";

export const User = createParamDecorator((data:string, ctx:ExecutionContext):Omit<PrismaUser,'password'>=>{
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
})