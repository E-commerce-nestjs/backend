import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './modules/redis/redis.module';
import { UsersModule } from './modules/users/users.module';
import { validate } from './common/configs/env.validation';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
    envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    validate,
  }),PrismaModule, AuthModule, RedisModule, UsersModule,HealthModule,
ThrottlerModule.forRoot([  {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }])],
  controllers: [AppController],
  providers: [AppService,{provide:APP_GUARD,useClass:ThrottlerGuard}],
})
export class AppModule {}
