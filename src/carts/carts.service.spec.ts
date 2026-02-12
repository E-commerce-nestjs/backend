import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

describe('CartsService', () => {
    let service: CartsService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartsService,
                {
                    provide: PrismaService,
                    useValue: {
                        cart: {
                            findFirst: jest.fn(),
                            create: jest.fn(),
                        },
                        cartItem: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                        product: {
                            findUnique: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<CartsService>(CartsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getOrCreateCart', () => {
        it('should return existing cart if it exists', async () => {
            const mockCart = {
                id: '1',
                userId: 'user1',
                cartItems: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prisma.cart, 'findFirst').mockResolvedValue(mockCart as any);

            const result = await service.getOrCreateCart('user1');

            expect(result).toBeDefined();
            expect(result.id).toBe('1');
            expect(prisma.cart.findFirst).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                include: expect.any(Object),
            });
        });

        it('should create a new cart if it does not exist', async () => {
            const mockCart = {
                id: '1',
                userId: 'user1',
                cartItems: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prisma.cart, 'findFirst').mockResolvedValue(null);
            jest.spyOn(prisma.cart, 'create').mockResolvedValue(mockCart as any);

            const result = await service.getOrCreateCart('user1');

            expect(result).toBeDefined();
            expect(prisma.cart.create).toHaveBeenCalledWith({
                data: { userId: 'user1' },
                include: expect.any(Object),
            });
        });
    });
});
