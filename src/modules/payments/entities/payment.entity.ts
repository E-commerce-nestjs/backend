import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from 'generated/prisma/enums';
import type { Prisma } from 'generated/prisma/client';

export class Payment {
    @ApiProperty({ example: 'cm1abc123def456ghi', description: 'Payment ID' })
    id: string;

    @ApiProperty({ example: 'cm1order123', description: 'Order ID' })
    orderId: string;

    @ApiProperty({ example: 'cm1user123', description: 'User ID' })
    userId: string;

    @ApiProperty({ example: 100, description: 'Payment Amount', type: Number })
    amount: number | Prisma.Decimal;

    @ApiProperty({ example: 'usd', description: 'Currency code (ISO 4217)' })
    currency: string;

    @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.COMPLETED, description: 'Payment Status' })
    status: PaymentStatus;

    @ApiProperty({ example: 'STRIPE', description: 'Payment method/provider', nullable: true })
    paymentMethod: string | null;

    @ApiProperty({ example: 'pi_1234567890abcdef', description: 'Stripe Payment Intent ID', nullable: true })
    transactionId: string | null;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Created At' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Updated At' })
    updatedAt: Date;
}
