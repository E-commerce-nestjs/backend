import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from './src/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // api prefix
  app.setGlobalPrefix("api/v1");

  // validation pipe
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
    Logger.error("Failed to start the application", error);
    process.exit(1)
});
