import { ApiProperty } from '@nestjs/swagger';
import { Cart, CartItem } from '../entities/cart.entity';

export class CartItemResponseDto extends CartItem {}

export class CartResponseDto extends Cart {
    @ApiProperty({
        description: 'Total price of all items in cart',
        example: 299.97,
    })
    totalPrice: number;

    @ApiProperty({
        description: 'Total number of items in cart',
        example: 5,
    })
    totalItems: number;
}
