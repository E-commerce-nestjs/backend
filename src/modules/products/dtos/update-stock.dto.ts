import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateStockDto {
    @ApiProperty({ example: 10, description: 'Product stock' })
    @IsNotEmpty({ message: 'Stock is required' })
    @IsNumber({}, { message: 'Stock must be a number' })
    @Min(0, { message: 'Stock must be greater than or equal to 0' })
    stock: number;
}
