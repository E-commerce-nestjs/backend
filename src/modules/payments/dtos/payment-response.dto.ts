import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../entities/payment.entity';

export class PaymentResponseDto extends Payment {}

export class FindAllPaymentsResponseDto {
    @ApiProperty({ type: [PaymentResponseDto] })
    data: PaymentResponseDto[];
}
