import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from 'generated/prisma/enums';

export class UpdateOrderDto {
    @ApiProperty({
        enum: OrderStatus,
        example: OrderStatus.PROCESSING,
        description: 'Order Status',
        required: false,
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiProperty({
        example: '123 Main St, City, Country',
        description: 'Shipping Address',
        required: false,
    })
    @IsOptional()
    @IsString()
    shippingAddress?: string;
}
