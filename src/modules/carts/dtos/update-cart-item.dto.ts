import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
    @ApiProperty({
        description: 'New quantity for the cart item',
        example: 3,
        minimum: 1,
    })
    @IsInt({ message: 'Quantity must be an integer' })
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;
}
