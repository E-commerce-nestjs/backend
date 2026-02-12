import { Product } from '../entities/product.entity';
import { Category } from 'src/modules/categories/entities/category.entity';

export class FindProductByIdResponseDto extends Product {
    category: Category;
}
