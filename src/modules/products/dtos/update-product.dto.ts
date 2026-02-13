import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
    @ApiProperty({ example: 'Product 1', description: 'Product name' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'Name must be a string' })
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Product description', description: 'Product description' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'Description must be a string' })
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 100.0, description: 'Product price' })
    @IsNumber({}, { message: 'Price must be a number' })
    @Min(0, { message: 'Price must be greater than or equal to 0' })
    @IsOptional()
    price?: number;

    @ApiProperty({ example: 10, description: 'Product stock' })
    @IsNumber({}, { message: 'Stock must be a number' })
    @Min(0, { message: 'Stock must be greater than or equal to 0' })
    @IsOptional()
    stock?: number;

    @ApiProperty({ example: 'SKU12345', description: 'Product SKU' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'SKU must be a string' })
    @IsOptional()
    sku?: string;

    @ApiProperty({ example: 'https://example.com/product.jpg', description: 'Product image url' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'Image URL must be a string' })
    @IsOptional()
    imageUrl?: string;

    @ApiProperty({ example: true, description: 'Product is active' })
    @IsBoolean({ message: 'Is active must be a boolean' })
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: '1', description: 'Category id' })
    @IsString({ message: 'Category id must be a string' })
    @IsOptional()
    categoryId?: string;
}
