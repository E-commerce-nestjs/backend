import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentIntentDto {
    @ApiProperty({
        example: 'cm1order123',
        description: 'Order ID to create payment for',
    })
    @IsNotEmpty({ message: 'Order ID is required' })
    @IsString()
    orderId: string;

    @ApiProperty({
        example: 99.99,
        description: 'Payment amount in the specified currency',
        minimum: 0.01,
    })
    @IsNotEmpty({ message: 'Amount is required' })
    @IsNumber()
    @Min(0.01, { message: 'Amount must be at least 0.01' })
    amount: number;

    @ApiProperty({
        example: 'usd',
        description: 'Currency code (ISO 4217)',
        default: 'usd',
        required: false,
    })
    @IsOptional()
    @IsString()
    currency?: string;
}

export class CreatePaymentIntentResponseDto {
    @ApiProperty({
        example: 'pi_1234567890abcdef_secret_1234567890',
        description: 'Stripe client secret for completing payment on client side',
    })
    clientSecret: string;

    @ApiProperty({
        example: 'cm1payment123',
        description: 'Payment record ID',
    })
    paymentId: string;
}
