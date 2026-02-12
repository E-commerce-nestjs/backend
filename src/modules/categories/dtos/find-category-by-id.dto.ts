import { Category } from '../entities/category.entity';

export class FindCategoryByIdResponseDto extends Category {
    _count: {
        products: number;
    };
}
