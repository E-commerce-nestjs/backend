import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, CreateOrderResponseDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from 'generated/prisma/enums';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { FindAllOrderParamsDto, FindAllOrdersResponseDto } from './dtos/find-all-order.dto';
import { AppResponse, AppResponseData } from 'src/common/bases/api-response';
import { ModerateThrottle, RelaxedThrottle } from 'src/common/decorators/custom-throttler.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { createAppResponseDto } from 'src/common/dto/app-response.dto';
import { FindOrderByIdResponseDto } from './dtos/find-order-by-id.dto';
import {
    ValidationErrorResponseDto,
    ForbiddenErrorResponseDto,
    InternalServerErrorResponseDto,
    NotFoundErrorResponseDto,
    UnauthorizedErrorResponseDto,
} from 'src/common/dto/app-error-response.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @ModerateThrottle()
    @Roles(Role.USER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create order', description: 'Create a new order from cart items' })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Order created successfully',
        type: createAppResponseDto(CreateOrderResponseDto, {
            code: HttpStatus.CREATED,
            message: 'Order created successfully',
            isArray: false,
        }),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid product or insufficient stock',
        type: ValidationErrorResponseDto,
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async create(
        @CurrentUser() user: UserResponseDto,
        @Body() createOrderDto: CreateOrderDto,
    ): Promise<AppResponseData<CreateOrderResponseDto>> {
        const order = (await this.ordersService.create(user.id, createOrderDto)) as unknown as CreateOrderResponseDto;
        return AppResponse.ok<CreateOrderResponseDto>(order, 'Order created successfully');
    }

    @Get('admin')
    @RelaxedThrottle()
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all orders (Admin)', description: 'Get all orders with filters and pagination' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number', example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page', example: 10 })
    @ApiQuery({ name: 'status', enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], required: false })
    @ApiQuery({ name: 'search', type: String, required: false, description: 'Search by order number or user email' })
    @ApiQuery({ name: 'sortBy', type: String, required: false, description: 'Sort by field', example: 'createdAt' })
    @ApiQuery({ name: 'sortDirection', enum: ['asc', 'desc'], required: false, example: 'desc' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get all orders successfully',
        type: createAppResponseDto(FindAllOrdersResponseDto, {
            code: HttpStatus.OK,
            message: 'Get all orders successfully',
            isArray: true,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden', type: ForbiddenErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findAllForAdmin(@Query() query: FindAllOrderParamsDto): Promise<AppResponseData<FindAllOrdersResponseDto>> {
        const orders = await this.ordersService.findAllForAdmin(query);
        return AppResponse.ok<FindAllOrdersResponseDto>(orders, 'Get all orders successfully');
    }

    @Get('me')
    @RelaxedThrottle()
    @Roles(Role.USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get my orders', description: 'Get all orders for current user' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number', example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page', example: 10 })
    @ApiQuery({ name: 'status', enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], required: false })
    @ApiQuery({ name: 'sortBy', type: String, required: false, description: 'Sort by field', example: 'createdAt' })
    @ApiQuery({ name: 'sortDirection', enum: ['asc', 'desc'], required: false, example: 'desc' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get my orders successfully',
        type: createAppResponseDto(FindAllOrdersResponseDto, {
            code: HttpStatus.OK,
            message: 'Get my orders successfully',
            isArray: true,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findAll(
        @CurrentUser() user: UserResponseDto,
        @Query() query: FindAllOrderParamsDto,
    ): Promise<AppResponseData<FindAllOrdersResponseDto>> {
        const orders = await this.ordersService.findAll(user.id, query);
        return AppResponse.ok<FindAllOrdersResponseDto>(orders, 'Get my orders successfully');
    }

    @Get('admin/:id')
    @RelaxedThrottle()
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get order by ID (Admin)', description: 'Get order details by ID for admin' })
    @ApiParam({ name: 'id', type: String, required: true, description: 'Order ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get order successfully',
        type: createAppResponseDto(FindOrderByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Get order successfully',
            isArray: false,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden', type: ForbiddenErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findOneForAdmin(@Param('id') id: string): Promise<AppResponseData<FindOrderByIdResponseDto>> {
        const order = (await this.ordersService.findOneForAdmin(id)) as unknown as FindOrderByIdResponseDto;
        return AppResponse.ok<FindOrderByIdResponseDto>(order, 'Get order successfully');
    }

    @Get(':id')
    @RelaxedThrottle()
    @Roles(Role.USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get my order by ID', description: 'Get order details by ID for current user' })
    @ApiParam({ name: 'id', type: String, required: true, description: 'Order ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get order successfully',
        type: createAppResponseDto(FindOrderByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Get order successfully',
            isArray: false,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findOne(
        @CurrentUser() user: UserResponseDto,
        @Param('id') id: string,
    ): Promise<AppResponseData<FindOrderByIdResponseDto>> {
        const order = (await this.ordersService.findOne(user.id, id)) as unknown as FindOrderByIdResponseDto;
        return AppResponse.ok<FindOrderByIdResponseDto>(order, 'Get order successfully');
    }

    @Patch('admin/:id')
    @ModerateThrottle()
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update order (Admin)', description: 'Update order status and shipping address' })
    @ApiParam({ name: 'id', type: String, required: true, description: 'Order ID' })
    @ApiBody({ type: UpdateOrderDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Update order successfully',
        type: createAppResponseDto(FindOrderByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Update order successfully',
            isArray: false,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden', type: ForbiddenErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async updateForAdmin(
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto,
    ): Promise<AppResponseData<FindOrderByIdResponseDto>> {
        const order = (await this.ordersService.updateForAdmin(
            id,
            updateOrderDto,
        )) as unknown as FindOrderByIdResponseDto;
        return AppResponse.ok<FindOrderByIdResponseDto>(order, 'Update order successfully');
    }

    @Patch(':id')
    @ModerateThrottle()
    @Roles(Role.USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update my order',
        description: 'Update own order (cancel or update shipping address for pending orders)',
    })
    @ApiParam({ name: 'id', type: String, required: true, description: 'Order ID' })
    @ApiBody({ type: UpdateOrderDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Update order successfully',
        type: createAppResponseDto(FindOrderByIdResponseDto, {
            code: HttpStatus.OK,
            message: 'Update order successfully',
            isArray: false,
        }),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid operation (e.g. cannot cancel non-pending order)',
        type: ValidationErrorResponseDto,
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden', type: ForbiddenErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async update(
        @CurrentUser() user: UserResponseDto,
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto,
    ): Promise<AppResponseData<FindOrderByIdResponseDto>> {
        const order = (await this.ordersService.update(
            user.id,
            id,
            updateOrderDto,
        )) as unknown as FindOrderByIdResponseDto;
        return AppResponse.ok<FindOrderByIdResponseDto>(order, 'Update order successfully');
    }
}
