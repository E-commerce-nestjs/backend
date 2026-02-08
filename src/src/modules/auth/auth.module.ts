import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports:[JwtModule.registerAsync({
    imports:[ConfigModule],
    inject:[ConfigService],
    useFactory:(config:ConfigService)=>({
      secret: config.get<string>('AUTH_JWT_SECRET_KEY'),
      signOptions:{
        expiresIn:config.get<number>('AUTH_JWT_ACCESS_TOKEN_TTL')
      }
    })
  }
  )],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
