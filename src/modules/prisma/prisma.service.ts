import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from 'generated/prisma/client';
import { getAllModels } from 'src/utils/getAllModels';
import { isDevelopment } from 'src/utils/isDevelopment';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
    constructor() {
        super({
            adapter: new PrismaPg({
                connectionString: process.env.DATABASE_URL,
            }),
            log: isDevelopment() ? ['query', 'error', 'warn'] : ['error'],
        });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Database disconnected');
    }

    async cleanDatabase() {
        if (isDevelopment()) {
            try {
                const models = getAllModels(this);
                // Cast the map result to Prisma.PrismaPromise<Prisma.BatchPayload>[] for type safety
                return this.$transaction(
                    models.map(
                        model =>
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                            (this as any)[model].deleteMany() as Prisma.PrismaPromise<Prisma.BatchPayload>,
                    ),
                );
            } catch (error) {
                console.log(error);
            }
        } else {
            throw new Error('Cannot clean database in production');
        }
    }
}
