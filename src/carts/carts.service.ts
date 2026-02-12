import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { CartResponseDto } from './dtos/cart-response.dto';
import { MergeCartItemDto } from './dtos/merge-cart.dto';
import type { Prisma } from 'generated/prisma/client';

@Injectable()
export class CartsService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Get or create cart for user
     */
    async getOrCreateCart(userId: string): Promise<CartResponseDto> {
        let cart = await this.prisma.cart.findFirst({
            where: { userId },
            include: {
                cartItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                imageUrl: true,
                                stock: true,
                                isActive: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: {
                    cartItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    imageUrl: true,
                                    stock: true,
                                    isActive: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        return this.calculateCartTotals(cart);
    }

    /**
     * Add item to cart
     */
    async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<CartResponseDto> {
        const { productId, quantity } = addToCartDto;

        // Check if product exists and is available
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (!product.isActive) {
            throw new BadRequestException('Product is not available');
        }

        if (product.stock < quantity) {
            throw new BadRequestException(`Insufficient stock. Only ${product.stock} items available`);
        }

        // Get or create cart
        let cart = await this.prisma.cart.findFirst({
            where: { userId },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
            });
        }

        // Check if item already exists in cart
        const existingCartItem = await this.prisma.cartItem.findUnique({
            where: {
                productId_cartId: {
                    productId,
                    cartId: cart.id,
                },
            },
        });

        if (existingCartItem) {
            const newQuantity = existingCartItem.quantity + quantity;

            if (product.stock < newQuantity) {
                throw new BadRequestException(`Insufficient stock. Only ${product.stock} items available`);
            }

            await this.prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }

        return this.getOrCreateCart(userId);
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(
        userId: string,
        cartItemId: string,
        updateCartItemDto: UpdateCartItemDto,
    ): Promise<CartResponseDto> {
        const { quantity } = updateCartItemDto;

        // Find cart item and verify ownership
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: true,
                product: true,
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        if (cartItem.cart.userId !== userId) {
            throw new NotFoundException('Cart item not found');
        }

        // Check stock availability
        if (cartItem.product.stock < quantity) {
            throw new BadRequestException(`Insufficient stock. Only ${cartItem.product.stock} items available`);
        }

        await this.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
        });

        return this.getOrCreateCart(userId);
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(userId: string, cartItemId: string): Promise<CartResponseDto> {
        // Find cart item and verify ownership
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: true,
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        if (cartItem.cart.userId !== userId) {
            throw new NotFoundException('Cart item not found');
        }

        await this.prisma.cartItem.delete({
            where: { id: cartItemId },
        });

        return this.getOrCreateCart(userId);
    }

    /**
     * Clear all items from cart
     */
    async clearCart(userId: string): Promise<CartResponseDto> {
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
        });

        if (cart) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }

        return this.getOrCreateCart(userId);
    }

    /**
     * Merge guest cart with user cart
     */
    async mergeCart(userId: string, guestCartItems: MergeCartItemDto[]): Promise<CartResponseDto> {
        // Get or create user cart
        let cart = await this.prisma.cart.findFirst({
            where: { userId },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
            });
        }

        // Process each guest cart item
        for (const item of guestCartItems) {
            const { productId, quantity } = item;

            // Verify product exists and is available
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
            });

            if (!product || !product.isActive) {
                continue; // Skip invalid products
            }

            // Check if item already exists in user cart
            const existingCartItem = await this.prisma.cartItem.findUnique({
                where: {
                    productId_cartId: {
                        productId,
                        cartId: cart.id,
                    },
                },
            });

            if (existingCartItem) {
                const newQuantity = existingCartItem.quantity + quantity;
                const finalQuantity = Math.min(newQuantity, product.stock);

                await this.prisma.cartItem.update({
                    where: { id: existingCartItem.id },
                    data: { quantity: finalQuantity },
                });
            } else {
                const finalQuantity = Math.min(quantity, product.stock);

                await this.prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        quantity: finalQuantity,
                    },
                });
            }
        }

        return this.getOrCreateCart(userId);
    }

    /**
     * Helper method to calculate cart totals
     */
    private calculateCartTotals(cart: any): CartResponseDto {
        let totalPrice = 0;
        let totalItems = 0;

        for (const item of cart.cartItems) {
            // Convert Prisma.Decimal to number if needed
            const price =
                typeof item.product.price === 'object' && 'toNumber' in item.product.price
                    ? item.product.price.toNumber()
                    : Number(item.product.price);
            totalPrice += price * item.quantity;
            totalItems += item.quantity;
        }

        return {
            ...cart,
            totalPrice: parseFloat(totalPrice.toFixed(2)),
            totalItems,
        };
    }
}
