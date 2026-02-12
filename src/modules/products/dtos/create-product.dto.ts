import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Product } from '../entities/product.entity';

export class CreateProductDto {
    @ApiProperty({ example: 'Product 1', description: 'Product name' })
    @IsNotEmpty({ message: 'Product name is required' })
    @IsString({ message: 'Product name must be a string' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    name: string;

    @ApiProperty({ example: 'Product description', description: 'Product description' })
    @IsString({ message: 'Product description must be a string' })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    description?: string;

    @ApiProperty({ example: 100.0, description: 'Product price' })
    @IsNotEmpty({ message: 'Product price is required' })
    @IsNumber({}, { message: 'Product price must be a number' })
    @Min(0, { message: 'Product price must be greater than or equal to 0' })
    price: number;

    @ApiProperty({ example: 10, description: 'Product stock' })
    @IsNotEmpty({ message: 'Product stock is required' })
    @IsNumber({}, { message: 'Product stock must be a number' })
    @Min(0, { message: 'Product stock must be greater than or equal to 0' })
    stock: number;

    @ApiProperty({ example: 'SKU12345', description: 'Product SKU' })
    @IsNotEmpty({ message: 'Product SKU is required' })
    @IsString({ message: 'Product SKU must be a string' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    sku: string;

    @ApiProperty({ example: 'https://example.com/product.jpg', description: 'Product image url' })
    @IsString({ message: 'Product image url must be a string' })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    imageUrl?: string;

    @ApiProperty({ example: true, description: 'Product is active' })
    @IsBoolean({ message: 'Product is active must be a boolean' })
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: '1', description: 'Category id' })
    @IsNotEmpty({ message: 'Category id is required' })
    @IsString({ message: 'Category id must be a string' })
    categoryId: string;
}

export class CreateProductResponseDto extends Product {}
