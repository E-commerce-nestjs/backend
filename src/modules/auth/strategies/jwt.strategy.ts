import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from 'generated/prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { UserWithoutPassword } from 'src/modules/users/types/user-without-pass.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) {
        const secret = configService.get<string>('AUTH_JWT_SECRET_KEY');
        if (!secret) {
            throw new Error('AUTH_JWT_SECRET_KEY is not defined');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: { sub: string }): Promise<UserWithoutPassword> {
        const cacheKey = `user:${payload.sub}`;

        // check cache first
        const cachedUser = await this.redisService.get(cacheKey);
        if (cachedUser) {
            return JSON.parse(cachedUser);
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            },
            omit: {
                password: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException({}, 'Unauthorized access token');
        }

        // Cache for 5m
        await this.redisService.setex(cacheKey, 300, JSON.stringify(user));

        return user;
    }
}
