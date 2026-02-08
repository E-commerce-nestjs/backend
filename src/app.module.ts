import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './src/prisma/prisma.module';
import { AuthModule } from './src/modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './src/redis/redis.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
    envFilePath:'.env'
  }),PrismaModule, AuthModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
