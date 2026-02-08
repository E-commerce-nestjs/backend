import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { isDevelopment } from '../utils/isDevelopment';
import { getAllModels } from '../utils/getAllModels';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
    constructor(){
        super({
            adapter: new PrismaPg({
                connectionString: process.env.DATABASE_URL
            }),
            log: isDevelopment() ? ['query', 'error', 'warn'] : ['error']
        })
    }

    onModuleInit() {
        this.$connect();
        console.log("Database connected");
    }

    onModuleDestroy() {
        this.$disconnect();
        console.log("Database disconnected");
    }

    async cleanDatabase() {
        if(isDevelopment()) {
           try {
            const models = getAllModels(this)
            return this.$transaction([
                ...models.map((model) => this[model].deleteMany()),
            ])
           } catch (error) {
            console.log(error)
           } 
        }else{
            throw new Error("Cannot clean database in production");
        }
    }
}
