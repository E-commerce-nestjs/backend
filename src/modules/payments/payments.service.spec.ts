import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PaymentsService', () => {
    let service: PaymentsService;

    const originalEnv = process.env;

    beforeEach(async () => {
        jest.resetModules();
        process.env = { ...originalEnv, STRIPE_SECRET_KEY: 'test_key' };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                {
                    provide: PrismaService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
