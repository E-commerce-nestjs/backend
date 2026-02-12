import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, CreateProductResponseDto } from './dtos/create-product.dto';
import { FindAllProductParamsDto, FindAllProductsResponseDto } from './dtos/find-all-product.dto';
import { Prisma } from 'generated/prisma/client';
import { FindProductByIdResponseDto } from './dtos/find-product-by-id.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UpdateStockDto } from './dtos/update-stock.dto';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createProductDto: CreateProductDto): Promise<CreateProductResponseDto> {
        const product = await this.prisma.product.create({
            data: createProductDto,
        });

        return product;
    }

    async findAll(query: FindAllProductParamsDto): Promise<FindAllProductsResponseDto> {
        const { isActive, search, categoryId, page, limit, sortBy = 'createdAt', sortDirection = 'desc' } = query;

        const where: Prisma.ProductWhereInput = {};

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }

        const orderBy: Prisma.ProductOrderByWithRelationInput = {};

        if (sortBy === 'name') {
            orderBy.name = sortDirection;
        } else if (sortBy === 'price') {
            orderBy.price = sortDirection;
        } else if (sortBy === 'stock') {
            orderBy.stock = sortDirection;
        } else {
            orderBy.createdAt = sortDirection;
        }

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: string): Promise<FindProductByIdResponseDto> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<FindProductByIdResponseDto> {
        const product = await this.prisma.product.update({
            where: { id },
            data: updateProductDto,
            include: {
                category: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async updateStock(id: string, updateStockDto: UpdateStockDto): Promise<FindProductByIdResponseDto> {
        const product = await this.prisma.product.update({
            where: { id },
            data: { stock: updateStockDto.stock },
            include: {
                category: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async delete(id: string): Promise<FindProductByIdResponseDto> {
        const product = await this.prisma.product.delete({
            where: { id },
            include: {
                category: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }
}
