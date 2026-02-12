import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Category } from '../entities/category.entity';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Electronics', description: 'Category name' })
    @IsNotEmpty({ message: 'Category name is required' })
    @IsString({ message: 'Category name must be a string' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name: string;

    @ApiProperty({ example: 'Electronics category', description: 'Category description' })
    @IsString({ message: 'Category description must be a string' })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    description?: string;

    @ApiProperty({ example: 'electronics', description: 'Category slug' })
    @IsString({ message: 'Category slug must be a string' })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    slug?: string;

    @ApiProperty({ example: 'https://example.com/category.jpg', description: 'Category image url' })
    @IsString({ message: 'Category image url must be a string' })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    imageUrl?: string;

    @ApiProperty({ example: true, description: 'Category is active' })
    @IsBoolean({ message: 'Category is active must be a boolean' })
    @IsOptional()
    isActive?: boolean;
}

export class CreateCategoryResponseDto extends Category {}
