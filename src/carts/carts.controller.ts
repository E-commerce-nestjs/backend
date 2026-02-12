import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { CartResponseDto } from './dtos/cart-response.dto';
import { MergeCartDto } from './dtos/merge-cart.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/auth.guard';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { AppResponse, AppResponseData } from 'src/common/bases/api-response';
import { createAppResponseDto } from 'src/common/dto/app-response.dto';
import {
    BadRequestErrorResponseDto,
    InternalServerErrorResponseDto,
    NotFoundErrorResponseDto,
    UnauthorizedErrorResponseDto,
} from 'src/common/dto/app-error-response.dto';

@ApiTags('Carts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartsController {
    constructor(private readonly cartService: CartsService) {}

    /**
     * Get current user cart
     * GET /cart
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get current user cart' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User cart with items',
        type: createAppResponseDto(CartResponseDto, {
            code: HttpStatus.OK,
            message: 'Get cart successfully',
            isArray: false,
        }),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: UnauthorizedErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async getCart(@User('id') userId: string): Promise<AppResponseData<CartResponseDto>> {
        const cart = await this.cartService.getOrCreateCart(userId);
        return AppResponse.ok<CartResponseDto>(cart, 'Get cart successfully');
    }

    /**
     * Add item to cart
     * POST /cart/items
     */
    @Post('items')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add item to cart' })
    @ApiBody({ type: AddToCartDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Item added to cart',
        type: createAppResponseDto(CartResponseDto, {
            code: HttpStatus.CREATED,
            message: 'Item added to cart successfully',
            isArray: false,
        }),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Product unavailable or insufficient stock',
        type: BadRequestErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Product not found',
        type: NotFoundErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: UnauthorizedErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async addToCart(
        @User('id') userId: string,
        @Body() addToCartDto: AddToCartDto,
    ): Promise<AppResponseData<CartResponseDto>> {
        const cart = await this.cartService.addToCart(userId, addToCartDto);
        return AppResponse.ok<CartResponseDto>(cart, 'Item added to cart successfully');
    }

    /**
     * Update cart item quantity
     * PATCH /cart/items/:id
     */
    @Patch('items/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update cart item quantity' })
    @ApiParam({ name: 'id', type: String, required: true, description: 'Cart item ID' })
    @ApiBody({ type: UpdateCartItemDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Cart item updated',
        type: createAppResponseDto(CartResponseDto, {
            code: HttpStatus.OK,
            message: 'Cart item updated successfully',
            isArray: false,
        }),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Insufficient stock',
        type: BadRequestErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Cart item not found',
        type: NotFoundErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: UnauthorizedErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async updateCartItem(
        @User('id') userId: string,
        @Param('id') id: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ): Promise<AppResponseData<CartResponseDto>> {
        const cart = await this.cartService.updateCartItem(userId, id, updateCartItemDto);
        return AppResponse.ok<CartResponseDto>(cart, 'Cart item updated successfully');
    }

    /**
     * Remove item from cart
     * DELETE /cart/items/:id
     */
    @Delete('items/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove item from cart' })
    @ApiParam({ name: 'id', type: String, required: true, description: 'Cart item ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Item removed from cart',
        type: createAppResponseDto(CartResponseDto, {
            code: HttpStatus.OK,
            message: 'Item removed from cart successfully',
            isArray: false,
        }),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Cart item not found',
        type: NotFoundErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: UnauthorizedErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async removeFromCart(
        @User('id') userId: string,
        @Param('id') id: string,
    ): Promise<AppResponseData<CartResponseDto>> {
        const cart = await this.cartService.removeFromCart(userId, id);
        return AppResponse.ok<CartResponseDto>(cart, 'Item removed from cart successfully');
    }

    /**
     * Clear all items from cart
     * DELETE /cart
     */
    @Delete()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Clear all items from cart' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Cart cleared',
        type: createAppResponseDto(CartResponseDto, {
            code: HttpStatus.OK,
            message: 'Cart cleared successfully',
            isArray: false,
        }),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: UnauthorizedErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async clearCart(@User('id') userId: string): Promise<AppResponseData<CartResponseDto>> {
        const cart = await this.cartService.clearCart(userId);
        return AppResponse.ok<CartResponseDto>(cart, 'Cart cleared successfully');
    }

    /**
     * Merge guest cart with user cart
     * POST /cart/merge
     */
    @Post('merge')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Merge guest cart into user cart' })
    @ApiBody({ type: MergeCartDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Merged cart',
        type: createAppResponseDto(CartResponseDto, {
            code: HttpStatus.OK,
            message: 'Cart merged successfully',
            isArray: false,
        }),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: UnauthorizedErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async mergeCart(
        @User('id') userId: string,
        @Body() mergeCartDto: MergeCartDto,
    ): Promise<AppResponseData<CartResponseDto>> {
        const cart = await this.cartService.mergeCart(userId, mergeCartDto.items);
        return AppResponse.ok<CartResponseDto>(cart, 'Cart merged successfully');
    }
}
