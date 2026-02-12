import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from '@keyv/redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;

    constructor(private configService: ConfigService) {}

    async onModuleInit() {
        this.client = createClient({
            url: this.configService.get<string>('REDIS_URI'),
        });

        this.client.on('error', err => console.error('Redis Client Error', err));

        await this.client.connect();
        console.log('Redis connected');
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    getClient(): RedisClientType {
        return this.client;
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        await this.client.set(key, value);
        if (ttl) {
            await this.client.expire(key, ttl);
        }
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async setex(key: string, ttl: number, value: string): Promise<void> {
        await this.client.setEx(key, ttl, value);
    }

    async ping(): Promise<string> {
        return this.client.ping();
    }
}
