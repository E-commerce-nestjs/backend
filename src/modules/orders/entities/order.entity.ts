import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from 'generated/prisma/enums';
import type { Prisma } from 'generated/prisma/client';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class OrderItem {
    @ApiProperty({ example: '1', description: 'Order Item ID' })
    id: string;

    @ApiProperty({ example: 1, description: 'Quantity' })
    quantity: number;

    @ApiProperty({ example: 100, description: 'Price at the time of order', type: Number })
    price: number | Prisma.Decimal;

    @ApiProperty({ example: 'product-id', description: 'Product ID' })
    productId: string;

    @ApiProperty({ example: 'order-id', description: 'Order ID' })
    orderId: string;
}

export class Order {
    @ApiProperty({ example: '1', description: 'Order ID' })
    id: string;

    @ApiProperty({ example: 'ORD-12345', description: 'Order Number' })
    orderNumber: string;

    @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING, description: 'Order Status' })
    status: OrderStatus;

    @ApiProperty({ example: 200, description: 'Total Amount', type: Number })
    totalAmount: number | Prisma.Decimal;

    @ApiProperty({ example: 'user-id', description: 'User ID' })
    userId: string;

    @ApiProperty({ example: '123 Main St', description: 'Shipping Address' })
    shippingAddress: string | null;

    @ApiProperty({ type: [OrderItem], description: 'Order Items' })
    orderItems?: OrderItem[];

    @ApiProperty({ example: '2022-01-01T00:00:00.000Z', description: 'Created At' })
    createdAt: Date;

    @ApiProperty({ example: '2022-01-01T00:00:00.000Z', description: 'Updated At' })
    updatedAt: Date;
}
