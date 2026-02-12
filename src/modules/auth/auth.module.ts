import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { StringValue } from 'ms';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('AUTH_JWT_SECRET_KEY'),
                signOptions: {
                    expiresIn: config.get<StringValue>('AUTH_JWT_ACCESS_TOKEN_TTL'),
                },
            }),
        }),
        RedisModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
