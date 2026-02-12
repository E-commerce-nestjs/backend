import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto, CreatePaymentIntentResponseDto } from './dtos/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dtos/confirm-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from 'generated/prisma/enums';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { AppResponse, AppResponseData } from 'src/common/bases/api-response';
import { StrictThrottle, RelaxedThrottle } from 'src/common/decorators/custom-throttler.decorator';
import { PaymentResponseDto } from './dtos/payment-response.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { createAppResponseDto } from 'src/common/dto/app-response.dto';
import {
    ValidationErrorResponseDto,
    ForbiddenErrorResponseDto,
    InternalServerErrorResponseDto,
    NotFoundErrorResponseDto,
    UnauthorizedErrorResponseDto,
} from 'src/common/dto/app-error-response.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('create-intent')
    @StrictThrottle()
    @Roles(Role.USER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create payment intent',
        description:
            'Create a Stripe payment intent for an order. Returns client secret for completing payment on client side.',
    })
    @ApiBody({ type: CreatePaymentIntentDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Payment intent created successfully',
        type: createAppResponseDto(CreatePaymentIntentResponseDto, {
            code: HttpStatus.CREATED,
            message: 'Payment intent created successfully',
            isArray: false,
        }),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid data, order not found, or payment already completed',
        type: ValidationErrorResponseDto,
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async createPaymentIntent(
        @Body() createPaymentIntentDto: CreatePaymentIntentDto,
        @CurrentUser() user: UserResponseDto,
    ): Promise<AppResponseData<CreatePaymentIntentResponseDto>> {
        const data = await this.paymentsService.createPaymentIntent(user.id, createPaymentIntentDto);
        return AppResponse.ok<CreatePaymentIntentResponseDto>(data, 'Payment intent created successfully');
    }

    @Post('confirm')
    @StrictThrottle()
    @Roles(Role.USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Confirm payment',
        description:
            'Confirm a payment intent after successful payment on client side. Updates payment and order status.',
    })
    @ApiBody({ type: ConfirmPaymentDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment confirmed successfully',
        type: createAppResponseDto(PaymentResponseDto, {
            code: HttpStatus.OK,
            message: 'Payment confirmed successfully',
            isArray: false,
        }),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Payment not found, already completed, or not successful on Stripe',
        type: ValidationErrorResponseDto,
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async confirmPayment(
        @Body() confirmPaymentDto: ConfirmPaymentDto,
        @CurrentUser() user: UserResponseDto,
    ): Promise<AppResponseData<PaymentResponseDto>> {
        const data = await this.paymentsService.confirmPayment(user.id, confirmPaymentDto);
        return AppResponse.ok<PaymentResponseDto>(data, 'Payment confirmed successfully');
    }

    @Get()
    @RelaxedThrottle()
    @Roles(Role.USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all payments',
        description: 'Get all payments for the current user, ordered by creation date (newest first)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payments retrieved successfully',
        type: createAppResponseDto(PaymentResponseDto, {
            code: HttpStatus.OK,
            message: 'Payments retrieved successfully',
            isArray: true,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findAll(@CurrentUser() user: UserResponseDto): Promise<AppResponseData<PaymentResponseDto[]>> {
        const data = await this.paymentsService.findAll(user.id);
        return AppResponse.ok<PaymentResponseDto[]>(data, 'Payments retrieved successfully');
    }

    @Get('order/:orderId')
    @RelaxedThrottle()
    @Roles(Role.USER)
    @HttpCode(HttpStatus.OK)
    @ApiParam({
        name: 'orderId',
        description: 'Order ID',
        example: 'cm1order123',
    })
    @ApiOperation({
        summary: 'Get payment by order ID',
        description: 'Get payment information for a specific order',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment retrieved successfully',
        type: createAppResponseDto(PaymentResponseDto, {
            code: HttpStatus.OK,
            message: 'Payment retrieved successfully',
            isArray: false,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findByOrder(
        @Param('orderId') orderId: string,
        @CurrentUser() user: UserResponseDto,
    ): Promise<AppResponseData<PaymentResponseDto | null>> {
        const data = await this.paymentsService.findByOrder(orderId, user.id);
        return AppResponse.ok<PaymentResponseDto | null>(data, 'Payment retrieved successfully');
    }

    @Get(':id')
    @RelaxedThrottle()
    @Roles(Role.USER)
    @HttpCode(HttpStatus.OK)
    @ApiParam({
        name: 'id',
        description: 'Payment ID',
        example: 'cm1payment123',
    })
    @ApiOperation({
        summary: 'Get payment by ID',
        description: 'Get a specific payment by its ID',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment retrieved successfully',
        type: createAppResponseDto(PaymentResponseDto, {
            code: HttpStatus.OK,
            message: 'Payment retrieved successfully',
            isArray: false,
        }),
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: UnauthorizedErrorResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found', type: NotFoundErrorResponseDto })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: InternalServerErrorResponseDto,
    })
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: UserResponseDto,
    ): Promise<AppResponseData<PaymentResponseDto>> {
        const data = await this.paymentsService.findOne(id, user.id);
        return AppResponse.ok<PaymentResponseDto>(data, 'Payment retrieved successfully');
    }
}
