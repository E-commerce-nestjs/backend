import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
    @ApiProperty({
        description: 'Product ID to add to cart',
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
