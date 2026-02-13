import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { OrderStatus } from 'generated/prisma/enums';
import { PaginationDto } from 'src/modules/categories/dtos/pagination.dto';
import { Order } from '../entities/order.entity';

export class FindAllOrderParamsDto {
    @ApiProperty({
        enum: OrderStatus,
        required: false,
        description: 'Filter by order status',
        example: OrderStatus.PENDING,
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiProperty({
        type: String,
        required: false,
        description: 'Search by order number or user email',
        example: 'ORD-12345',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        type: Number,
        required: false,
        description: 'Page number',
        example: 1,
        default: 1,
    })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    page: number = 1;

    @ApiProperty({
        type: Number,
        required: false,
        description: 'Items per page',
        example: 10,
        default: 10,
    })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    limit: number = 10;

    @ApiProperty({
        type: String,
        required: false,
        description: 'Field to sort by',
        example: 'createdAt',
        enum: ['totalAmount', 'createdAt', 'status'],
    })
    @IsOptional()
    @IsString()
    sortBy?: 'totalAmount' | 'createdAt' | 'status';

    @ApiProperty({
        type: String,
        required: false,
        description: 'Sort direction',
        example: 'desc',
        enum: ['asc', 'desc'],
    })
    @IsOptional()
    @IsString()
    sortDirection?: 'asc' | 'desc';
}

export class FindAllOrdersResponseDto {
    data: Order[];
    pagination: PaginationDto;
}
