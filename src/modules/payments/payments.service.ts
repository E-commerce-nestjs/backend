import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentIntentDto, CreatePaymentIntentResponseDto } from './dtos/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dtos/confirm-payment.dto';
import { PaymentResponseDto } from './dtos/payment-response.dto';
import { PaymentStatus } from 'generated/prisma/enums';
import Stripe from 'stripe';
import type { Prisma } from 'generated/prisma/client';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(private readonly prisma: PrismaService) {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
        }
        this.stripe = new Stripe(stripeKey, {
            apiVersion: '2026-01-28.clover',
        });
    }

    async createPaymentIntent(
        userId: string,
        createPaymentIntentDto: CreatePaymentIntentDto,
    ): Promise<CreatePaymentIntentResponseDto> {
        const { orderId, amount, currency = 'usd' } = createPaymentIntentDto;

        // Verify order exists and belongs to user
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // Check if payment already exists for this order
        const existingPayment = await this.prisma.payment.findFirst({
            where: { orderId },
        });

        if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
            throw new BadRequestException('Payment already completed for this order');
        }

        // Create Stripe Payment Intent
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: { orderId, userId },
        });

        // Create or update payment record
        const payment = existingPayment
            ? await this.prisma.payment.update({
                  where: { id: existingPayment.id },
                  data: {
                      amount,
                      currency,
                      transactionId: paymentIntent.id,
                      status: PaymentStatus.PENDING,
                  },
              })
            : await this.prisma.payment.create({
                  data: {
                      orderId,
                      userId,
                      amount,
                      currency,
                      status: PaymentStatus.PENDING,
                      paymentMethod: 'STRIPE',
                      transactionId: paymentIntent.id,
                  },
              });

        return {
            clientSecret: paymentIntent.client_secret!,
            paymentId: payment.id,
        };
    }

    async confirmPayment(userId: string, confirmPaymentDto: ConfirmPaymentDto): Promise<PaymentResponseDto> {
        const { paymentIntentId, orderId } = confirmPaymentDto;

        // Find payment
        const payment = await this.prisma.payment.findFirst({
            where: {
                orderId,
                userId,
                transactionId: paymentIntentId,
            },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            throw new BadRequestException('Payment already completed');
        }

        // Verify payment with Stripe
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            throw new BadRequestException('Payment not successful on Stripe');
        }

        // Update payment and order in transaction
        const [updatedPayment] = await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: PaymentStatus.COMPLETED },
            }),
            this.prisma.order.update({
                where: { id: orderId },
                data: { status: 'PROCESSING' },
            }),
        ]);

        return this.mapToPaymentResponse(updatedPayment);
    }

    async findAll(userId: string): Promise<PaymentResponseDto[]> {
        const payments = await this.prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return payments.map(payment => this.mapToPaymentResponse(payment));
    }

    async findOne(id: string, userId: string): Promise<PaymentResponseDto> {
        const payment = await this.prisma.payment.findFirst({
            where: { id, userId },
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        return this.mapToPaymentResponse(payment);
    }

    async findByOrder(orderId: string, userId: string): Promise<PaymentResponseDto | null> {
        const payment = await this.prisma.payment.findFirst({
            where: { orderId, userId },
        });

        return payment ? this.mapToPaymentResponse(payment) : null;
    }

    private mapToPaymentResponse(payment: {
        id: string;
        orderId: string;
        userId: string;
        amount: Prisma.Decimal;
        currency: string;
        status: PaymentStatus;
        paymentMethod: string | null;
        transactionId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): PaymentResponseDto {
        return {
            id: payment.id,
            orderId: payment.orderId,
            userId: payment.userId,
            currency: payment.currency,
            amount: Number(payment.amount),
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        };
    }
}
