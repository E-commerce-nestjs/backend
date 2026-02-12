import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { FindAllOrderParamsDto, FindAllOrdersResponseDto } from './dtos/find-all-order.dto';
import { Prisma } from 'generated/prisma/client';
import { OrderStatus } from 'generated/prisma/enums';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
        const { items, shippingAddress } = createOrderDto;

        // Verify products
        const productIds = items.map(item => item.productId);
        const products = await this.prisma.product.findMany({
            where: {
                id: { in: productIds },
                isActive: true,
            },
        });

        if (products.length !== productIds.length) {
            throw new BadRequestException('One or more products are invalid or inactive');
        }

        // Calculate total amount
        let totalAmount = 0;
        const orderItemsWithPrice = items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                throw new BadRequestException(`Product ${item.productId} not found`);
            }
            if (product.stock < item.quantity) {
                throw new BadRequestException(`Product ${product.name} is out of stock`);
            }
            const price = Number(product.price);
            totalAmount += price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: price,
            };
        });

        // Create order in transaction
        const order = await this.prisma.$transaction(async prisma => {
            // Decrement stock
            for (const item of items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            return prisma.order.create({
                data: {
                    userId,
                    totalAmount,
                    shippingAddress,
                    orderItems: {
                        create: orderItemsWithPrice,
                    },
                },
                include: {
                    orderItems: true,
                },
            });
        });

        return order;
    }

    async findAllForAdmin(query: FindAllOrderParamsDto): Promise<FindAllOrdersResponseDto> {
        const { status, search, page = 1, limit = 10, sortBy = 'createdAt', sortDirection = 'desc' } = query;

        const where: Prisma.OrderWhereInput = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const orderBy: Prisma.OrderOrderByWithRelationInput = {};
        if (sortBy) {
            orderBy[sortBy] = sortDirection;
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    orderItems: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findAll(userId: string, query: FindAllOrderParamsDto): Promise<FindAllOrdersResponseDto> {
        const { status, page = 1, limit = 10, sortBy = 'createdAt', sortDirection = 'desc' } = query;

        const where: Prisma.OrderWhereInput = {
            userId,
        };

        if (status) {
            where.status = status;
        }

        const orderBy: Prisma.OrderOrderByWithRelationInput = {};
        if (sortBy) {
            orderBy[sortBy] = sortDirection;
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    imageUrl: true,
                                },
                            },
                        },
                    },
                },
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOneForAdmin(id: string): Promise<Order> {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    async findOne(userId: string, id: string): Promise<Order> {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId !== userId) {
            throw new NotFoundException('Order not found'); // Hide existence
        }

        return order;
    }

    async updateForAdmin(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.prisma.order.update({
            where: { id },
            data: updateOrderDto,
            include: {
                orderItems: true,
            },
        });

        // Note: Logic for refunding stock if cancelled could be added here

        return order;
    }

    async update(userId: string, id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId !== userId) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Only pending orders can be updated or cancelled');
        }

        // User can only cancel (not other status changes)
        if (updateOrderDto.status && updateOrderDto.status !== OrderStatus.CANCELLED) {
            throw new ForbiddenException('User can only cancel orders');
        }

        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: updateOrderDto,
            include: {
                orderItems: true,
            },
        });

        return updatedOrder;
    }
}
