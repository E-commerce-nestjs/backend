import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, CreateCategoryResponseDto } from './dtos/create-category.dto';
import { AppResponse, AppResponseData } from 'src/common/bases/api-response';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { createAppResponseDto } from 'src/common/dto/app-response.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from 'generated/prisma/enums';
import {
    ForbiddenErrorResponseDto,
    NotFoundErrorResponseDto,
    UnauthorizedErrorResponseDto,
    ValidationErrorResponseDto,
} from 'src/common/dto/app-error-response.dto';
import { FindAllCategoriesResponseDto, FindAllCatParamsDto } from './dtos/find-all.dto';
import { FindCategoryByIdResponseDto } from './dtos/find-category-by-id.dto';
import { UpdateCategoryDto } from './dtos/update-caegory.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    // Create category
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiBody({
        type: CreateCategoryDto,
    })
    @ApiOperation({ summary: 'Create category', description: 'Create category' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Create category successfully',
        type: createAppResponseDto(CreateCategoryResponseDto, {
            code: HttpStatus.CREATED,
            message: 'Create category successfully',
        }),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: UnauthorizedErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        type: ForbiddenErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed',
        type: ValidationErrorResponseDto,
    })
    async create(@Body() createCategoryDto: CreateCategoryDto): Promise<AppResponseData<CreateCategoryResponseDto>> {
        const data = await this.categoriesService.create(createCategoryDto);

        return AppResponse.ok<CreateCategoryResponseDto>(data, 'Create category successfully');
    }

    // Get all categories
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiQuery({
        name: 'isActive',
        description: 'Is active',
        type: Boolean,
        required: false,
        example: true,
    })
    @ApiQuery({
        name: 'page',
        description: 'Page number',
        type: Number,
        required: false,
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        description: 'Limit per page',
        type: Number,
        required: false,
        example: 10,
    })
    @ApiQuery({
        name: 'search',
        description: 'Search query',
        type: String,
        required: false,
        example: 'Category 1',
    })
    @ApiOperation({ summary: 'Get all categories', description: 'Get all categories' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get all categories successfully',
        type: createAppResponseDto(FindAllCategoriesResponseDto, {
            code: HttpStatus.OK,
            message: 'Get all categories successfully',
            isArray: true,
            example: {
                data: [
                    {
                        id: '1',
                        name: 'Category 1',
                        slug: 'category-1',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        _count: {
                            products: 0,
                        },
                        isActive: true,
                    },
                    {
                        id: '2',
                        name: 'Category 2',
                        slug: 'category-2',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        _count: {
                            products: 2,
                        },
                        isActive: true,
                    },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                },
            },
        }),
    })
    async findAll(@Query() query: FindAllCatParamsDto): Promise<AppResponseData<FindAllCategoriesResponseDto>> {
        const data = await this.categoriesService.findAll(query);

        return AppResponse.ok<FindAllCategoriesResponseDto>(data, 'Get all categories successfully');
    }

    // Get category by id
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get category by id', description: 'Get category by id' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get category by id successfully',
        type: createAppResponseDto(FindCategoryByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Get category by id successfully',
            isArray: false,
            example: {
                id: '1',
                name: 'Category 1',
                slug: 'category-1',
                createdAt: new Date(),
                updatedAt: new Date(),
                _count: {
                    products: 0,
                },
                isActive: true,
            },
        }),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Category not found',
        type: NotFoundErrorResponseDto,
    })
    async findById(@Param('id') id: string): Promise<AppResponseData<FindCategoryByIdResponseDto>> {
        const data = await this.categoriesService.findById(id);

        return AppResponse.ok<FindCategoryByIdResponseDto>(data, 'Get category by id successfully');
    }

    // Get category by slug
    @Get('slug/:slug')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get category by slug', description: 'Get category by slug' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get category by slug successfully',
        type: createAppResponseDto(FindCategoryByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Get category by slug successfully',
            isArray: false,
            example: {
                id: '1',
                name: 'Category 1',
                slug: 'category-1',
                createdAt: new Date(),
                updatedAt: new Date(),
                _count: {
                    products: 0,
                },
                isActive: true,
            },
        }),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Category not found',
        type: NotFoundErrorResponseDto,
    })
    async findBySlug(@Param('slug') slug: string): Promise<AppResponseData<FindCategoryByIdResponseDto>> {
        const data = await this.categoriesService.findBySlug(slug);

        return AppResponse.ok<FindCategoryByIdResponseDto>(data, 'Get category by slug successfully');
    }

    // Update category
    @Patch(':id')
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update category', description: 'Update category' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Update category successfully',
        type: createAppResponseDto(FindCategoryByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Update category successfully',
            isArray: false,
            example: {
                id: '1',
                name: 'Category 1',
                slug: 'category-1',
                createdAt: new Date(),
                updatedAt: new Date(),
                _count: {
                    products: 0,
                },
                isActive: true,
            },
        }),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Category not found',
        type: NotFoundErrorResponseDto,
    })
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<AppResponseData<FindCategoryByIdResponseDto>> {
        const data = await this.categoriesService.update(id, updateCategoryDto);

        return AppResponse.ok<FindCategoryByIdResponseDto>(data, 'Update category successfully');
    }

    // Delete category
    @Delete(':id')
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete category', description: 'Delete category' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Delete category successfully',
        type: createAppResponseDto(FindCategoryByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Delete category successfully',
            isArray: false,
            example: {
                id: '1',
                name: 'Category 1',
                slug: 'category-1',
                createdAt: new Date(),
                updatedAt: new Date(),
                _count: {
                    products: 0,
                },
                isActive: true,
            },
        }),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Category not found',
        type: NotFoundErrorResponseDto,
    })
    async delete(@Param('id') id: string): Promise<AppResponseData<FindCategoryByIdResponseDto>> {
        const data = await this.categoriesService.delete(id);

        return AppResponse.ok<FindCategoryByIdResponseDto>(data, 'Delete category successfully');
    }
}
