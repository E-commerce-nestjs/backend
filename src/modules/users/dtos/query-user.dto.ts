import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Role } from 'generated/prisma/enums';

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
    page?: number = 1;

    @IsOptional()
    @IsNumber({}, { message: 'Limit must be a number' })
    @Type(() => Number)
    limit?: number = 10;
}
