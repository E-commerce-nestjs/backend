import { Type } from 'class-transformer';
import { Category } from '../entities/category.entity';
import { type PaginationDto } from './pagination.dto';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FindAllCatParamsDto {
    @IsOptional()
    @IsBoolean()
    isActive: boolean;

    @IsOptional()
    @IsString()
    search: string;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    page: number = 1;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    limit: number = 10;
}

export class FindAllCategoriesResponseDto {
    data: (Category & { _count: { products: number } })[];
    pagination: PaginationDto;
}
