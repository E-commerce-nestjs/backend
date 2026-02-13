import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dtos/user-response.dto';
import { Transform } from 'class-transformer';
import { Match } from '../decorators/match.decorator';

export class RegisterDto {
    @ApiProperty({ example: 'john@gmail.com', description: 'User email' })
    @IsEmail({}, { message: 'Email is not valid' })
    @IsString({ message: 'Email must be a string' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({ example: 'Password@123', description: 'User password' })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string;

    @ApiProperty({ example: 'Password@123', description: 'User confirm password' })
    @Match('password', { message: 'Passwords do not match' })
    @IsNotEmpty({ message: 'Confirm password is required' })
    confirmPassword: string;

    @ApiProperty({ example: 'John', description: 'User first name' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    firstName?: string;

    @ApiProperty({ example: 'Doe', description: 'User last name' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    lastName?: string;
}

export class RegisterResponseDto extends UserResponseDto {}
