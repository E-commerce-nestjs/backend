import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, CreateCategoryResponseDto } from './dtos/create-category.dto';
import { slugifyText } from 'src/utils/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllCategoriesResponseDto, FindAllCatParamsDto } from './dtos/find-all.dto';
import { Prisma } from 'generated/prisma/client';
import { FindCategoryByIdResponseDto } from './dtos/find-category-by-id.dto';
import { UpdateCategoryDto } from './dtos/update-caegory.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<CreateCategoryResponseDto> {
        const { name, slug, ...rest } = createCategoryDto;

        const categorySlug = slug ?? slugifyText(name);

        const category = await this.prisma.category.create({
            data: {
                name,
                slug: categorySlug,
                ...rest,
            },
        });

        return category;
    }

    async findAll(query: FindAllCatParamsDto): Promise<FindAllCategoriesResponseDto> {
        const { isActive, search, page, limit } = query;

        const where: Prisma.CategoryWhereInput = {};

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (search) {
            where.OR = [{ name: { contains: search } }, { slug: { contains: search } }];
        }

        const categories = await this.prisma.category.findMany({
            where,
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: categories,
            pagination: {
                page: 1,
                limit: 10,
                total: categories.length,
                totalPages: Math.ceil(categories.length / 10),
            },
        };
    }

    async findById(id: string): Promise<FindCategoryByIdResponseDto> {
        const category = await this.prisma.category.findUnique({
            where: {
                id,
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async findBySlug(slug: string): Promise<FindCategoryByIdResponseDto> {
        const category = await this.prisma.category.findUnique({
            where: {
                slug,
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<FindCategoryByIdResponseDto> {
        const category = await this.prisma.category.update({
            where: {
                id,
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            data: updateCategoryDto,
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async delete(id: string): Promise<FindCategoryByIdResponseDto> {
        const category = await this.prisma.category.delete({
            where: {
                id,
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }
}
