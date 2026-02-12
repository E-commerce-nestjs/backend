import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Product } from '../entities/product.entity';
import { PaginationDto } from 'src/modules/categories/dtos/pagination.dto';
import { Category } from 'src/modules/categories/entities/category.entity';

export class FindAllProductParamsDto {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

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

    @IsOptional()
    @IsString()
    sortBy?: 'name' | 'price' | 'stock' | 'createdAt';

    @IsOptional()
    @IsString()
    sortDirection?: 'asc' | 'desc';
}

export class ProductWithCategory extends Product {
    category: Category;
}

export class FindAllProductsResponseDto {
    data: ProductWithCategory[];
    pagination: PaginationDto;
}
