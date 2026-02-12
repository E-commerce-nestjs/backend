import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
    @Transform(({ value }) => value.trim())
    @IsString({ message: 'Name must be a string' })
    @IsOptional()
    name?: string;

    @Transform(({ value }) => value.trim())
    @IsString({ message: 'Slug must be a string' })
    @IsOptional()
    slug?: string;

    @Transform(({ value }) => value.trim())
    @IsString({ message: 'Description must be a string' })
    @IsOptional()
    description?: string;

    @Transform(({ value }) => value.trim())
    @IsString({ message: 'Image URL must be a string' })
    @IsOptional()
    imageUrl?: string;

    @IsBoolean({ message: 'Is active must be a boolean' })
    @IsOptional()
    isActive?: boolean;
}
