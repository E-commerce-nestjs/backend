import { ApiProperty } from '@nestjs/swagger';
import type { Prisma } from 'generated/prisma/client';

export class Product {
    @ApiProperty({ example: '1', description: 'Product id' })
    id: string;

    @ApiProperty({ example: 'Product 1', description: 'Product name' })
    name: string;

    @ApiProperty({ example: 'Product description', description: 'Product description' })
    description?: string | null;

    @ApiProperty({ example: 100, description: 'Product price', type: Number })
    price: number | Prisma.Decimal;

    @ApiProperty({ example: 10, description: 'Product stock' })
    stock: number;

    @ApiProperty({ example: 'SKU12345', description: 'Product SKU' })
    sku: string;

    @ApiProperty({ example: 'https://example.com/product.jpg', description: 'Product image url' })
    imageUrl?: string | null;

    @ApiProperty({ example: true, description: 'Product is active' })
    isActive: boolean;

    @ApiProperty({ example: '1', description: 'Category id' })
    categoryId: string;

    @ApiProperty({ example: '2022-01-01T00:00:00.000Z', description: 'Product created at' })
    createdAt: Date;

    @ApiProperty({ example: '2022-01-01T00:00:00.000Z', description: 'Product updated at' })
    updatedAt: Date;
}
