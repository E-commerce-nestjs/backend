import { ApiProperty } from '@nestjs/swagger';
import type { Prisma } from 'generated/prisma/client';

export class CartItem {
    @ApiProperty({ example: '1', description: 'Cart item id' })
    id: string;

    @ApiProperty({ example: '1', description: 'Cart id' })
    cartId: string;

    @ApiProperty({ example: '1', description: 'Product id' })
    productId: string;

    @ApiProperty({ example: 2, description: 'Quantity' })
    quantity: number;

    @ApiProperty({
        description: 'Product details',
        type: 'object',
        properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Product Name' },
            price: { type: 'number', example: 99.99 },
            imageUrl: { type: 'string', example: 'https://example.com/image.jpg', nullable: true },
            stock: { type: 'number', example: 100 },
            isActive: { type: 'boolean', example: true },
        },
    })
    product: {
        id: string;
        name: string;
        price: number | Prisma.Decimal;
        imageUrl: string | null;
        stock: number;
        isActive: boolean;
    };

    @ApiProperty({ example: new Date().toISOString(), description: 'Created at' })
    createdAt: Date;

    @ApiProperty({ example: new Date().toISOString(), description: 'Updated at' })
    updatedAt: Date;
}

export class Cart {
    @ApiProperty({ example: '1', description: 'Cart id' })
    id: string;

    @ApiProperty({ example: '1', description: 'User id' })
    userId: string;

    @ApiProperty({ type: [CartItem], description: 'Cart items' })
    cartItems: CartItem[];

    @ApiProperty({ example: new Date().toISOString(), description: 'Created at' })
    createdAt: Date;

    @ApiProperty({ example: new Date().toISOString(), description: 'Updated at' })
    updatedAt: Date;
}
