import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from './common/pipes/validation.pipe';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filer';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { getCorsConfig } from './common/configs/cors.config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // cors
    app.enableCors(getCorsConfig());

    // swagger
    const config = new DocumentBuilder()
        .setTitle('E-commerce API')
        .setDescription('E-commerce API description')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .addServer(`${process.env.API_URL || 'http://localhost:8000'}`, 'Development server')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    if (process.env.NODE_ENV !== 'production') {
        SwaggerModule.setup('api/docs', app, documentFactory, {
            swaggerOptions: {
                persistAuthorization: true,
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
            },
            customSiteTitle: 'E-commerce API',
            customfavIcon: 'https://nestjs.com/img/logo-small.svg',
            customCss: `
      .swagger-ui .topbar {display: none}
      .swagger-ui .info { margin: 50px 0; }
      .swagger-ui .info .title {color: #4A90E2;}
    `,
        });
    }

    // api prefix
    app.setGlobalPrefix('api/v1');

    // validation pipe
    app.useGlobalPipes(new ValidationPipe());

    // exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // cookie parser
    app.use(cookieParser());

    await app.listen(process.env.PORT ?? 8000);
}
bootstrap().catch(error => {
    Logger.error('Failed to start the application', error);
    process.exit(1);
});
