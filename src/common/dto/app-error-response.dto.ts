import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO cho Error Response - khi request thất bại
 * Sử dụng cho @ApiResponse với status code lỗi (4xx, 5xx)
 */
export class AppErrorResponseDto {
    @ApiProperty({ example: false, description: 'Request status - always false for errors' })
    status: boolean;

    @ApiProperty({ example: 400, description: 'HTTP error status code' })
    code: number;

    @ApiProperty({ example: 'Validation failed', description: 'Error message' })
    message: string;

    @ApiProperty({
        example: {
            email: ['Email is not valid', 'Email is required'],
            password: ['Password must be at least 8 characters long'],
        },
        description: 'Error details object',
        required: false,
    })
    errors?: Record<string, string[]> | any;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Error timestamp' })
    timestamp: string;
}

/**
 * DTO cho Validation Error Response - lỗi validation cụ thể
 */
export class ValidationErrorResponseDto extends AppErrorResponseDto {
    @ApiProperty({
        example: 400,
        description: 'HTTP status code for validation errors',
    })
    declare code: number;

    @ApiProperty({
        example: 'Validation failed',
        description: 'Validation error message',
    })
    declare message: string;

    @ApiProperty({
        example: {
            field_1: ['Error 1', 'Error 2'],
            field_2: ['Error 3'],
        },
        description: 'Validation errors by field',
    })
    declare errors: Record<string, string[]>;
}

/**
 * DTO cho Unauthorized Error Response
 */
export class UnauthorizedErrorResponseDto extends AppErrorResponseDto {
    @ApiProperty({
        example: 401,
        description: 'HTTP status code for unauthorized errors',
    })
    declare code: number;

    @ApiProperty({
        example: 'Unauthorized',
        description: 'Unauthorized error message',
    })
    declare message: string;

    @ApiProperty({
        example: null,
        description: 'Error details object',
    })
    declare errors?: null;
}

/**
 * DTO cho Not Found Error Response
 */
export class NotFoundErrorResponseDto extends AppErrorResponseDto {
    @ApiProperty({
        example: 404,
        description: 'HTTP status code for not found errors',
    })
    declare code: number;

    @ApiProperty({
        example: 'Resource not found',
        description: 'Not found error message',
    })
    declare message: string;

    @ApiProperty({
        example: null,
        description: 'Error details object',
    })
    declare errors?: null;
}

/**
 * DTO cho Internal Server Error Response
 */
export class InternalServerErrorResponseDto extends AppErrorResponseDto {
    @ApiProperty({
        example: 500,
        description: 'HTTP status code for server errors',
    })
    declare code: number;

    @ApiProperty({
        example: 'Internal server error',
        description: 'Server error message',
    })
    declare message: string;

    @ApiProperty({
        example: null,
        description: 'Error details object',
    })
    declare errors?: null;
}

/**
 * DTO cho Forbidden Error Response
 */
export class ForbiddenErrorResponseDto extends AppErrorResponseDto {
    @ApiProperty({
        example: 403,
        description: 'HTTP status code for forbidden errors',
    })
    declare code: number;

    @ApiProperty({
        example: 'Forbidden',
        description: 'Forbidden error message',
    })
    declare message: string;

    @ApiProperty({
        example: null,
        description: 'Error details object',
    })
    declare errors?: null;
}
