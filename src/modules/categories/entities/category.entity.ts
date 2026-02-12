import { ApiProperty } from '@nestjs/swagger';

export class Category {
    @ApiProperty({ example: '1', description: 'Category id' })
    id: string;
    @ApiProperty({ example: 'Electronics', description: 'Category name' })
    name: string;
    @ApiProperty({ example: 'Electronics category', description: 'Category description' })
    description?: string | null;
    @ApiProperty({ example: 'electronics', description: 'Category slug' })
    slug: string;
    @ApiProperty({ example: 'https://example.com/category.jpg', description: 'Category image url' })
    imageUrl?: string | null;
    @ApiProperty({ example: true, description: 'Category is active' })
    isActive: boolean;
    @ApiProperty({ example: '2022-01-01T00:00:00.000Z', description: 'Category created at' })
    createdAt: Date;
    @ApiProperty({ example: '2022-01-01T00:00:00.000Z', description: 'Category updated at' })
    updatedAt: Date;
}
