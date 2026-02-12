import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class MergeCartItemDto {
    @ApiProperty({
        description: 'Product ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID('4', { message: 'Product ID must be a valid UUID' })
    @IsString({ message: 'Product ID must be a string' })
    productId: string;

    @ApiProperty({
        description: 'Quantity of the product',
        example: 2,
        minimum: 1,
    })
    @IsInt({ message: 'Quantity must be an integer' })
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;
}

export class MergeCartDto {
    @ApiProperty({
        description: 'Array of cart items to merge',
        type: [MergeCartItemDto],
        example: [
            { productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 2 },
            { productId: '223e4567-e89b-12d3-a456-426614174001', quantity: 1 },
        ],
    })
    @IsArray({ message: 'Items must be an array' })
    @ValidateNested({ each: true })
    @Type(() => MergeCartItemDto)
    items: MergeCartItemDto[];
}
