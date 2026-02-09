import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    PrismaHealthIndicator,
    MemoryHealthIndicator,
    HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiResponse as ApiSwaggerResponse } from '@nestjs/swagger';
import { RedisHealthIndicator } from './redis.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private prismaHealth: PrismaHealthIndicator,
        private memoryHealth: MemoryHealthIndicator,
        private redisHealth: RedisHealthIndicator,
        private prisma: PrismaService,
    ) {}

    @Get()
    @HealthCheck()
    @ApiOperation({ summary: 'Health Check', description: 'Check the health status of all services' })
    @ApiSwaggerResponse({ status: 200, description: 'Health check successful' })
    @ApiSwaggerResponse({ status: 503, description: 'Service unavailable' })
    async check(): Promise<HealthCheckResult> {
        return this.health.check([
            // Database check
            () => this.prismaHealth.pingCheck('database', this.prisma),

            // Redis check
            () => this.redisHealth.isHealthy('redis'),

            // Memory check - heap should not exceed 300MB
            () => this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024),

            // Memory check - RSS should not exceed 300MB
            () => this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024),

            // Disk check disabled for development (uncomment for production)
            // () => this.diskHealth.checkStorage('disk', {
            //   path: '/',
            //   thresholdPercent: 0.5, // 50% free space for production
            // }),
        ]);
    }

    @Get('ready')
    @HealthCheck()
    @ApiOperation({ summary: 'Readiness Check', description: 'Check if the service is ready to accept traffic' })
    @ApiSwaggerResponse({ status: 200, description: 'Service is ready' })
    @ApiSwaggerResponse({ status: 503, description: 'Service is not ready' })
    async readiness(): Promise<HealthCheckResult> {
        return this.health.check([
            // Only check critical services for readiness
            () => this.prismaHealth.pingCheck('database', this.prisma),
            () => this.redisHealth.isHealthy('redis'),
        ]);
    }

    @Get('live')
    @HealthCheck()
    @ApiOperation({ summary: 'Liveness Check', description: 'Check if the service is alive' })
    @ApiSwaggerResponse({ status: 200, description: 'Service is alive' })
    async liveness(): Promise<HealthCheckResult> {
        return this.health.check([
            // Simple check to see if the service is running
            () => Promise.resolve({ liveness: { status: 'up' } }),
        ]);
    }
}
