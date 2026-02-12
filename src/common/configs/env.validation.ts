// src/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

export class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsNumber()
    PORT: number;

    @IsString()
    DATABASE_URL: string;

    @IsString()
    AUTH_JWT_SECRET_KEY: string;

    @IsString()
    AUTH_JWT_ACCESS_TOKEN_TTL: string;

    @IsNumber()
    AUTH_JWT_REFRESH_TOKEN_TTL: number;

    @IsString()
    REDIS_URI: string;

    @IsString()
    STRIPE_SECRET_KEY: string;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}
