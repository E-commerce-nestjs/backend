import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Order } from '../entities/order.entity';

export class CreateOrderItemDto {
    @ApiProperty({
        example: 'cm1abc123def456ghi',
        description: 'Product ID',
    })
    @IsNotEmpty({ message: 'Product ID is required' })
    @IsString()
    productId: string;

    @ApiProperty({
        example: 2,
        description: 'Quantity of product to order',
        minimum: 1,
    })
    @IsNotEmpty({ message: 'Quantity is required' })
    @IsNumber()
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({
        type: [CreateOrderItemDto],
        description: 'List of order items',
        example: [
            {
                productId: 'cm1abc123def456ghi',
                quantity: 2,
            },
            {
                productId: 'cm1xyz789uvw012rst',
                quantity: 1,
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @ApiProperty({
        example: '123 Main St, Apt 4B, New York, NY 10001',
        description: 'Shipping Address (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    shippingAddress?: string;
}

export class CreateOrderResponseDto extends Order {}
