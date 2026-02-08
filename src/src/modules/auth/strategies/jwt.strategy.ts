import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "generated/prisma/client";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(
        private readonly configService:ConfigService,
        private readonly prisma:PrismaService
    ){
        const secret = configService.get<string>('AUTH_JWT_SECRET_KEY')
        if(!secret){
            throw new Error('AUTH_JWT_SECRET_KEY is not defined')
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey: secret
        })
    }

    async validate(payload:{sub:string}): Promise<Omit<User,'password'>>{
        
        const user = await this.prisma.user.findUnique({
            where:{
                id:payload.sub
            },
            omit:{
                password:true
            }
        })
        
        if(!user){
            throw new UnauthorizedException({},"Unauthorized access token")
        }
        return user 
    }
}