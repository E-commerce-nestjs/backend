import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, CreateProductResponseDto } from './dtos/create-product.dto';
import { AppResponse, AppResponseData } from 'src/common/bases/api-response';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { createAppResponseDto } from 'src/common/dto/app-response.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from 'generated/prisma/enums';
import {
    ForbiddenErrorResponseDto,
    InternalServerErrorResponseDto,
    NotFoundErrorResponseDto,
    UnauthorizedErrorResponseDto,
    ValidationErrorResponseDto,
} from 'src/common/dto/app-error-response.dto';
import { FindAllProductParamsDto, FindAllProductsResponseDto } from './dtos/find-all-product.dto';
import { FindProductByIdResponseDto } from './dtos/find-product-by-id.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { UpdateStockDto } from './dtos/update-stock.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    // Create product
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiBody({
        type: CreateProductDto,
    })
    @ApiOperation({ summary: 'Create product', description: 'Create a new product (Admin only)' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Create product successfully',
        type: createAppResponseDto(CreateProductResponseDto, {
            code: HttpStatus.CREATED,
            message: 'Create product successfully',
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
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async create(@Body() createProductDto: CreateProductDto): Promise<AppResponseData<CreateProductResponseDto>> {
        const data = await this.productsService.create(createProductDto);
        return AppResponse.ok<CreateProductResponseDto>(data, 'Create product successfully');
    }

    // Get all products
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiQuery({
        name: 'isActive',
        description: 'Filter by active status',
        type: Boolean,
        required: false,
        example: true,
    })
    @ApiQuery({
        name: 'search',
        description: 'Search in name, description, or SKU',
        type: String,
        required: false,
        example: 'Product 1',
    })
    @ApiQuery({
        name: 'categoryId',
        description: 'Filter by category ID',
        type: String,
        required: false,
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
        description: 'Items per page',
        type: Number,
        required: false,
        example: 10,
    })
    @ApiQuery({
        name: 'sortBy',
        description: 'Sort by field',
        enum: ['name', 'price', 'stock', 'createdAt'],
        required: false,
        example: 'createdAt',
    })
    @ApiQuery({
        name: 'sortDirection',
        description: 'Sort direction',
        enum: ['asc', 'desc'],
        required: false,
        example: 'desc',
    })
    @ApiOperation({ summary: 'Get all products', description: 'Get all products with pagination and filters' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get all products successfully',
        type: createAppResponseDto(FindAllProductsResponseDto, {
            code: HttpStatus.OK,
            message: 'Get all products successfully',
            isArray: true,
            example: {
                data: [
                    {
                        id: '1',
                        name: 'Product 1',
                        description: 'Product description',
                        price: 100.0,
                        stock: 10,
                        sku: 'SKU12345',
                        imageUrl: 'https://example.com/product.jpg',
                        isActive: true,
                        categoryId: '1',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        category: {
                            id: '1',
                            name: 'Category 1',
                            slug: 'category-1',
                            isActive: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                },
            },
        }),
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findAll(@Query() query: FindAllProductParamsDto): Promise<AppResponseData<FindAllProductsResponseDto>> {
        const data = await this.productsService.findAll(query);
        return AppResponse.ok<FindAllProductsResponseDto>(data, 'Get all products successfully');
    }

    // Get product by id
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get product by id', description: 'Get product details by ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get product by id successfully',
        type: createAppResponseDto(FindProductByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Get product by id successfully',
            example: {
                id: '1',
                name: 'Product 1',
                description: 'Product description',
                price: 100.0,
                stock: 10,
                sku: 'SKU12345',
                imageUrl: 'https://example.com/product.jpg',
                isActive: true,
                categoryId: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
                category: {
                    id: '1',
                    name: 'Category 1',
                    slug: 'category-1',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
        }),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Product not found',
        type: NotFoundErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findById(@Param('id') id: string): Promise<AppResponseData<FindProductByIdResponseDto>> {
        const data = await this.productsService.findById(id);
        return AppResponse.ok<FindProductByIdResponseDto>(data, 'Get product by id successfully');
    }

    // Update product
    @Patch(':id')
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiBody({
        type: UpdateProductDto,
    })
    @ApiOperation({ summary: 'Update product', description: 'Update product details (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Update product successfully',
        type: createAppResponseDto(FindProductByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Update product successfully',
            example: {
                id: '1',
                name: 'Updated Product',
                description: 'Updated description',
                price: 150.0,
                stock: 20,
                sku: 'SKU12345',
                imageUrl: 'https://example.com/product.jpg',
                isActive: true,
                categoryId: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
                category: {
                    id: '1',
                    name: 'Category 1',
                    slug: 'category-1',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
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
        status: HttpStatus.NOT_FOUND,
        description: 'Product not found',
        type: NotFoundErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed',
        type: ValidationErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
    ): Promise<AppResponseData<FindProductByIdResponseDto>> {
        const data = await this.productsService.update(id, updateProductDto);
        return AppResponse.ok<FindProductByIdResponseDto>(data, 'Update product successfully');
    }

    // Update stock
    @Patch(':id/stock')
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiBody({
        type: UpdateStockDto,
    })
    @ApiOperation({ summary: 'Update product stock', description: 'Update product stock quantity (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Update stock successfully',
        type: createAppResponseDto(FindProductByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Update stock successfully',
            example: {
                id: '1',
                name: 'Product 1',
                description: 'Product description',
                price: 100.0,
                stock: 50,
                sku: 'SKU12345',
                imageUrl: 'https://example.com/product.jpg',
                isActive: true,
                categoryId: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
                category: {
                    id: '1',
                    name: 'Category 1',
                    slug: 'category-1',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
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
        status: HttpStatus.NOT_FOUND,
        description: 'Product not found',
        type: NotFoundErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation failed',
        type: ValidationErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async updateStock(
        @Param('id') id: string,
        @Body() updateStockDto: UpdateStockDto,
    ): Promise<AppResponseData<FindProductByIdResponseDto>> {
        const data = await this.productsService.updateStock(id, updateStockDto);
        return AppResponse.ok<FindProductByIdResponseDto>(data, 'Update stock successfully');
    }

    // Delete product
    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete product', description: 'Delete a product (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Delete product successfully',
        type: createAppResponseDto(FindProductByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Delete product successfully',
            example: {
                id: '1',
                name: 'Product 1',
                description: 'Product description',
                price: 100.0,
                stock: 10,
                sku: 'SKU12345',
                imageUrl: 'https://example.com/product.jpg',
                isActive: true,
                categoryId: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
                category: {
                    id: '1',
                    name: 'Category 1',
                    slug: 'category-1',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
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
        status: HttpStatus.NOT_FOUND,
        description: 'Product not found',
        type: NotFoundErrorResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async delete(@Param('id') id: string): Promise<AppResponseData<FindProductByIdResponseDto>> {
        const data = await this.productsService.delete(id);
        return AppResponse.ok<FindProductByIdResponseDto>(data, 'Delete product successfully');
    }
}
