import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../entities/order.entity';

export class FindOrderByIdResponseDto extends Order {}
