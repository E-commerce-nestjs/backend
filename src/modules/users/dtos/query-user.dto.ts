import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Role } from 'generated/prisma/enums';
import { UserResponseDto } from './user-response.dto';
import { PaginationDto } from 'src/modules/categories/dtos/pagination.dto';

export class QueryUserDto {
    @IsString({ message: 'Search must be a string' })
    @IsOptional()
    search?: string;

    @IsOptional()
    @IsEnum(Role, { message: 'Role must be one of the following values: ADMIN, USER' })
    role?: Role;

    @IsOptional()
    @IsString({ message: 'SortBy must be a string' })
    @IsOptional()
    sortBy?: 'email' | 'createdAt';

    @IsOptional()
    @IsString({ message: 'SortDirection must be a string' })
    sortDirection?: 'asc' | 'desc';

    @IsOptional()
    @IsNumber({}, { message: 'Page must be a number' })
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber({}, { message: 'Limit must be a number' })
    @Type(() => Number)
    @Min(1)
    limit?: number = 10;
}

export class FindAllUserResponseDto {
    data: UserResponseDto[];
    pagination: PaginationDto;
}
export class FindOneUserResponseDto extends UserResponseDto {}
