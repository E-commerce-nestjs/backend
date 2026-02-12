import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentDto {
    @ApiProperty({
        example: 'pi_1234567890abcdef',
        description: 'Stripe Payment Intent ID',
    })
    @IsNotEmpty({ message: 'Payment Intent ID is required' })
    @IsString()
    paymentIntentId: string;

    @ApiProperty({
        example: 'cm1order123',
        description: 'Order ID',
    })
    @IsNotEmpty({ message: 'Order ID is required' })
    @IsString()
    orderId: string;
}
